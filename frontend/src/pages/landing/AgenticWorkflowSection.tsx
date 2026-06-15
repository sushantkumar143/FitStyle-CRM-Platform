import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Bot, Target, Megaphone, Send, BarChart3, Bell, CheckCircle2, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

const steps = [
  {
    icon: Bot,
    label: 'User Intent',
    title: '"Find high-value customers in Mumbai"',
    detail: 'Natural language query to the AI Operator',
    color: 'from-violet-500 to-purple-600',
    badge: 'FitStyle Agent',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    icon: Target,
    label: 'Tool Call: query_customers',
    title: 'AI Finds 352 Matches',
    detail: 'Filters: city=Mumbai, spend>₹5000',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Auto-Executed',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Megaphone,
    label: 'Tool Call: create_segment',
    title: 'Segment Created',
    detail: '"Mumbai VIP Shoppers" — 352 customers',
    color: 'from-emerald-500 to-green-500',
    badge: 'HITL Approved ✓',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Send,
    label: 'Tool Call: draft_campaign',
    title: 'Campaign Auto-Drafted',
    detail: 'AI generates personalized WhatsApp message',
    color: 'from-orange-500 to-amber-500',
    badge: 'HITL Approved ✓',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    icon: BarChart3,
    label: 'Channel Service',
    title: 'Multi-Channel Delivery',
    detail: 'Webhook simulation: SENT → DELIVERED → OPENED',
    color: 'from-pink-500 to-rose-500',
    badge: 'Microservice',
    badgeColor: 'bg-pink-100 text-pink-700',
  },
  {
    icon: Bell,
    label: 'Real-time Notification',
    title: 'Delivery Report Pushed',
    detail: '"Delivered: 340, Opened: 245, Failed: 12"',
    color: 'from-indigo-500 to-blue-600',
    badge: 'Live Updates',
    badgeColor: 'bg-indigo-100 text-indigo-700',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

// Hand-drawn scribble arrow SVG
function ScribbleArrow() {
  return (
    <svg width="40" height="60" viewBox="0 0 40 60" fill="none" className="mx-auto my-2 opacity-30">
      <motion.path
        d="M20 2C18 15 22 25 20 40C19 45 20 50 20 55"
        stroke="#6366F1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        d="M14 48L20 58L26 48"
        stroke="#6366F1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.3 }}
      />
    </svg>
  )
}

// Hand-drawn circle annotation
function ScribbleCircle({ text, className }: { text: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`absolute ${className}`}
    >
      <div className="relative">
        <svg width="120" height="50" viewBox="0 0 120 50" fill="none" className="absolute -top-2 -left-3">
          <motion.ellipse
            cx="60"
            cy="25"
            rx="56"
            ry="20"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.5 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
        <span className="text-[11px] font-bold text-violet-600 relative z-10 px-3 py-1">{text}</span>
      </div>
    </motion.div>
  )
}

export default function AgenticWorkflowSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="agentic" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-violet-50/30 to-white" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/60 text-xs font-semibold text-violet-700 mb-4">
            <Zap className="w-3 h-3" />
            Agentic AI Workflows
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Your Marketing Runs on{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                Autopilot
              </span>
              {/* Scribble underline */}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <motion.path
                  d="M3 9C30 3 60 3 100 6C140 9 170 5 197 3"
                  stroke="#7C3AED"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </svg>
            </span>
          </h2>
          <p className="mt-6 text-lg text-[#64748B] leading-relaxed">
            From a simple English sentence to a fully dispatched, multi-channel campaign — watch how the 
            FitStyle Agent orchestrates everything with human-in-the-loop safety.
          </p>
        </motion.div>

        {/* Workflow Steps — 3D Perspective Cards */}
        <div className="relative max-w-2xl mx-auto" style={{ perspective: '1200px' }}>
          {/* Scribble annotations */}
          <ScribbleCircle text="Read-Only Tools" className="-left-36 top-[200px] hidden lg:block" />
          <ScribbleCircle text="Needs Approval" className="-right-36 top-[420px] hidden lg:block" />
          <ScribbleCircle text="Async Webhook" className="-left-36 top-[680px] hidden lg:block" />

          {steps.map((step, i) => (
            <div key={step.label}>
              <motion.div
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                whileHover={{
                  scale: 1.02,
                  rotateY: 3,
                  boxShadow: '0 25px 50px rgba(99, 102, 241, 0.15)',
                }}
                className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-lg transition-all duration-300 group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center shadow-lg z-10">
                  {i + 1}
                </div>

                <div className="flex items-start gap-5">
                  {/* 3D Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {step.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.badgeColor}`}>
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-1">{step.title}</h3>
                    <p className="text-sm text-[#64748B]">{step.detail}</p>
                  </div>

                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: i * 0.15 + 0.5, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  </motion.div>
                </div>

                {/* Connection line on left */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[13px] -bottom-[2px] w-[2px] h-[42px] bg-gradient-to-b from-slate-300 to-transparent z-0" />
                )}
              </motion.div>

              {/* Scribble arrow between cards */}
              {i < steps.length - 1 && <ScribbleArrow />}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0F172A]/5 border border-slate-200">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              Human-in-the-Loop: Write operations always require your explicit approval
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
