from pydantic import BaseModel
from typing import List, Optional, Dict


class FunnelMetrics(BaseModel):
    sent: int
    delivered: int
    opened: int
    clicked: int
    converted: int
    failed: int


class RateMetrics(BaseModel):
    delivery_rate: float
    open_rate: float
    click_rate: float
    conversion_rate: float


class ChannelMetrics(BaseModel):
    channel: str
    sent: int
    delivered: int
    opened: int
    clicked: int
    converted: int
    delivery_rate: float
    open_rate: float


class AnalyticsOverview(BaseModel):
    total_customers: int
    total_orders: int
    total_revenue: float
    active_campaigns: int
    total_campaigns: int
    revenue_by_month: List[dict]


class CampaignAnalytics(BaseModel):
    funnel: FunnelMetrics
    rates: RateMetrics
    channel_performance: List[ChannelMetrics]
    top_campaigns: List[dict]
    segment_performance: List[dict]


class InsightResponse(BaseModel):
    insights: List[str]
