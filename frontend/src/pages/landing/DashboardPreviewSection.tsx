import { motion } from 'framer-motion'
import { Monitor, Users, BarChart3, Sparkles, Megaphone } from 'lucide-react'

const annotations = [
  { label: 'Customer Segments', icon: Users, color: 'bg-blue-500', position: 'top-[22%] -left-3 lg:-left-8' },
  { label: 'Campaign Manager', icon: Megaphone, color: 'bg-violet-500', position: 'top-[45%] -right-3 lg:-right-8' },
  { label: 'AI Recommendations', icon: Sparkles, color: 'bg-amber-500', position: 'bottom-[30%] -left-3 lg:-left-8' },
  { label: 'Live Analytics', icon: BarChart3, color: 'bg-emerald-500', position: 'bottom-[12%] -right-3 lg:-right-8' },
]

export default function DashboardPreviewSection() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-600 mb-4">
            <Monitor className="w-3 h-3" />
            Product Preview
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            One Platform,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
              Complete Control
            </span>
          </h2>
          <p className="mt-5 text-lg text-[#64748B] leading-relaxed">
            Manage segments, run campaigns, track analytics, and get AI insights — all from a single beautiful dashboard.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Browser Frame */}
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/60">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-100 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-6 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-500 font-mono flex items-center gap-2">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  app.fitstylecrm.com/dashboard
                </div>
              </div>
            </div>

            {/* Full Dashboard */}
            <div className="bg-[#0c1222] p-4 lg:p-6">
              {/* Top Nav Mock */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">F</span>
                  </div>
                  <span className="text-white text-sm font-semibold">FitStyle CRM</span>
                </div>
                <div className="flex items-center gap-2">
                  {['Dashboard', 'Customers', 'Segments', 'Campaigns', 'Analytics'].map((tab, i) => (
                    <span
                      key={tab}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-medium ${
                        i === 0
                          ? 'bg-slate-700/60 text-white'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              {/* KPI Row */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Revenue', value: '₹24.5L', change: '+12.5%', color: 'from-emerald-500 to-green-500' },
                  { label: 'Active Customers', value: '1,247', change: '+8.3%', color: 'from-blue-500 to-cyan-500' },
                  { label: 'Campaign ROI', value: '3.8x', change: '+22%', color: 'from-violet-500 to-purple-500' },
                  { label: 'Engagement Rate', value: '68.4%', change: '+5.1%', color: 'from-amber-500 to-orange-500' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-2">{kpi.label}</p>
                    <p className="text-xl font-bold text-white">{kpi.value}</p>
                    <span className="text-[11px] text-emerald-400 font-medium">{kpi.change}</span>
                  </div>
                ))}
              </div>

              {/* Chart + Sidebar */}
              <div className="grid grid-cols-3 gap-3">
                {/* Chart */}
                <div className="col-span-2 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-300 font-semibold">Revenue Overview</span>
                    <div className="flex gap-1">
                      {['7D', '30D', '90D'].map((period, i) => (
                        <span key={period} className={`px-2 py-0.5 rounded text-[10px] font-medium ${i === 1 ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500'}`}>
                          {period}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* SVG Chart */}
                  <svg viewBox="0 0 400 120" className="w-full h-auto" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradientLP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,90 C30,85 60,70 100,60 S170,45 200,50 S260,30 300,25 S360,15 400,10 L400,120 L0,120 Z"
                      fill="url(#chartGradientLP)"
                    />
                    <path
                      d="M0,90 C30,85 60,70 100,60 S170,45 200,50 S260,30 300,25 S360,15 400,10"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* AI Panel */}
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs text-slate-300 font-semibold">AI Insights</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { text: 'WhatsApp shows 2.4x better engagement', type: 'insight' },
                      { text: 'Shoe category trending upward', type: 'trend' },
                      { text: 'High-value segment needs attention', type: 'alert' },
                      { text: 'Weekend sends +35% more opens', type: 'insight' },
                    ].map((item, i) => (
                      <div key={i} className="px-2.5 py-2 bg-violet-500/8 border border-violet-500/15 rounded-lg">
                        <p className="text-[10px] text-slate-300 leading-relaxed">💡 {item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Annotations */}
          {annotations.map((ann, i) => (
            <motion.div
              key={ann.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
              className={`absolute ${ann.position} hidden lg:flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-lg shadow-slate-900/8 border border-slate-200/80`}
            >
              <div className={`w-6 h-6 rounded-md ${ann.color} flex items-center justify-center`}>
                <ann.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{ann.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
