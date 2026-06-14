import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Send, Users, CheckCircle, Eye, MousePointer, ShoppingCart, XCircle } from 'lucide-react'
import api from '@/lib/api'
import { formatNumber, formatDate } from '@/lib/utils'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => api.get(`/campaigns/${id}`).then(r => r.data),
    refetchInterval: 5000,
  })

  if (isLoading) return <div className="h-64 shimmer-bg rounded-xl animate-pulse" />
  if (!campaign) return <div className="text-center py-20 text-muted-foreground">Campaign not found</div>

  const stats = campaign.stats || {}
  const funnelSteps = [
    { label: 'Sent', value: stats.sent || 0, icon: Send, color: 'from-blue-500 to-blue-400' },
    { label: 'Delivered', value: stats.delivered || 0, icon: CheckCircle, color: 'from-green-500 to-green-400' },
    { label: 'Opened', value: stats.opened || 0, icon: Eye, color: 'from-purple-500 to-purple-400' },
    { label: 'Clicked', value: stats.clicked || 0, icon: MousePointer, color: 'from-amber-500 to-amber-400' },
    { label: 'Converted', value: stats.converted || 0, icon: ShoppingCart, color: 'from-emerald-500 to-emerald-400' },
    { label: 'Failed', value: stats.failed || 0, icon: XCircle, color: 'from-red-500 to-red-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </button>

      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`channel-badge channel-${campaign.channel}`}>{campaign.channel}</span>
              <span className={`status-badge status-${campaign.status?.toLowerCase()}`}>{campaign.status}</span>
              <span className="text-sm text-muted-foreground">Segment: {campaign.segment_name}</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {formatNumber(campaign.audience_size)}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(campaign.created_at)}</p>
        </div>
      </div>

      {/* Delivery Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {funnelSteps.map((s, i) => (
          <div key={s.label} className="kpi-card text-center" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(s.value)}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            {i > 0 && i < 5 && funnelSteps[i - 1].value > 0 && (
              <p className="text-xs text-violet-400 mt-1">{((s.value / funnelSteps[i - 1].value) * 100).toFixed(1)}%</p>
            )}
          </div>
        ))}
      </div>

      {/* Message Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Subject Line</h3>
          <p className="text-sm text-muted-foreground">{campaign.subject || 'N/A'}</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Message Content</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.generated_message || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
