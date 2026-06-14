import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-[#0F172A] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 tracking-wide">Ready to get started?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Launch Smarter Campaigns{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              With AI
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Segment audiences, generate campaigns, and optimize engagement from one platform. 
            Join thousands of marketing teams already using FitStyle CRM.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-white text-[#0F172A] font-semibold text-sm rounded-xl shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
            >
              Start Free Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              className="px-8 py-4 text-white font-semibold text-sm rounded-xl border border-white/15 hover:bg-white/5 hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Contact Sales
            </button>
          </div>

          {/* Bottom Trust */}
          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-slate-500">
            <span>✓ Free 14-day trial</span>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
