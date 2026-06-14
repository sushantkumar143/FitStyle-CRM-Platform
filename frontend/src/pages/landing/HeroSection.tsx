import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, TrendingUp, Users, IndianRupee, Sparkles, BarChart3 } from 'lucide-react'

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Browser Chrome */}
      <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/80 bg-[#0c1222]">
        {/* Title Bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0f172a] border-b border-slate-700/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-slate-800/60 rounded-md text-[10px] text-slate-400 font-mono">
              app.fitstylecrm.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 space-y-3">
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Revenue', value: '₹24.5L', change: '+12.5%', icon: IndianRupee, color: 'from-emerald-500 to-green-600' },
              { label: 'Customers', value: '1,247', change: '+8.3%', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { label: 'Campaigns', value: '23', change: '+15%', icon: BarChart3, color: 'from-violet-500 to-purple-500' },
              { label: 'AI Score', value: '94%', change: '+5.2%', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{kpi.label}</span>
                  <div className={`w-5 h-5 rounded bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-3 h-3 text-white" />
                  </div>
                </div>
                <p className="text-sm font-bold text-white">{kpi.value}</p>
                <span className="text-[9px] text-emerald-400">{kpi.change}</span>
              </div>
            ))}
          </div>

          {/* Chart + Insights Row */}
          <div className="grid grid-cols-5 gap-2">
            {/* Mini Chart */}
            <div className="col-span-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 font-medium">Revenue Trend</span>
              <div className="mt-2 flex items-end gap-[3px] h-16">
                {[35, 42, 38, 55, 48, 62, 58, 72, 65, 78, 85, 92].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/60 to-blue-400/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="col-span-2 bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/40 space-y-1.5">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] text-slate-400 font-medium">AI Insights</span>
              </div>
              {['WhatsApp 2.4x better', 'Weekend +35% opens', 'Shoes top CTR'].map((t, i) => (
                <div key={i} className="px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded text-[8px] text-violet-300 truncate">
                  💡 {t}
                </div>
              ))}
            </div>
          </div>

          {/* Segments Row */}
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 font-medium">Active Segments</span>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {['High Spenders', 'Mumbai VIP', 'Inactive 90d', 'Shoe Lovers', 'New Users'].map((s) => (
                <span key={s} className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/25 rounded-full text-[9px] text-blue-300 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badges */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute -left-4 top-1/3 bg-white rounded-xl px-3 py-2 shadow-xl shadow-slate-900/10 border border-slate-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Conversion Rate</p>
            <p className="text-xs font-bold text-slate-900">+24.8%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute -right-4 bottom-1/4 bg-white rounded-xl px-3 py-2 shadow-xl shadow-slate-900/10 border border-slate-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">AI Accuracy</p>
            <p className="text-xs font-bold text-slate-900">94.2%</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section id="hero" className="relative pt-28 lg:pt-36 pb-20 lg:pb-28 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 landing-grid-bg opacity-40" />

      {/* Radial Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-blue-100/50 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-blue-700 tracking-wide">AI-Native CRM Platform</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#0F172A] leading-[1.1] tracking-tight">
              Turn Customer Data{' '}
              <span className="relative">
                Into Revenue
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
                </svg>
              </span>{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">With AI</span>
            </h1>

            <p className="mt-6 text-lg text-[#64748B] leading-relaxed max-w-lg">
              AI-powered segmentation, campaign automation, personalized messaging, and analytics for modern marketing teams.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group px-7 py-3.5 bg-[#0F172A] text-white font-semibold text-sm rounded-xl shadow-xl shadow-slate-900/15 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
              >
                Start Free Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="group px-7 py-3.5 bg-white text-[#0F172A] font-semibold text-sm rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-blue-500" />
                View Dashboard
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </motion.div>

          {/* Right — Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
