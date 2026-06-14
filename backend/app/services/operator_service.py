import json
import logging
from typing import AsyncGenerator, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
import asyncio

from app.core.config import get_settings
from app.models.user import User
from app.models.customer import Customer
from app.models.campaign import Campaign
from app.models.segment import Segment
from app.schemas.segment import SegmentFilter
from app.services.analytics_service import get_overview, get_channel_performance
from app.services.segment_service import apply_filters, create_segment as db_create_segment, get_segments

logger = logging.getLogger(__name__)
settings = get_settings()

# Tools Configuration
OPERATOR_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_analytics_summary",
            "description": "Get a high-level summary of CRM analytics, including total customers, revenue, and active campaigns.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_existing_segments",
            "description": "Retrieve a list of all existing customer segments that have already been created in the CRM.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_customers",
            "description": "Simulate a segment to see how many customers match specific filters without creating the segment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filters": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "field": {"type": "string", "description": "Must be one of: total_spend, order_count, product_category, product_name, city, last_purchase_days"},
                                "operator": {"type": "string", "description": "Must be one of: >, <, >=, <=, =, in, not_in"},
                                "value": {"type": ["string", "number", "array"]}
                            }
                        }
                    }
                },
                "required": ["filters"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_segment",
            "description": "Create a new audience segment in the CRM. REQUIRES USER APPROVAL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "The name of the segment"},
                    "description": {"type": "string", "description": "A short description of what this segment targets"},
                    "filters": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "field": {"type": "string"},
                                "operator": {"type": "string"},
                                "value": {"type": ["string", "number", "array"]}
                            }
                        }
                    }
                },
                "required": ["name", "description", "filters"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "draft_campaign",
            "description": "Create a new draft campaign for a specific segment. REQUIRES USER APPROVAL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Campaign name"},
                    "segment_id": {"type": "integer", "description": "The ID of the segment to target"},
                    "channel": {"type": "string", "enum": ["EMAIL", "SMS", "WHATSAPP", "RCS"]},
                    "subject": {"type": "string", "description": "Subject line for emails, or brief intro for messages"},
                    "message": {"type": "string", "description": "The main content of the campaign"}
                },
                "required": ["name", "segment_id", "channel", "message"]
            }
        }
    }
]

# Read-only tools that the backend executes automatically
AUTO_EXECUTE_TOOLS = ["get_analytics_summary", "get_existing_segments", "query_customers"]


async def _get_async_client():
    provider = settings.AI_PROVIDER.lower()
    if provider == "groq":
        from groq import AsyncGroq
        return AsyncGroq(api_key=settings.GROQ_API_KEY), "llama-3.3-70b-versatile"
    else:
        from openai import AsyncOpenAI
        return AsyncOpenAI(api_key=settings.OPENAI_API_KEY), "gpt-4o-mini"


async def execute_tool(tool_name: str, arguments: dict, db: AsyncSession, user: User) -> dict:
    """Executes a tool call and returns the JSON serializable result."""
    try:
        if tool_name == "get_analytics_summary":
            overview = await get_overview(db)
            channels = await get_channel_performance(db)
            return {"overview": overview, "channels": channels}
            
        elif tool_name == "get_existing_segments":
            segments = await get_segments(db)
            return {
                "segments": [
                    {
                        "id": s.id, 
                        "name": s.name, 
                        "description": s.description, 
                        "customer_count": s.customer_count,
                        "created_at": str(s.created_at)
                    } for s in segments
                ]
            }
            
        elif tool_name == "query_customers":
            filters_data = arguments.get("filters", [])
            valid_fields = {"total_spend", "order_count", "product_category", "product_name", "city", "last_purchase_days"}
            for f in filters_data:
                if f.get("field") not in valid_fields:
                    return {"error": f"Invalid field '{f.get('field')}'. Must be one of: {', '.join(valid_fields)}"}

            filters = [SegmentFilter(**f) for f in filters_data]
            matched_ids = await apply_filters(db, filters)
            count = len(matched_ids)
            return {"matched_customers": count, "filters_applied": filters_data}
            
        elif tool_name == "create_segment":
            filters_data = arguments["filters"]
            valid_fields = {"total_spend", "order_count", "product_category", "product_name", "city", "last_purchase_days"}
            for f in filters_data:
                if f.get("field") not in valid_fields:
                    return {"error": f"Invalid field '{f.get('field')}'. Must be one of: {', '.join(valid_fields)}"}

            filters = [SegmentFilter(**f) for f in filters_data]
            segment = await db_create_segment(
                db=db,
                name=arguments["name"],
                description=arguments.get("description", ""),
                filters=filters,
                user_id=user.id
            )
            await db.commit() # Ensure committed
            return {"status": "success", "segment_id": segment.id, "customer_count": segment.customer_count}
            
        elif tool_name == "draft_campaign":
            # Fetch audience size
            segment = await db.get(Segment, arguments["segment_id"])
            audience_size = segment.customer_count if segment else 0
            
            campaign = Campaign(
                name=arguments["name"],
                segment_id=arguments["segment_id"],
                channel=arguments["channel"].upper(),
                status="DRAFT",
                subject=arguments.get("subject"),
                generated_message=arguments["message"],
                audience_size=audience_size,
                created_by=user.id,
            )
            db.add(campaign)
            await db.commit()
            await db.refresh(campaign)
            return {"status": "success", "campaign_id": campaign.id, "audience_size": audience_size}
            
        else:
            return {"error": f"Unknown tool {tool_name}"}
    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {e}")
        return {"error": str(e)}


async def stream_operator_chat(messages: List[Dict[str, Any]], db: AsyncSession, user: User) -> AsyncGenerator[str, None]:
    """
    Streams Server-Sent Events (SSE) back to the frontend.
    Handles automatic tool execution for read-only tools and prompts for HITL for write tools.
    """
    client, model = await _get_async_client()
    
    system_prompt = """You are FitStyle AI Operator, a highly capable marketing operations agent built directly into the CRM.
Your job is to analyze data, find opportunities, suggest actions, and execute workflows.
You must use the provided tools to fetch real data before making recommendations.
When a user asks to find something, ALWAYS use `query_customers` to get the exact count before suggesting a segment.
When a user wants to create a segment or campaign, use the appropriate tools.
DO NOT hallucinate data. If you don't know, use a tool to find out.
Always be extremely professional, brief, and action-oriented. Format output in Markdown with bullet points where appropriate.
CRITICAL: When you finish your response, if there are logical next steps (like creating a segment or campaign), output exactly 2 or 3 short follow-up actions as a JSON array inside <suggestions> tags at the very end of your message. Example: <suggestions>["Create this segment", "Show analytics"]</suggestions>"""

    # Ensure system prompt is first
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": system_prompt})
        
    max_loops = 5
    loop_count = 0
    
    while loop_count < max_loops:
        loop_count += 1
        
        try:
            stream = await client.chat.completions.create(
                model=model,
                messages=messages,
                tools=OPERATOR_TOOLS,
                tool_choice="auto",
                stream=True,
                temperature=0.4,
            )
            
            tool_calls = {}
            content = ""
            
            async for chunk in stream:
                delta = chunk.choices[0].delta
                
                # Stream text content
                if delta.content:
                    content += delta.content
                    # Yield token to frontend
                    yield f"data: {json.dumps({'type': 'token', 'content': delta.content})}\n\n"
                    
                # Accumulate tool calls
                if delta.tool_calls:
                    for tc in delta.tool_calls:
                        if tc.index not in tool_calls:
                            tool_calls[tc.index] = {
                                "id": tc.id,
                                "type": "function",
                                "function": {"name": tc.function.name, "arguments": ""}
                            }
                        if tc.function.arguments:
                            tool_calls[tc.index]["function"]["arguments"] += tc.function.arguments

            # Add assistant's response to history
            if content or tool_calls:
                assistant_msg = {"role": "assistant"}
                if content:
                    assistant_msg["content"] = content
                if tool_calls:
                    # Format tool calls for OpenAI schema
                    assistant_msg["tool_calls"] = list(tool_calls.values())
                messages.append(assistant_msg)
                
                # Also yield the final assistant message so frontend can update its state
                yield f"data: {json.dumps({'type': 'message_complete', 'message': assistant_msg})}\n\n"

            if not tool_calls:
                # No more tools to call, we are done
                break
                
            # Process tool calls
            for tc in tool_calls.values():
                tool_id = tc["id"]
                tool_name = tc["function"]["name"]
                try:
                    tool_args = json.loads(tc["function"]["arguments"])
                except json.JSONDecodeError:
                    tool_args = {}
                    
                if tool_name in AUTO_EXECUTE_TOOLS:
                    # Notify frontend we are executing a background task
                    yield f"data: {json.dumps({'type': 'status', 'message': f'Running {tool_name}...'})}\n\n"
                    
                    # Execute immediately
                    result = await execute_tool(tool_name, tool_args, db, user)
                    
                    # Append result to messages and loop back to LLM
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_id,
                        "name": tool_name,
                        "content": json.dumps(result)
                    })
                    
                else:
                    # Write operation! Requires Human-in-the-Loop (HITL)
                    yield f"data: {json.dumps({'type': 'proposal', 'tool_call_id': tool_id, 'tool_name': tool_name, 'arguments': tool_args})}\n\n"
                    # Break entirely to wait for user approval via a separate API request
                    return

        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': 'An error occurred while connecting to the AI provider.'})}\n\n"
            break

    yield "data: [DONE]\n\n"
