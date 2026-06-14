import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell } from 'recharts'
import { TrendingUp, TrendingDown, ArrowDown, Sparkles, Send, CheckCircle, Eye, MousePointer, ShoppingCart } from 'lucide-react'
import api from '@/lib/api'
import { formatNumber } from '@/lib/utils'

const FUNNEL_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#10b981']

export default function AnalyticsPage() {
  const { data: funnel } = useQuery({
    queryKey: ['analytics-funnel'],
    queryFn: () => api.get('/analytics/funnel').then(r => r.data),
  })

  const { data: channels } = useQuery({
    queryKey: ['analytics-channels'],
    queryFn: () => api.get('/analytics/channels').then(r => r.data),
  })

  const { data: topCampaigns } = useQuery({
    queryKey: ['analytics-top-campaigns'],
    queryFn: () => api.get('/analytics/top-campaigns').then(r => r.data),
  })

  const { data: segPerf } = useQuery({
    queryKey: ['analytics-segment-perf'],
    queryFn: () => api.get('/analytics/segment-performance').then(r => r.data),
  })

  const { data: insights } = useQuery({
    queryKey: ['analytics-insights'],
    queryFn: () => api.get('/analytics/insights').then(r => r.data),
  })

  const funnelData = funnel?.funnel || {}
  const rates = funnel?.rates || {}

  const funnelSteps = [
    { name: 'Sent', value: funnelData.sent || 0, icon: Send, color: '#3b82f6' },
    { name: 'Delivered', value: funnelData.delivered || 0, icon: CheckCircle, color: '#22c55e' },
    { name: 'Opened', value: funnelData.opened || 0, icon: Eye, color: '#a855f7' },
    { name: 'Clicked', value: funnelData.clicked || 0, icon: MousePointer, color: '#f59e0b' },
    { name: 'Converted', value: funnelData.converted || 0, icon: ShoppingCart, color: '#10b981' },
  ]

  const rateCards = [
    { label: 'Delivery Rate', value: rates.delivery_rate || 0, color: 'text-green-400' },
    { label: 'Open Rate', value: rates.open_rate || 0, color: 'text-purple-400' },
    { label: 'Click Rate', value: rates.click_rate || 0, color: 'text-amber-400' },
    { label: 'Conversion Rate', value: rates.conversion_rate || 0, color: 'text-emerald-400' },
  ]

  const channelChartData = (channels || []).map((c: any) => ({
    name: c.channel?.toUpperCase(),
    delivered: c.delivered,
    opened: c.opened,
    clicked: c.clicked,
    converted: c.converted,
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Campaign performance and marketing insights</p>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rateCards.map((r, i) => (
          <div key={r.label} className="kpi-card" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-sm text-muted-foreground mb-2">{r.label}</p>
            <p className={`text-3xl font-bold ${r.color}`}>{r.value}%</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
              <TrendingUp className="w-3 h-3" /> Healthy
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Funnel */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Campaign Funnel</h3>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => {
              const maxVal = funnelSteps[0].value || 1
              const width = Math.max(15, (step.value / maxVal) * 100)
              return (
                <div key={step.name} className="flex items-center gap-4">
                  <div className="w-24 flex items-center gap-2 text-sm">
                    <step.icon className="w-4 h-4" style={{ color: step.color }} />
                    <span>{step.name}</span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 rounded-lg overflow-hidden bg-[hsl(var(--secondary))]">
                      <div className="h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-3"
                        style={{ width: `${width}%`, backgroundColor: step.color + '30', borderLeft: `3px solid ${step.color}` }}>
                        <span className="text-sm font-bold" style={{ color: step.color }}>{formatNumber(step.value)}</span>
                      </div>
                    </div>
                  </div>
                  {i > 0 && funnelSteps[i - 1].value > 0 && (
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {((step.value / funnelSteps[i - 1].value) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Channel Performance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(222, 47%, 9%)', border: '1px solid hsl(217, 33%, 17%)', borderRadius: '0.75rem' }} />
                <Bar dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} name="Delivered" />
                <Bar dataKey="opened" fill="#a855f7" radius={[4, 4, 0, 0]} name="Opened" />
                <Bar dataKey="clicked" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Clicked" />
                <Bar dataKey="converted" fill="#10b981" radius={[4, 4, 0, 0]} name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Top Campaigns</h3>
          <div className="space-y-3">
            {(topCampaigns || []).slice(0, 5).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.channel} · {formatNumber(c.audience_size)} audience</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{formatNumber(c.converted)}</p>
                  <p className="text-xs text-muted-foreground">conversions</p>
                </div>
              </div>
            ))}
            {(!topCampaigns || topCampaigns.length === 0) && (
              <p className="text-center py-4 text-muted-foreground text-sm">No campaign data yet</p>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold">AI Marketing Insights</h3>
          </div>
          <div className="space-y-3">
            {(insights?.insights || []).map((insight: string, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 text-sm text-muted-foreground">
                <span className="text-violet-400 mr-1">💡</span> {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment Performance */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Segment Performance</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Audience</th>
              <th>Campaigns</th>
              <th>Total Sent</th>
              <th>Conversions</th>
              <th>Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {(segPerf || []).map((s: any) => (
              <tr key={s.segment}>
                <td className="font-medium">{s.segment}</td>
                <td>{formatNumber(s.audience_size)}</td>
                <td>{s.campaigns}</td>
                <td>{formatNumber(s.total_sent)}</td>
                <td className="text-emerald-400 font-medium">{formatNumber(s.conversions)}</td>
                <td><span className={`${s.conversion_rate > 5 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.conversion_rate}%</span></td>
              </tr>
            ))}
            {(!segPerf || segPerf.length === 0) && (
              <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
