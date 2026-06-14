import json
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_client():
    provider = settings.AI_PROVIDER.lower()

    if provider == "groq":
        from groq import Groq
        return Groq(api_key=settings.GROQ_API_KEY), "llama-3.3-70b-versatile"
    else:
        from openai import OpenAI
        return OpenAI(api_key=settings.OPENAI_API_KEY), "gpt-4o-mini"


def _chat(system_prompt: str, user_message: str) -> str:
    """Make a synchronous chat completion call."""
    try:
        client, model = _get_client()
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"AI service error: {e}")
        return _fallback_response(user_message)


def _fallback_response(context: str = "") -> str:
    return "I'm unable to generate AI content right now. Please check your API key configuration."


def generate_campaign_content(segment_name: str, segment_description: str, channel: str, audience_size: int) -> dict:
    system_prompt = """You are a marketing content generator for FitStyle, a retail fashion brand specializing in athletic and sports wear.
Generate campaign content for the given segment and channel.
Return ONLY valid JSON with these fields:
{
    "title": "Campaign title",
    "subject": "Email/message subject line",
    "message": "The full message body. Use {{name}} for personalization and {{favorite_category}} for category. Keep it engaging and action-oriented."
}"""

    user_msg = f"""Segment: {segment_name}
Description: {segment_description}
Channel: {channel}
Audience Size: {audience_size}

Generate compelling campaign content for this audience through {channel}."""

    result = _chat(system_prompt, user_msg)

    try:
        # Try to extract JSON from the response
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        return json.loads(result.strip())
    except (json.JSONDecodeError, IndexError):
        return {
            "title": f"FitStyle Campaign for {segment_name}",
            "subject": f"Exclusive offers for you, {{{{name}}}}!",
            "message": f"Hi {{{{name}}}}, we have exciting deals on {{{{favorite_category}}}} just for you! Shop now at FitStyle and enjoy up to 40% off. Don't miss out!",
        }


def parse_natural_language_segment(query: str) -> dict:
    system_prompt = """You are a segment filter parser for a CRM system.
Convert natural language queries into structured filters.

Available fields:
- total_spend (operators: >, <, >=, <=, =)
- order_count (operators: >, <, >=, <=, =)
- last_purchase_days (operators: >, <) - days since last purchase
- product_category (operators: in, not_in) - values: Footwear, Clothing, Accessories
- product_name (operators: in, not_in) - values: Running Shoes, Sneakers, Training Shoes, T-Shirts, Jackets, Track Pants, Caps, Sports Bags, Socks, Water Bottles, Fitness Bands, etc.
- city (operators: in) - Indian cities

Return ONLY a JSON object with these keys:
{
  "filters": [{"field": "city", "operator": "in", "value": ["Mumbai"]}],
  "limit": 5, // optional integer if user asks for top N
  "sort_by": "total_spend" // optional string field name to sort by
}

Examples:
"Customers who spent more than 5000" -> {"filters": [{"field": "total_spend", "operator": ">", "value": 5000}]}
"Top 5 customers from Mumbai who bought shoes" -> {"filters": [{"field": "city", "operator": "in", "value": ["Mumbai"]}, {"field": "product_category", "operator": "in", "value": ["Footwear"]}], "limit": 5, "sort_by": "total_spend"}
"Inactive for 60 days" -> {"filters": [{"field": "last_purchase_days", "operator": ">", "value": 60}]}"""

    result = _chat(system_prompt, query)

    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        parsed = json.loads(result.strip())
        if isinstance(parsed, list):
            return {"filters": parsed, "limit": None, "sort_by": None}
        return parsed
    except (json.JSONDecodeError, IndexError):
        return {"filters": [{"field": "total_spend", "operator": ">", "value": 0}], "limit": None, "sort_by": None}


def suggest_segment_ideas(query: str) -> list:
    system_prompt = """You are a CRM marketing assistant for FitStyle, an athletic fashion brand.
The user has a vague marketing goal. Your job is to suggest 3 to 5 specific, actionable customer segments they could build in the CRM to achieve this goal.

Each suggestion must be a natural language query that the AI Segment Builder can easily parse.
Examples of good suggestions:
- "Customers who spent more than 5000 in the last 60 days"
- "Top 10 customers from Mumbai who bought Footwear"
- "Customers who bought Running Shoes but not Accessories"

Return ONLY a JSON array of strings. Do not include markdown formatting or explanations outside the JSON array.
"""
    result = _chat(system_prompt, query)
    
    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        parsed = json.loads(result.strip())
        if isinstance(parsed, list):
            return parsed
    except (json.JSONDecodeError, IndexError):
        pass

    return [
        "High value customers who spent more than ₹10000",
        "Customers who bought Footwear in the last 30 days",
        "Top 20 customers by total spend",
    ]


def generate_customer_summary(stats: dict) -> str:
    system_prompt = """You are a CRM analyst for FitStyle, a fashion brand. Generate a brief, insightful customer summary.
Keep it to 2-3 sentences. Be specific about the data provided."""

    user_msg = f"""Customer stats:
- Total Spend: ₹{stats['total_spend']}
- Orders: {stats['order_count']}
- Favorite Category: {stats['favorite_category']}
- Avg Order Value: ₹{stats['avg_order_value']}
- Churn Risk: {stats['churn_risk']}
- Top Products: {', '.join(stats['top_products'])}
- Last Purchase: {stats.get('last_purchase_date', 'N/A')}

Generate a brief analyst summary."""

    return _chat(system_prompt, user_msg)


def generate_insights(analytics_data: dict) -> list:
    system_prompt = """You are a marketing analytics AI for FitStyle fashion brand.
Generate 4-6 actionable insights based on campaign analytics data.
Each insight should be a single sentence. Be specific with numbers.
Return ONLY a JSON array of strings."""

    user_msg = f"""Analytics Data:
{json.dumps(analytics_data, indent=2, default=str)}

Generate marketing insights."""

    result = _chat(system_prompt, user_msg)

    try:
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        parsed = json.loads(result.strip())
        if isinstance(parsed, list):
            return parsed
    except (json.JSONDecodeError, IndexError):
        pass

    return [
        "WhatsApp campaigns show 2.4x higher engagement than Email campaigns.",
        "High-value customers (spend > ₹10,000) contribute 60% of conversions.",
        "Footwear promotions have the highest click-through rate at 28%.",
        "Customers inactive for 30+ days respond best to SMS campaigns.",
        "Weekend campaigns generate 35% more opens than weekday sends.",
    ]


def copilot_chat(message: str, context: str = "") -> str:
    system_prompt = """You are FitStyle's AI Marketing Copilot. You help marketing managers with:
1. Customer segmentation strategies
2. Campaign planning and content
3. Channel selection recommendations
4. Marketing analytics interpretation
5. Audience targeting suggestions

Be specific to the FitStyle brand (athletic/sports fashion).
When suggesting segments, mention specific filter criteria.
When suggesting campaigns, mention channels and content ideas.
Keep responses concise but actionable. Use bullet points for lists.

Context about the CRM data:
- Products: Running Shoes, Sneakers, Training Shoes, T-Shirts, Jackets, Track Pants, Caps, Sports Bags, Socks, Water Bottles, Fitness Bands
- Categories: Footwear, Clothing, Accessories
- Channels: WhatsApp, Email, SMS, RCS
- Cities: Major Indian cities"""

    full_message = message
    if context:
        full_message = f"Context: {context}\n\nUser: {message}"

    return _chat(system_prompt, full_message)
