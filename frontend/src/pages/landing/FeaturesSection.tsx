import { motion } from 'framer-motion'
import { Bot, Sparkles, BarChart3, ArrowUpRight, Shield, MessageSquare, Bell } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'AI Operator Agent',
    description: 'A fully autonomous marketing agent that lives inside your CRM. Describe what you need in plain English — it queries data, builds segments, and drafts campaigns using real tool calls.',
    color: 'blue',
    gradient: 'from-violet-500 to-purple-500',
    lightBg: 'bg-violet-50',
    lightBorder: 'border-violet-100',
    lightText: 'text-violet-600',
    tag: 'Agentic AI',
    highlights: ['5 Tool Calls', 'SSE Streaming', 'Groq / OpenAI'],
  },
  {
    icon: Shield,
    title: 'Human-in-the-Loop Safety',
    description: 'Read-only operations execute automatically. Write operations (creating segments, drafting campaigns) always pause and ask for your explicit approval before executing.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
    lightBg: 'bg-emerald-50',
    lightBorder: 'border-emerald-100',
    lightText: 'text-emerald-600',
    tag: 'HITL Approval',
    highlights: ['Proposal Cards', 'Approve / Reject', 'Audit Trail'],
  },
  {
    icon: MessageSquare,
    title: 'Multi-Channel Delivery',
    description: 'Send campaigns via WhatsApp, Email, SMS, or RCS. A dedicated Channel Service microservice simulates realistic delivery with webhook callbacks for real-time status updates.',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-50',
    lightBorder: 'border-blue-100',
    lightText: 'text-blue-600',
    tag: 'Microservice',
    highlights: ['4 Channels', 'Webhook Callbacks', 'Live Tracking'],
  },
  {
    icon: BarChart3,
    title: 'Funnel Analytics',
    description: 'Track the complete delivery funnel: Sent → Delivered → Opened → Clicked → Converted. AI auto-generates strategic insights and recommendations from your campaign data.',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-500',
    lightBg: 'bg-orange-50',
    lightBorder: 'border-orange-100',
    lightText: 'text-orange-600',
    tag: 'Insights',
    highlights: ['5-Stage Funnel', 'AI Insights', 'Channel Compare'],
  },
  {
    icon: Sparkles,
    title: 'AI Content Generation',
    description: 'Generate campaign titles, subject lines, and personalized messages with a single click. The AI adapts tone and content based on segment demographics and channel best practices.',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    lightBg: 'bg-pink-50',
    lightBorder: 'border-pink-100',
    lightText: 'text-pink-600',
    tag: 'Generative AI',
    highlights: ['Title + Subject', 'Body Copy', 'Personalization'],
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Every significant action triggers an in-app notification with unread badges. Campaign dispatch results with exact sent/failed/opened counts are pushed live to your notification center.',
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-600',
    lightBg: 'bg-indigo-50',
    lightBorder: 'border-indigo-100',
    lightText: 'text-indigo-600',
    tag: 'Live Updates',
    highlights: ['Unread Badges', 'Delivery Stats', 'Action Alerts'],
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-semibold text-blue-700 mb-4">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Built for the{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              AI-First Era
            </span>
          </h2>
          <p className="mt-5 text-lg text-[#64748B] leading-relaxed">
            Six pillars of intelligence — from autonomous agents to real-time delivery tracking — working together to automate your entire marketing pipeline.
          </p>
        </motion.div>

        {/* Feature Cards — 3x2 Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.lightBg} ${feature.lightBorder} border mb-6`}>
                <feature.icon className={`w-6 h-6 ${feature.lightText}`} />
              </div>

              {/* Tag */}
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${feature.lightBg} ${feature.lightText} mb-3`}>
                {feature.tag}
              </span>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">{feature.title}</h3>
              <p className="text-[#64748B] leading-relaxed text-[15px] mb-4">{feature.description}</p>

              {/* Highlight pills */}
              <div className="flex flex-wrap gap-1.5">
                {feature.highlights.map((h) => (
                  <span key={h} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
                    {h}
                  </span>
                ))}
              </div>

              {/* Learn More Link */}
              <div className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${feature.lightText} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                Learn more
                <ArrowUpRight className="w-4 h-4" />
              </div>

              {/* Gradient top border on hover */}
              <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${feature.gradient} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
