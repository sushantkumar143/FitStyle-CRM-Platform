import { motion } from 'framer-motion'
import { Users, Sparkles, BarChart3, ArrowUpRight } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'AI Audience Builder',
    description: 'Create customer segments using natural language. Just describe who you want to target and let AI build the perfect audience.',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-50',
    lightBorder: 'border-blue-100',
    lightText: 'text-blue-600',
    tag: 'Segmentation',
  },
  {
    icon: Sparkles,
    title: 'AI Campaign Copilot',
    description: 'Generate personalized campaigns in seconds. AI crafts the message, picks the channel, and optimizes send time automatically.',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    lightBg: 'bg-violet-50',
    lightBorder: 'border-violet-100',
    lightText: 'text-violet-600',
    tag: 'Automation',
  },
  {
    icon: BarChart3,
    title: 'Campaign Analytics',
    description: 'Track delivery, engagement, and conversions across every channel. Real-time funnel analytics with AI-powered recommendations.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
    lightBg: 'bg-emerald-50',
    lightBorder: 'border-emerald-100',
    lightText: 'text-emerald-600',
    tag: 'Insights',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
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
            Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Grow Revenue
            </span>
          </h2>
          <p className="mt-5 text-lg text-[#64748B] leading-relaxed">
            From audience building to campaign delivery and analytics — all powered by AI, all in one platform.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
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
              <p className="text-[#64748B] leading-relaxed text-[15px]">{feature.description}</p>

              {/* Learn More Link */}
              <div className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${feature.lightText} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
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
