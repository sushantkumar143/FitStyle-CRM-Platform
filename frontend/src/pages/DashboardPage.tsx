import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Users, ShoppingBag, IndianRupee, Megaphone, TrendingUp, Sparkles } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import api from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { AnalyticsOverview } from '@/lib/types'

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data: overview, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data),
  })

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
  })

  const { data: insightsData } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.get('/analytics/insights').then(r => r.data),
  })

  const kpis = [
    { label: 'Total Customers', value: overview?.total_customers || 0, icon: Users, color: 'from-violet-500 to-purple-500', format: formatNumber },
    { label: 'Total Orders', value: overview?.total_orders || 0, icon: ShoppingBag, color: 'from-blue-500 to-cyan-500', format: formatNumber },
    { label: 'Total Revenue', value: overview?.total_revenue || 0, icon: IndianRupee, color: 'from-emerald-500 to-green-500', format: (v: number) => formatCurrency(v) },
    { label: 'Active Campaigns', value: overview?.active_campaigns || 0, icon: Megaphone, color: 'from-amber-500 to-orange-500', format: (v: number) => v.toString() },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="kpi-card h-32 shimmer-bg animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to FitStyle Marketing Command Center</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="kpi-card animate-count-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">{kpi.label}</span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">{kpi.format(kpi.value)}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.revenue_by_month || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 47%, 9%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '0.75rem' }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {(insightsData?.insights || [
              "WhatsApp campaigns show 2.4x higher engagement than Email.",
              "High-value customers contribute 60% of conversions.",
              "Footwear promotions have the highest click-through rate.",
              "Weekend campaigns generate 35% more opens.",
            ]).slice(0, 4).map((insight: string, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 text-sm text-muted-foreground">
                <span className="text-violet-400">💡</span> {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Campaigns</h3>
          <button onClick={() => navigate('/campaigns')} className="text-sm text-violet-400 hover:text-violet-300">
            View all →
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Channel</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(campaigns?.campaigns || []).slice(0, 5).map((c: any) => (
              <tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                <td className="font-medium">{c.name}</td>
                <td><span className={`channel-badge channel-${c.channel}`}>{c.channel}</span></td>
                <td>{formatNumber(c.audience_size)}</td>
                <td><span className={`status-badge status-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                <td className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!campaigns?.campaigns || campaigns.campaigns.length === 0) && (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No campaigns yet. Create your first!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
