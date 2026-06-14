import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Plus, Sparkles, Send, MessageSquare, Mail, Phone, Smartphone, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import { formatNumber, formatDate } from '@/lib/utils'
import { useNotification } from '@/contexts/NotificationContext'

const CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'from-green-600 to-green-500', desc: 'Best for engagement' },
  { id: 'email', name: 'Email', icon: Mail, color: 'from-blue-600 to-blue-500', desc: 'Best for detailed content' },
  { id: 'sms', name: 'SMS', icon: Phone, color: 'from-orange-600 to-orange-500', desc: 'Best for urgency' },
  { id: 'rcs', name: 'RCS', icon: Smartphone, color: 'from-purple-600 to-purple-500', desc: 'Rich messaging' },
]

export default function CampaignsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addNotification } = useNotification()
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedSegment, setSelectedSegment] = useState<any>(null)
  const [selectedChannel, setSelectedChannel] = useState('')
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [campaignName, setCampaignName] = useState('')
  const [editedMessage, setEditedMessage] = useState('')

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
  })

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then(r => r.data),
    enabled: showWizard,
  })

  const generateMut = useMutation({
    mutationFn: () => api.post('/campaigns/generate', { segment_id: selectedSegment.id, channel: selectedChannel }).then(r => r.data),
    onSuccess: (data) => {
      setGeneratedContent(data)
      setCampaignName(data.title)
      setEditedMessage(data.message)
    },
  })

  const createMut = useMutation({
    mutationFn: () => api.post('/campaigns', {
      name: campaignName,
      segment_id: selectedSegment.id,
      channel: selectedChannel,
      subject: generatedContent?.subject || campaignName,
      generated_message: editedMessage,
    }).then(r => r.data),
    onSuccess: async (campaign) => {
      // Auto-send
      await api.post(`/campaigns/${campaign.id}/send`)
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      setShowWizard(false)
      resetWizard()

      addNotification(
        'Campaign Dispatch Started',
        `Campaign "${campaign.name}" is being sent to the audience in the background.`,
        'info'
      )

      // Simulate waiting for background task to complete, then fetch stats
      setTimeout(async () => {
        try {
          const res = await api.get(`/campaigns/${campaign.id}`)
          const stats = res.data.stats || {}
          const delivered = stats.delivered || 0
          const failed = stats.failed || 0
          const opened = stats.opened || 0
          
          queryClient.invalidateQueries({ queryKey: ['campaigns'] })
          addNotification(
            'Campaign Delivery Completed',
            `"${campaign.name}" dispatch finished. Delivered: ${delivered}, Failed: ${failed}, Opened: ${opened}.`,
            failed > 0 ? 'warning' : 'success'
          )
        } catch (e) {
          console.error('Failed to fetch campaign stats', e)
        }
      }, 5000)
    },
  })

  const resetWizard = () => {
    setStep(1); setSelectedSegment(null); setSelectedChannel('')
    setGeneratedContent(null); setCampaignName(''); setEditedMessage('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">{campaigns?.total || 0} campaigns</p>
        </div>
        <button onClick={() => { setShowWizard(true); resetWizard() }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-medium hover:from-violet-500 hover:to-violet-400">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {/* Campaign Wizard */}
      {showWizard && (
        <div className="glass-card p-6">
          {/* Steps indicator */}
          <div className="flex items-center gap-4 mb-8">
            {['Select Segment', 'Choose Channel', 'Generate & Send'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-violet-500 text-white' : 'bg-[hsl(var(--secondary))] text-muted-foreground'
                }`}>{i + 1}</div>
                <span className={`text-sm ${step === i + 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
            <button onClick={() => { setShowWizard(false); resetWizard() }} className="ml-auto text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>

          {/* Step 1: Select Segment */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Target Segment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(segments?.segments || []).map((s: any) => (
                  <button key={s.id} onClick={() => { setSelectedSegment(s); setStep(2) }}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedSegment?.id === s.id ? 'border-violet-500 bg-violet-500/10' : 'border-[hsl(var(--border))] hover:border-violet-500/50 bg-[hsl(var(--secondary))]'
                    }`}>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{s.description || 'No description'}</p>
                    <p className="text-lg font-bold text-violet-400 mt-2">{formatNumber(s.customer_count)} <span className="text-xs font-normal text-muted-foreground">customers</span></p>
                  </button>
                ))}
              </div>
              {(!segments?.segments || segments.segments.length === 0) && (
                <p className="text-center py-8 text-muted-foreground">No segments available. Create one first!</p>
              )}
            </div>
          )}

          {/* Step 2: Choose Channel */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Choose Communication Channel</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {CHANNELS.map(ch => (
                  <button key={ch.id} onClick={() => { setSelectedChannel(ch.id); setStep(3); generateMut.mutate() }}
                    className={`p-5 rounded-xl border text-center transition-all hover:scale-105 ${
                      selectedChannel === ch.id ? 'border-violet-500 bg-violet-500/10' : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))]'
                    }`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center mx-auto mb-3`}>
                      <ch.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold">{ch.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ch.desc}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            </div>
          )}

          {/* Step 3: Generate & Preview */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" /> AI-Generated Campaign
              </h3>

              {generateMut.isPending ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">AI is crafting your campaign...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Campaign Title</label>
                    <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Subject Line</label>
                    <input type="text" value={generatedContent.subject} readOnly
                      className="w-full px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm text-muted-foreground" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Message Body</label>
                    <textarea value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)} rows={5}
                      className="w-full px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm resize-none" />
                  </div>

                  <div className="p-4 rounded-lg bg-violet-500/5 border border-violet-500/10">
                    <p className="text-xs text-muted-foreground mb-1">Preview</p>
                    <p className="text-sm">📱 <span className="font-medium capitalize">{selectedChannel}</span> → {formatNumber(selectedSegment?.customer_count)} recipients</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm">← Back</button>
                    <button onClick={() => createMut.mutate()} disabled={createMut.isPending}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium text-sm disabled:opacity-50">
                      <Send className="w-4 h-4" /> {createMut.isPending ? 'Sending...' : 'Create & Send Campaign'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Campaign List */}
      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Segment</th>
              <th>Channel</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Delivery</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(campaigns?.campaigns || []).map((c: any) => (
              <tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                <td className="font-medium">{c.name}</td>
                <td className="text-muted-foreground">{c.segment_name}</td>
                <td><span className={`channel-badge channel-${c.channel}`}>{c.channel}</span></td>
                <td>{formatNumber(c.audience_size)}</td>
                <td><span className={`status-badge status-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                <td>
                  {c.stats?.delivered ? (
                    <span className="text-emerald-400 text-sm">{c.stats.delivered}/{c.stats.sent || c.audience_size}</span>
                  ) : '—'}
                </td>
                <td className="text-muted-foreground">{formatDate(c.created_at)}</td>
              </tr>
            ))}
            {(!campaigns?.campaigns || campaigns.campaigns.length === 0) && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No campaigns yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
