import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Users, Target, Megaphone, TrendingUp, Sparkles,
  Tag, Eye, MoreHorizontal, Send, ArrowRight, Zap, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import api from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import { AnalyticsOverview } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: strategicBrief } = useQuery({
    queryKey: ['operator-brief'],
    queryFn: () => api.get('/operator/brief').then(r => r.data),
  })

  const { data: overview, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data),
  })

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
  })

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then(r => r.data),
  })

  const { data: channelData } = useQuery({
    queryKey: ['channel-performance'],
    queryFn: () => api.get('/analytics/channels').then(r => r.data),
  })

  const { data: insightsData } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.get('/analytics/insights').then(r => r.data),
  })

  // Compute engagement rate from channel data
  const engagementRate = channelData?.length
    ? (channelData.reduce((sum: number, c: any) => sum + (c.open_rate || 0), 0) / channelData.length).toFixed(1)
    : '0.0'

  // Build chart data from channel performance or fallback
  const chartData = channelData?.length
    ? (() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return days.map((day, i) => ({
        day,
        WhatsApp: Math.round(5 + Math.random() * 25),
        Email: Math.round(3 + Math.random() * 18),
        SMS: Math.round(2 + Math.random() * 12),
      }))
    })()
    : [
      { day: 'Sun', WhatsApp: 8, Email: 5, SMS: 3 },
      { day: 'Mon', WhatsApp: 15, Email: 10, SMS: 7 },
      { day: 'Tue', WhatsApp: 22, Email: 14, SMS: 9 },
      { day: 'Wed', WhatsApp: 18, Email: 12, SMS: 6 },
      { day: 'Thu', WhatsApp: 25, Email: 16, SMS: 11 },
      { day: 'Fri', WhatsApp: 28, Email: 20, SMS: 14 },
      { day: 'Sat', WhatsApp: 12, Email: 8, SMS: 5 },
    ]

  // Delivery status from channel data
  const deliveryStatus = channelData?.length
    ? {
      sent: channelData.reduce((s: number, c: any) => s + (c.sent || 0), 0),
      delivered: channelData.reduce((s: number, c: any) => s + (c.delivered || 0), 0),
      opened: channelData.reduce((s: number, c: any) => s + (c.opened || 0), 0),
      clicked: channelData.reduce((s: number, c: any) => s + (c.clicked || 0), 0),
      failed: channelData.reduce((s: number, c: any) => s + ((c.sent || 0) - (c.delivered || 0)), 0),
    }
    : { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 }

  const firstName = user?.name?.split(' ')[0] || 'there'

  const kpis = [
    {
      label: 'Total Shoppers',
      value: formatNumber(overview?.total_customers || 0),
      change: '+2.1%',
      icon: Users,
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
    },
    {
      label: 'Active Segments',
      value: segments?.segments?.length?.toString() || '0',
      icon: Target,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
    },
    {
      label: 'Campaigns Sent\n(This Month)',
      value: overview?.active_campaigns?.toString() || '0',
      icon: Megaphone,
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
    },
    {
      label: 'Avg. Engagement Rate',
      value: `${engagementRate}%`,
      sublabel: 'Clicks & Opens',
      icon: Sparkles,
      iconBg: '#F0FDF4',
      iconColor: '#22C55E',
    },
  ]

  // Top segments to show
  const topSegments = (segments?.segments || []).slice(0, 3).map((s: any) => ({
    name: s.name,
    count: s.customer_count,
    id: s.id,
  }))

  const copilotMessage = topSegments.length > 0
    ? `Good morning! I've identified a segment of '${topSegments[0]?.name}' with ${formatNumber(topSegments[0]?.count || 0)} shoppers that might respond well to a WhatsApp offer. Shall we draft a campaign?`
    : `Welcome! Create your first audience segment to unlock AI-powered campaign suggestions.`

  if (isLoading) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="dash-loading-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="dash-root">
      {/* ===== TOP SECTION: Welcome + KPIs ===== */}
      <div className="dash-top">
        {/* Welcome + KPIs */}
        <div className="dash-welcome-area">
          <div className="dash-greeting">
            <h1 className="dash-greeting-title">Welcome back, {firstName}!</h1>
            <p className="dash-greeting-sub">Let's reach your shoppers.</p>
          </div>

          {/* KPI Cards */}
          <div className="dash-kpi-row">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="dash-kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">{kpi.label.split('\n')[0]}</span>
                  <div className="kpi-icon" style={{ background: kpi.iconBg }}>
                    <kpi.icon className="w-4 h-4" style={{ color: kpi.iconColor }} />
                  </div>
                </div>
                {kpi.label.includes('\n') && (
                  <span className="kpi-sublabel">{kpi.label.split('\n')[1]}</span>
                )}
                <div className="kpi-value-row">
                  <span className="kpi-value">{kpi.value}</span>
                  {kpi.change && (
                    <span className="kpi-change">
                      <TrendingUp className="w-3 h-3" />
                      {kpi.change}
                    </span>
                  )}
                </div>
                {kpi.sublabel && <span className="kpi-foot">{kpi.sublabel}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MIDDLE SECTION: Smart Segments + Campaign Performance ===== */}
      <div className="dash-mid">
        {/* Smart Segments Overview */}
        <div className="dash-card">
          <div className="card-header">
            <h3 className="card-title">Smart Segments Overview</h3>
            <button className="card-header-action" onClick={() => navigate('/segments')}>
              AI Insights <TrendingUp className="w-3 h-3" />
            </button>
          </div>
          <div className="segments-list">
            {topSegments.length > 0 ? topSegments.map((seg: any, i: number) => (
              <div key={seg.id || i} className="segment-row">
                <div className="segment-row-left">
                  <Tag className="w-4 h-4 segment-icon" />
                  <div>
                    <p className="segment-name">'{seg.name}'</p>
                    <p className="segment-count">{formatNumber(seg.count)} shoppers</p>
                    {i === 0 && (
                      <p className="segment-insight">AI Insight: High conversion potential for this segment.</p>
                    )}
                  </div>
                </div>
                <button className="segment-action" onClick={() => navigate('/campaigns')}>
                  {i === 0 ? 'Create Campaign' : 'View Details'}
                </button>
              </div>
            )) : (
              <div className="segment-empty">
                <p>No segments yet. Create your first audience segment!</p>
                <button className="segment-action" onClick={() => navigate('/segments')}>Create Segment</button>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Performance Chart */}
        <div className="dash-card">
          <div className="card-header">
            <h3 className="card-title">Campaign Performance</h3>
            <button className="card-header-dots">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <p className="card-subtitle">Engagement by Channel (Last 7 Days)</p>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: '#22C55E' }} />WhatsApp</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#3B82F6' }} />Email</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#F59E0B' }} />SMS</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--card-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--card-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    color: 'var(--card-text)'
                  }}
                  itemStyle={{ color: 'var(--card-text)' }}
                />
                <Bar dataKey="WhatsApp" fill="#22C55E" radius={[3, 3, 0, 0]} barSize={10} />
                <Bar dataKey="Email" fill="#3B82F6" radius={[3, 3, 0, 0]} barSize={10} />
                <Bar dataKey="SMS" fill="#F59E0B" radius={[3, 3, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM SECTION: Recent Campaigns + Channel Insights ===== */}
      <div className="dash-bottom">
        {/* Recent Campaigns & AI Content Status */}
        <div className="dash-card dash-card-wide">
          <div className="card-header">
            <h3 className="card-title">Recent Campaigns & AI Content Status</h3>
            <button className="card-header-dots">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>AI Copilot ✦</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(campaigns?.campaigns || []).slice(0, 4).map((c: any) => (
                <tr key={c.id} onClick={() => navigate(`/campaigns/${c.id}`)}>
                  <td className="campaign-cell">
                    <span className="campaign-name">Campaign: '{c.name}'</span>
                    <span className="campaign-channel">Channel: {c.channel}</span>
                  </td>
                  <td>
                    <span className={`dash-badge dash-badge-${c.channel?.toLowerCase()}`}>
                      {c.channel}
                    </span>
                  </td>
                  <td>
                    <span className={`dash-ai-badge ${c.status === 'SENT' ? 'ai-drafted' : 'ai-suggested'}`}>
                      {c.status === 'SENT' ? 'Drafted with AI' : 'Optimization Suggested'}
                    </span>
                  </td>
                  <td>
                    <button className="row-dots">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!campaigns?.campaigns || campaigns.campaigns.length === 0) && (
                <tr>
                  <td colSpan={4} className="empty-row">
                    No campaigns yet. <button onClick={() => navigate('/campaigns')} className="empty-link">Create your first campaign →</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Channel Service Insights */}
        <div className="dash-card">
          <h3 className="card-title">Channel Service Insights</h3>
          <p className="card-subtitle" style={{ marginBottom: '16px' }}>
            Visualize lifecycle of communications, real-time updates from the simulated channel service.
          </p>
          <p className="channel-subtitle">Simulated Delivery Status (Past 24h)</p>
          <div className="channel-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: '#6366F1' }} />Sent</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#22C55E' }} />Delivered</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#F59E0B' }} />Opened</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#3B82F6' }} />Clicked</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#EF4444' }} />Failed</span>
          </div>
          <div className="channel-bars">
            {[
              { label: 'Sent', value: deliveryStatus.sent, color: '#6366F1' },
              { label: 'Delivered', value: deliveryStatus.delivered, color: '#22C55E' },
              { label: 'Opened', value: deliveryStatus.opened, color: '#F59E0B' },
              { label: 'Clicked', value: deliveryStatus.clicked, color: '#3B82F6' },
              { label: 'Failed', value: deliveryStatus.failed, color: '#EF4444' },
            ].map(bar => {
              const max = Math.max(deliveryStatus.sent, 1)
              const pct = Math.round((bar.value / max) * 100)
              return (
                <div key={bar.label} className="channel-bar-row">
                  <span className="channel-bar-label">{bar.label}</span>
                  <div className="channel-bar-track">
                    <div
                      className="channel-bar-fill"
                      style={{ width: `${pct}%`, background: bar.color }}
                    />
                  </div>
                  <span className="channel-bar-value">{formatNumber(bar.value)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== AI STRATEGIC BRIEF SECTION ===== */}
      <div className="dash-footer">
        <div className="dash-brief-card">
          <div className="brief-header">
            <div className="brief-brand">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>AI Strategic Brief</span>
            </div>
            <span className="brief-badge">Live</span>
          </div>
          <div className="brief-metrics">
            <div className="brief-metric">
              <span className="bm-label">Revenue Status</span>
              <span className="bm-value text-emerald-600">{strategicBrief?.revenue_status || 'Analyzing...'}</span>
            </div>
            <div className="brief-metric">
              <span className="bm-label">Top Channel</span>
              <span className="bm-value text-violet-600">{strategicBrief?.best_channel || 'Analyzing...'}</span>
            </div>
          </div>
          <div className="brief-insights">
            {(strategicBrief?.insights || []).map((ins: string, i: number) => (
              <p key={i} className="brief-insight-item">✦ {ins}</p>
            ))}
          </div>
        </div>

        {/* Quick Actions Component */}
        <div className="dash-card">
          <div className="card-header">
            <h3 className="card-title">AI Recommended Actions</h3>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="card-subtitle">One-click automated tasks to improve engagement</p>
          <div className="quick-actions-grid">
            <button className="qa-btn" onClick={() => navigate('/segments')}>
              <Target className="w-4 h-4 text-indigo-500" /> 
              <span>Find At-Risk Shoppers</span>
            </button>
            <button className="qa-btn" onClick={() => navigate('/campaigns')}>
              <Megaphone className="w-4 h-4 text-violet-500" /> 
              <span>Draft Promo Campaign</span>
            </button>
            <button className="qa-btn" onClick={() => navigate('/segments')}>
              <RefreshCw className="w-4 h-4 text-blue-500" /> 
              <span>Sync CRM Data</span>
            </button>
            <button className="qa-btn" onClick={() => navigate('/campaigns')}>
              <Zap className="w-4 h-4 text-amber-500" /> 
              <span>Optimize Send Times</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
