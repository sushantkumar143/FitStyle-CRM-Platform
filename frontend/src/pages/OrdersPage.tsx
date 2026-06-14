import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, Search } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => api.get('/orders', { params: { page, page_size: 20 } }).then(r => r.data),
  })

  const totalPages = Math.ceil((data?.total || 0) / 20)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">{data?.total || 0} total orders</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j}><div className="h-4 bg-[hsl(var(--accent))] rounded animate-pulse w-24" /></td>
                  ))}
                </tr>
              ))
            ) : (
              (data?.orders || []).map((o: any) => (
                <tr key={o.id}>
                  <td className="font-medium">#{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td className="text-sm text-muted-foreground max-w-xs truncate">
                    {o.items?.map((i: any) => `${i.product_name} (×${i.quantity})`).join(', ')}
                  </td>
                  <td className="font-medium text-emerald-400">{formatCurrency(o.total_amount)}</td>
                  <td className="text-muted-foreground">{formatDate(o.order_date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
