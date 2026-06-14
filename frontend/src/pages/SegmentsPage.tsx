import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Target, Plus, Sparkles, Search, X, Eye } from 'lucide-react'
import api from '@/lib/api'
import { formatNumber } from '@/lib/utils'

const FIELD_OPTIONS = [
  { value: 'total_spend', label: 'Total Spend (₹)' },
  { value: 'order_count', label: 'Number of Orders' },
  { value: 'last_purchase_days', label: 'Days Since Last Purchase' },
  { value: 'product_category', label: 'Product Category' },
  { value: 'product_name', label: 'Product Name' },
  { value: 'city', label: 'City' },
]

const OPERATOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
  total_spend: [{ value: '>', label: '>' }, { value: '<', label: '<' }, { value: '>=', label: '≥' }, { value: '<=', label: '≤' }],
  order_count: [{ value: '>', label: '>' }, { value: '<', label: '<' }, { value: '>=', label: '≥' }, { value: '<=', label: '≤' }],
  last_purchase_days: [{ value: '>', label: 'More than' }, { value: '<', label: 'Less than' }],
  product_category: [{ value: 'in', label: 'Includes' }, { value: 'not_in', label: 'Excludes' }],
  product_name: [{ value: 'in', label: 'Includes' }, { value: 'not_in', label: 'Excludes' }],
  city: [{ value: 'in', label: 'Is' }],
}

const CATEGORIES = ['Footwear', 'Clothing', 'Accessories']
const PRODUCTS = ['Running Shoes', 'Sneakers', 'Training Shoes', 'T-Shirts', 'Jackets', 'Track Pants', 'Caps', 'Sports Bags', 'Socks', 'Water Bottles', 'Fitness Bands']

interface FilterRow {
  field: string; operator: string; value: any
}

export default function SegmentsPage() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'list' | 'manual' | 'ai'>('list')
  const [filters, setFilters] = useState<FilterRow[]>([{ field: 'total_spend', operator: '>', value: '' }])
  const [segName, setSegName] = useState('')
  const [segDesc, setSegDesc] = useState('')
  const [limit, setLimit] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [preview, setPreview] = useState<any>(null)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResult, setAiResult] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<string[] | null>(null)

  const { data: segments, isLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then(r => r.data),
  })

  const previewMut = useMutation({
    mutationFn: (data: { filters: FilterRow[], limit?: number | null, sort_by?: string | null }) => api.post('/segments/preview', data).then(r => r.data),
    onSuccess: (data) => setPreview(data),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/segments', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] })
      setMode('list')
      setFilters([{ field: 'total_spend', operator: '>', value: '' }])
      setSegName(''); setSegDesc(''); setPreview(null)
      setLimit(''); setSortBy('')
      setSuggestions(null)
    },
  })

  const aiBuildMut = useMutation({
    mutationFn: (query: string) => api.post('/segments/ai-build', { query }).then(r => r.data),
    onSuccess: (data) => {
      setAiResult(data)
      setSuggestions(null)
      if (data.limit) setLimit(data.limit)
      if (data.sort_by) setSortBy(data.sort_by)
    },
  })

  const aiSuggestMut = useMutation({
    mutationFn: (query: string) => api.post('/segments/ai-suggest', { query }).then(r => r.data),
    onSuccess: (data) => {
      setSuggestions(data.suggestions)
      setAiResult(null)
    },
  })

  const addFilter = () => setFilters([...filters, { field: 'total_spend', operator: '>', value: '' }])
  const removeFilter = (i: number) => setFilters(filters.filter((_, idx) => idx !== i))
  const updateFilter = (i: number, key: string, val: any) => {
    const updated = [...filters]
    updated[i] = { ...updated[i], [key]: val }
    if (key === 'field') {
      updated[i].operator = OPERATOR_OPTIONS[val]?.[0]?.value || '>'
      updated[i].value = ''
    }
    setFilters(updated)
  }

  const getValueInput = (filter: FilterRow, i: number) => {
    if (['product_category'].includes(filter.field)) {
      return (
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => {
              const current = Array.isArray(filter.value) ? filter.value : []
              const updated = current.includes(cat) ? current.filter((c: string) => c !== cat) : [...current, cat]
              updateFilter(i, 'value', updated)
            }}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              (Array.isArray(filter.value) && filter.value.includes(cat)) ? 'bg-violet-500/20 border-violet-500 text-violet-400' : 'border-[hsl(var(--border))] text-muted-foreground hover:border-violet-500/50'
            }`}>
              {cat}
            </button>
          ))}
        </div>
      )
    }
    if (['product_name'].includes(filter.field)) {
      return (
        <div className="flex flex-wrap gap-2">
          {PRODUCTS.map(prod => (
            <button key={prod} onClick={() => {
              const current = Array.isArray(filter.value) ? filter.value : []
              const updated = current.includes(prod) ? current.filter((c: string) => c !== prod) : [...current, prod]
              updateFilter(i, 'value', updated)
            }}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              (Array.isArray(filter.value) && filter.value.includes(prod)) ? 'bg-violet-500/20 border-violet-500 text-violet-400' : 'border-[hsl(var(--border))] text-muted-foreground hover:border-violet-500/50'
            }`}>
              {prod}
            </button>
          ))}
        </div>
      )
    }
    return (
      <input type="number" value={filter.value} onChange={(e) => updateFilter(i, 'value', e.target.value)}
        className="px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm w-32"
        placeholder="Value" />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audience Segments</h1>
          <p className="text-muted-foreground mt-1">Create and manage customer segments</p>
        </div>
        {mode === 'list' && (
          <div className="flex gap-2">
            <button onClick={() => setMode('manual')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-medium hover:from-violet-500 hover:to-violet-400">
              <Plus className="w-4 h-4" /> Manual Builder
            </button>
            <button onClick={() => setMode('ai')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium hover:from-emerald-500 hover:to-emerald-400">
              <Sparkles className="w-4 h-4" /> AI Builder
            </button>
          </div>
        )}
        {mode !== 'list' && (
          <button onClick={() => { setMode('list'); setPreview(null); setAiResult(null); setSuggestions(null); }}
            className="text-sm text-muted-foreground hover:text-foreground">← Back to list</button>
        )}
      </div>

      {mode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(segments?.segments || []).map((s: any) => (
            <div key={s.id} className="glass-card p-5 hover:border-violet-500/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{s.name}</h3>
                <Target className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{s.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-violet-400">{formatNumber(s.customer_count)}</span>
                <span className="text-xs text-muted-foreground">customers</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(s.filters || []).slice(0, 3).map((f: any, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-[hsl(var(--accent))] text-muted-foreground">
                    {f.field} {f.operator} {Array.isArray(f.value) ? f.value.join(', ') : f.value}
                  </span>
                ))}
                {s.limit && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Top {s.limit}
                  </span>
                )}
                {s.sort_by && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Sorted by {s.sort_by}
                  </span>
                )}
              </div>
            </div>
          ))}
          {(!segments?.segments || segments.segments.length === 0) && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              No segments yet. Create your first segment!
            </div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-lg font-semibold">Manual Segment Builder</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Segment Name</label>
              <input type="text" value={segName} onChange={(e) => setSegName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm"
                placeholder="e.g., High-Value Shoe Buyers" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <input type="text" value={segDesc} onChange={(e) => setSegDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm"
                placeholder="Optional description" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Filter Rules (AND)</label>
            {filters.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-[hsl(var(--secondary))]">
                <select value={f.field} onChange={(e) => updateFilter(i, 'field', e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm outline-none">
                  {FIELD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select value={f.operator} onChange={(e) => updateFilter(i, 'operator', e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm outline-none">
                  {(OPERATOR_OPTIONS[f.field] || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                {getValueInput(f, i)}
                {filters.length > 1 && (
                  <button onClick={() => removeFilter(i)} className="p-2 text-muted-foreground hover:text-red-400"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            <button onClick={addFilter} className="text-sm text-violet-400 hover:text-violet-300">+ Add filter rule</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Sort By (Optional)</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm outline-none">
                <option value="">None</option>
                <option value="total_spend">Total Spend</option>
                <option value="order_count">Order Count</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Limit (Top N)</label>
              <input type="number" value={limit} onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm"
                placeholder="e.g., 100" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => previewMut.mutate({ filters, limit: limit || null, sort_by: sortBy || null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--accent))]">
              <Eye className="w-4 h-4" /> Preview Count
            </button>
            {preview && (
              <span className="text-lg font-bold text-violet-400">{formatNumber(preview.customer_count)} customers match</span>
            )}
          </div>

          {preview && segName && (
            <button onClick={() => createMut.mutate({ name: segName, description: segDesc, filters, limit: limit || null, sort_by: sortBy || null })}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium text-sm"
              disabled={createMut.isPending}>
              {createMut.isPending ? 'Creating...' : 'Save Segment'}
            </button>
          )}
        </div>
      )}

      {mode === 'ai' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">AI Segment Builder</h3>
          </div>
          <p className="text-sm text-muted-foreground">Describe your target audience in natural language.</p>

          <div className="flex gap-3">
            <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
              placeholder='e.g., "Find customers who bought running shoes but never bought accessories"'
              onKeyDown={(e) => e.key === 'Enter' && aiQuery && aiBuildMut.mutate(aiQuery)} />
            <button onClick={() => aiQuery && aiSuggestMut.mutate(aiQuery)}
              disabled={aiSuggestMut.isPending || !aiQuery}
              className="px-4 py-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] text-sm font-medium disabled:opacity-50 transition-colors">
              {aiSuggestMut.isPending ? 'Thinking...' : '💡 Suggest Ideas'}
            </button>
            <button onClick={() => aiQuery && aiBuildMut.mutate(aiQuery)}
              disabled={aiBuildMut.isPending || !aiQuery}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium text-sm disabled:opacity-50">
              {aiBuildMut.isPending ? 'Analyzing...' : 'Build Segment'}
            </button>
          </div>

          {suggestions && (
            <div className="space-y-3 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-sm font-medium text-emerald-400">Here are some segment ideas based on your goal:</p>
              <div className="grid gap-2">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setAiQuery(s); aiBuildMut.mutate(s); }}
                    className="text-left px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] hover:border-emerald-500/50 hover:bg-[hsl(var(--accent))] text-sm text-foreground transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground">Recently Highly Segmented Queries</h4>
              <button 
                onClick={() => {
                  setAiQuery("Suggest some highly effective segments for our fashion store"); 
                  aiSuggestMut.mutate("Suggest some highly effective segments for our fashion store");
                }}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-suggest segments
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Customers who spent more than ₹5000', 'No orders in the last 60 days', 'Bought shoes but not accessories', 'Top 10 high-value Mumbai customers', 'Inactive customers who bought jackets'].map(q => (
                <button key={q} onClick={() => { setAiQuery(q); aiBuildMut.mutate(q) }}
                  className="px-3 py-1.5 rounded-full text-xs border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-400 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {aiResult && (
            <div className="space-y-4 p-4 rounded-lg bg-[hsl(var(--secondary))]">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-emerald-400">{formatNumber(aiResult.customer_count)} customers match</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(aiResult.filters || []).map((f: any, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {f.field} {f.operator} {Array.isArray(f.value) ? f.value.join(', ') : f.value}
                  </span>
                ))}
                {aiResult.limit && (
                  <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Limit: {aiResult.limit}
                  </span>
                )}
                {aiResult.sort_by && (
                  <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Sort: {aiResult.sort_by}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={segName} onChange={(e) => setSegName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-emerald-500 outline-none text-sm"
                  placeholder="Segment name" />
                <button onClick={() => segName && createMut.mutate({ name: segName, description: aiQuery, filters: aiResult.filters, limit: aiResult.limit || null, sort_by: aiResult.sort_by || null })}
                  disabled={!segName || createMut.isPending}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium text-sm disabled:opacity-50">
                  {createMut.isPending ? 'Saving...' : 'Save Segment'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
