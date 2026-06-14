import { motion } from 'framer-motion'

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'AI Copilot', 'Analytics', 'Segments', 'Campaigns'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Changelog', 'Blog'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact', 'Privacy Policy'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-10"
        >
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">F</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                FitStyle <span className="text-slate-500 font-normal">CRM</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              AI-native CRM platform for modern marketing teams. Segment, engage, and convert smarter.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} FitStyle CRM. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
