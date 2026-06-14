import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Sparkles, User, Bot, ArrowRight, Send } from 'lucide-react'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

const messages = [
  {
    role: 'user' as const,
    text: 'Find inactive customers who haven\'t ordered in 90 days',
    delay: 0.3,
  },
  {
    role: 'ai' as const,
    text: 'Found 352 customers matching your criteria. I recommend a 20% discount campaign via WhatsApp with expected engagement of 73%.',
    delay: 1.0,
    actions: ['Create Campaign', 'Export Segment'],
  },
  {
    role: 'user' as const,
    text: 'Create a campaign for them with a personalized message',
    delay: 1.8,
  },
  {
    role: 'ai' as const,
    text: 'Campaign "Win Back Inactive Users" created! Targeting 352 customers via WhatsApp. Estimated delivery: 98.5%. Shall I schedule it for optimal send time?',
    delay: 2.5,
    actions: ['Schedule Now', 'Edit Message'],
  },
]

export default function AICopilotShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="copilot" className="py-24 lg:py-32 bg-gradient-to-b from-slate-50/80 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/60 text-xs font-semibold text-violet-700 mb-4">
              <Sparkles className="w-3 h-3" />
              AI Copilot
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Your Marketing{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h2>

            <p className="mt-5 text-lg text-[#64748B] leading-relaxed max-w-md">
              Describe what you want in plain English. The AI Copilot finds the right audience, generates the campaign, and recommends the best strategy — all in seconds.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Natural language audience segmentation',
                'Auto-generate campaign content & strategy',
                'Smart channel & timing recommendations',
                'One-click campaign creation',
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3 h-3 text-violet-600" />
                  </div>
                  <span className="text-[15px] text-slate-700 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Chat Interface */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">FitStyle AI Copilot</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-slate-500">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[340px]">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: msg.delay, duration: 0.4, ease: 'easeOut' }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-[#0F172A] text-white rounded-2xl rounded-br-md px-4 py-3'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-700 rounded-2xl rounded-bl-md px-4 py-3'
                    }`}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      {msg.actions && (
                        <div className="flex gap-2 mt-2.5">
                          {msg.actions.map((action) => (
                            <span
                              key={action}
                              className="px-3 py-1 bg-violet-100 text-violet-700 text-[11px] font-semibold rounded-lg cursor-pointer hover:bg-violet-200 transition-colors"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Input Bar */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5">
                  <input
                    type="text"
                    placeholder="Ask the AI Copilot anything..."
                    className="flex-1 text-sm text-slate-600 bg-transparent outline-none placeholder:text-slate-400"
                    readOnly
                  />
                  <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
