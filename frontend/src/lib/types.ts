export interface User {
  id: number
  name: string
  email: string
  company_name: string
  created_at: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  city: string | null
  created_at: string
  total_spend?: number
  order_count?: number
}

export interface CustomerDetail extends Customer {
  total_spend: number
  order_count: number
  favorite_category: string
  avg_order_value: number
  last_purchase_date: string | null
  churn_risk: string
  purchase_behavior: string
  top_products: string[]
}

export interface Product {
  id: number
  name: string
  category: string
  price: number
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_category: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  customer_id: number
  customer_name: string
  total_amount: number
  order_date: string
  items: OrderItem[]
}

export interface SegmentFilter {
  field: string
  operator: string
  value: any
}

export interface Segment {
  id: number
  name: string
  description: string | null
  filters: SegmentFilter[]
  customer_count: number
  created_by: number
  created_at: string
  limit?: number | null
  sort_by?: string | null
}

export interface Campaign {
  id: number
  name: string
  segment_id: number
  segment_name?: string
  channel: string
  status: string
  subject: string | null
  generated_message: string | null
  audience_size: number
  created_by: number
  created_at: string
  stats?: CampaignStats
}

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  failed: number
}

export interface AnalyticsOverview {
  total_customers: number
  total_orders: number
  total_revenue: number
  active_campaigns: number
  total_campaigns: number
  revenue_by_month: { month: string; revenue: number }[]
}

export interface FunnelData {
  funnel: CampaignStats
  rates: {
    delivery_rate: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
}

export interface ChannelMetrics {
  channel: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  delivery_rate: number
  open_rate: number
}

export interface CampaignGeneratedContent {
  title: string
  subject: string
  message: string
}
