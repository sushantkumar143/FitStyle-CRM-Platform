import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { BarChart3, TrendingUp, MousePointerClick, Mail, Eye, ShoppingCart } from 'lucide-react'

function AnimatedBar({ width, delay, color }: { width: number; delay: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className="h-8 bg-slate-100 rounded-lg overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${width}%` } : {}}
        transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-lg ${color} flex items-center justify-end pr-3`}
      >
        <span className="text-[11px] font-bold text-white">{width.toFixed(0)}%</span>
      </motion.div>
    </div>
  )
}

function AnimatedValue({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target])

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>
}

const funnel = [
  { stage: 'Sent', value: 100, icon: Mail, color: 'bg-blue-500', count: '12,450' },
  { stage: 'Delivered', value: 96, icon: Mail, color: 'bg-cyan-500', count: '11,952' },
  { stage: 'Opened', value: 68, icon: Eye, color: 'bg-violet-500', count: '8,466' },
  { stage: 'Clicked', value: 34, icon: MousePointerClick, color: 'bg-amber-500', count: '4,233' },
  { stage: 'Converted', value: 12, icon: ShoppingCart, color: 'bg-emerald-500', count: '1,494' },
]

const kpis = [
  { label: 'Open Rate', value: 68, suffix: '%', color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Click Rate', value: 34, suffix: '%', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Conversion', value: 12, suffix: '%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'ROI', value: 380, suffix: '%', color: 'text-blue-600', bg: 'bg-blue-50' },
]

export default function AnalyticsShowcase() {
  return (
    <section id="analytics" className="py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-700 mb-4">
            <BarChart3 className="w-3 h-3" />
            Campaign Analytics
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Measure What{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
              Matters Most
            </span>
          </h2>
          <p className="mt-5 text-lg text-[#64748B] leading-relaxed">
            Full-funnel analytics from send to conversion. Track every metric that drives revenue growth.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Campaign Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Campaign Funnel</h3>
                <p className="text-sm text-[#64748B] mt-0.5">Last 30 days performance</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+24% vs last month</span>
              </div>
            </div>

            <div className="space-y-4">
              {funnel.map((step, i) => (
                <div key={step.stage} className="flex items-center gap-4">
                  <div className="w-24 flex items-center gap-2 flex-shrink-0">
                    <step.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{step.stage}</span>
                  </div>
                  <div className="flex-1">
                    <AnimatedBar width={step.value} delay={i * 0.15} color={step.color} />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 w-16 text-right">{step.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center"
              >
                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${kpi.bg} ${kpi.color} mb-3`}>
                  {kpi.label}
                </span>
                <p className={`text-3xl font-extrabold ${kpi.color}`}>
                  <AnimatedValue target={kpi.value} suffix={kpi.suffix} />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
