import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Target,
  Megaphone, BarChart3, Bot, Settings, Zap, ShoppingCart
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/segments', icon: Target, label: 'Segments' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar-root">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="sidebar-brand-text">FitStyle CRM</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
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
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={cn('sidebar-link', location.pathname.startsWith('/settings') && 'active')}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}
