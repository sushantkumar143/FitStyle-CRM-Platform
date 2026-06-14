import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShoppingBag, Target,
  Megaphone, BarChart3, Bot, LogOut, Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/segments', icon: Target, label: 'Segments' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/copilot', icon: Bot, label: 'AI Copilot' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[hsl(222,47%,7%)] border-r border-[hsl(var(--border))] flex flex-col z-50">
      {/* Brand */}
      <div className="p-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">FitStyle</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">CRM Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.to === '/copilot' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-semibold">
                  AI
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.company_name}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-muted-foreground hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
