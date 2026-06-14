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
                    <div className="h-10 rounded-xl overflow-hidden shadow-inner" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div className="h-full rounded-xl transition-all duration-1000 flex items-center justify-end pr-4 shadow-lg"
                        style={{ 
                          width: `${width}%`, 
                          background: `linear-gradient(90deg, ${step.color}20 0%, ${step.color}80 100%)`, 
                          borderRight: `3px solid ${step.color}` 
                        }}>
                        <span className="text-sm font-bold text-white drop-shadow-md">{formatNumber(step.value)}</span>
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

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--card-text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--card-text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--sidebar-active-bg)' }}
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', color: 'var(--card-text)' }} 
                />
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
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Top Campaigns</h3>
          <div className="space-y-3">
            {(topCampaigns || []).slice(0, 5).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl transition-colors" style={{ background: 'var(--page-bg)', border: '1px solid var(--card-border)' }}>
                <span className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold shadow-inner">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'var(--premium-card-text)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--premium-card-text-muted)' }}>{c.channel} · {formatNumber(c.audience_size)} audience</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-500">{formatNumber(c.converted)}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--premium-card-text-muted)' }}>conversions</p>
                </div>
              </div>
            ))}
            {(!topCampaigns || topCampaigns.length === 0) && (
              <p className="text-center py-4 text-muted-foreground text-sm">No campaign data yet</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold">AI Marketing Insights</h3>
          </div>
          <div className="space-y-4">
            {(insights?.insights || []).map((insight: string, i: number) => (
              <div key={i} className="p-4 rounded-xl text-sm leading-relaxed flex items-start gap-3 shadow-inner" style={{ background: 'var(--page-bg)', border: '1px solid var(--card-border)', color: 'var(--premium-card-text)' }}>
                <span className="text-violet-500 text-lg">✦</span> 
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Segment Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ color: 'var(--premium-card-text)' }}>
            <thead>
              <tr className="uppercase tracking-wider text-xs" style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--premium-card-text-muted)' }}>
                <th className="pb-3 font-semibold">Segment</th>
                <th className="pb-3 font-semibold">Audience</th>
                <th className="pb-3 font-semibold">Campaigns</th>
                <th className="pb-3 font-semibold">Total Sent</th>
                <th className="pb-3 font-semibold">Conversions</th>
                <th className="pb-3 font-semibold">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {(segPerf || []).map((s: any) => (
                <tr key={s.segment} className="transition-colors" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-4 font-medium">{s.segment}</td>
                  <td className="py-4">{formatNumber(s.audience_size)}</td>
                  <td className="py-4">{s.campaigns}</td>
                  <td className="py-4">{formatNumber(s.total_sent)}</td>
                  <td className="py-4 text-emerald-500 font-semibold">{formatNumber(s.conversions)}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.conversion_rate > 5 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {s.conversion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
              {(!segPerf || segPerf.length === 0) && (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--premium-card-text-muted)' }}>No segment data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
