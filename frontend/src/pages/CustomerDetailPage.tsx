import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, IndianRupee, AlertTriangle, Heart, TrendingUp, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`).then(r => r.data),
  })

  const { data: orders } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => api.get('/orders', { params: { customer_id: id, page_size: 10 } }).then(r => r.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['customer-summary', id],
    queryFn: () => api.get(`/customers/${id}/summary`).then(r => r.data),
  })

  if (isLoading) {
    return <div className="h-64 shimmer-bg rounded-xl animate-pulse" />
  }

  if (!customer) {
    return <div className="text-center py-20 text-muted-foreground">Customer not found</div>
  }

  const churnColors: Record<string, string> = { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-red-400' }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
            {customer.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{customer.email}</span>
              {customer.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{customer.phone}</span>}
              {customer.city && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{customer.city}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`status-badge ${customer.churn_risk === 'Low' ? 'status-delivered' : customer.churn_risk === 'Medium' ? 'status-clicked' : 'status-failed'}`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {customer.churn_risk} Churn Risk
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <IndianRupee className="w-4 h-4" /> Total Spend
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(customer.total_spend)}</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ShoppingBag className="w-4 h-4" /> Orders
          </div>
          <p className="text-2xl font-bold">{customer.order_count}</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Heart className="w-4 h-4" /> Favorite Category
          </div>
          <p className="text-2xl font-bold text-violet-400">{customer.favorite_category}</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" /> Avg Order
          </div>
          <p className="text-2xl font-bold">{formatCurrency(customer.avg_order_value)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Summary */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold">AI Customer Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary?.ai_summary || customer.purchase_behavior}
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Top Products:</p>
            <div className="flex flex-wrap gap-2">
              {(customer.top_products || []).map((p: string) => (
                <span key={p} className="px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs">{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold mb-4">Purchase History</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(orders?.orders || []).map((o: any) => (
                <tr key={o.id}>
                  <td className="font-medium">#{o.id}</td>
                  <td className="text-muted-foreground">{formatDate(o.order_date)}</td>
                  <td className="text-sm">{o.items?.map((i: any) => i.product_name).join(', ')}</td>
                  <td className="font-medium text-emerald-400">{formatCurrency(o.total_amount)}</td>
                </tr>
              ))}
              {(!orders?.orders || orders.orders.length === 0) && (
                <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
