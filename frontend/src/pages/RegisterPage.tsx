import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Zap } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, companyName)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[hsl(var(--background))]">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">FitStyle CRM</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Marketing Platform</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-1">Create your account</h2>
          <p className="text-sm text-muted-foreground mb-6">Start building smarter campaigns</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors text-sm"
                placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors text-sm"
                placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors text-sm"
                placeholder="FitStyle Inc." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors text-sm"
                placeholder="••••••••" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold transition-all disabled:opacity-50 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
