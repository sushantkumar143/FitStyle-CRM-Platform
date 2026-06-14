import { ReactNode, useState, useRef, useEffect } from 'react'
import { Search, Bell, Sun, Moon, CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotification, AppNotification } from '@/contexts/NotificationContext'
import { formatDate } from '@/lib/utils'
import AIOperatorWidget from '../operator/AIOperatorWidget'

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { notifications, unreadCount, markAllAsRead, removeNotification } = useNotification()
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleNotifications = () => {
    if (!showNotifications) markAllAsRead()
    setShowNotifications(!showNotifications)
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        {/* Top Header Bar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <span className="topbar-badge">DTC</span>
            <span className="topbar-company">{user?.company_name || 'FitStyle'}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search className="topbar-search-icon" />
              <input type="text" placeholder="Search" className="topbar-search-input" />
            </div>
            
            <button 
              className="topbar-icon-btn" 
              title="Toggle Theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <div className="relative" ref={notifRef}>
              <button 
                className="topbar-icon-btn relative" 
                title="Notifications"
                onClick={toggleNotifications}
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[hsl(var(--card))] animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-50 overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--card-text)' }}>Notifications</h3>
                    <span className="text-xs text-muted-foreground">{notifications.length} total</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--secondary))] transition-colors group">
                          <div className="flex gap-3">
                            <div className="mt-0.5 flex-shrink-0">{getNotifIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium" style={{ color: 'var(--card-text)' }}>{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-2">{formatDate(n.timestamp.toISOString())}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeNotification(n.id) }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="topbar-divider" />
            <button onClick={logout} className="topbar-user" title="Logout">
              <div className="topbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{user?.name || 'User'}</span>
                <span className="topbar-user-role">Marketing Manager</span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="app-content">
          {children}
        </main>
      </div>
      
      {/* Global AI Operator */}
      <AIOperatorWidget />
    </div>
  )
}
