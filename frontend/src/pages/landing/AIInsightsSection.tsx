import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react'

const insights = [
  {
    icon: MessageSquare,
    title: 'Channel Performance',
    text: 'WhatsApp generated 2.3x higher engagement than Email for promotional campaigns this quarter.',
    metric: '2.3x',
    metricLabel: 'Higher Engagement',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/50',
    textColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Customer Value',
    text: 'High-value customers contributed 60% of conversions despite being only 15% of your total audience.',
    metric: '60%',
    metricLabel: 'of Conversions',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200/50',
    textColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Weekly Trend',
    text: 'Open rate increased 15% this week compared to last week. Best performing day: Tuesday at 10 AM.',
    metric: '+15%',
    metricLabel: 'Open Rate',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200/50',
    textColor: 'text-violet-700',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function AIInsightsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/60 text-xs font-semibold text-violet-700 mb-4">
            <Sparkles className="w-3 h-3" />
            AI-Powered Insights
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Insights That{' '}
            <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
              Drive Action
            </span>
          </h2>
          <p className="mt-5 text-lg text-[#64748B] leading-relaxed">
            Our AI analyzes your data continuously and surfaces actionable recommendations to improve every campaign.
          </p>
        </motion.div>

        {/* Insight Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {insights.map((insight) => (
            <motion.div
              key={insight.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden`}
            >
              {/* Gradient side accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${insight.gradient}`} />

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${insight.iconBg} mb-5`}>
                <insight.icon className={`w-5 h-5 ${insight.iconColor}`} />
              </div>

              {/* Metric Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${insight.bg} ${insight.border} border mb-4`}>
                <span className={`text-xl font-extrabold ${insight.textColor}`}>{insight.metric}</span>
                <span className={`text-xs font-medium ${insight.textColor} opacity-70`}>{insight.metricLabel}</span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">{insight.title}</h3>
              <p className="text-[#64748B] leading-relaxed text-[15px]">{insight.text}</p>

              {/* AI Badge */}
              <div className="mt-5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium">AI Generated Insight</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
