import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CustomersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => api.get('/customers', { params: { page, page_size: 20, search: search || undefined } }).then(r => r.data),
  })

  const totalPages = Math.ceil((data?.total || 0) / 20)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">{data?.total || 0} total customers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-10 pr-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm w-72"
            />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>City</th>
              <th>Total Spend</th>
              <th>Orders</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j}><div className="h-4 bg-[hsl(var(--accent))] rounded animate-pulse w-24" /></td>
                  ))}
                </tr>
              ))
            ) : (
              (data?.customers || []).map((c: any) => (
                <tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        {c.name?.charAt(0)}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{c.email}</td>
                  <td>{c.city || '—'}</td>
                  <td className="font-medium text-emerald-400">{formatCurrency(c.total_spend || 0)}</td>
                  <td>{c.order_count || 0}</td>
                  <td className="text-muted-foreground">{formatDate(c.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm disabled:opacity-50 hover:bg-[hsl(var(--accent))]"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm disabled:opacity-50 hover:bg-[hsl(var(--accent))]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
