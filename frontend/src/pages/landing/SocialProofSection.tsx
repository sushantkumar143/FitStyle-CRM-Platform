import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, ShoppingBag, Zap, CheckCircle2 } from 'lucide-react'

function AnimatedCounter({ target, suffix = '', duration = 1.5 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = target
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      start = Math.floor(eased * end)
      setCount(start)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target, duration])

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 0)}K` : count.toString()
  // Use actual display format
  const display = target >= 50000
    ? `${Math.floor(count / 1000)}K`
    : target >= 1000
    ? count.toLocaleString()
    : count.toString()

  return <span ref={ref}>{display}{suffix}</span>
}

const stats = [
  { label: 'Customers Managed', value: 1000, suffix: '+', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Orders Tracked', value: 5000, suffix: '+', icon: ShoppingBag, color: 'text-violet-500', bg: 'bg-violet-50' },
  { label: 'Campaign Events', value: 50000, suffix: '+', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Delivery Rate', value: 95, suffix: '%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
]

export default function SocialProofSection() {
  return (
    <section className="py-16 lg:py-20 border-y border-slate-200/60 bg-white/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1.5 text-sm text-[#64748B] font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
