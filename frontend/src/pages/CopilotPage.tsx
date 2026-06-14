import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, Send, User, Sparkles, Target, Megaphone, BarChart3 } from 'lucide-react'
import api from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  { icon: Target, text: 'Find customers who bought running shoes but never bought accessories', color: 'text-violet-400' },
  { icon: Megaphone, text: 'Create a campaign for high-value shoe buyers', color: 'text-emerald-400' },
  { icon: BarChart3, text: 'Which audience should I target this week?', color: 'text-blue-400' },
  { icon: Sparkles, text: 'Bring back inactive customers who haven\'t purchased in 60 days', color: 'text-amber-400' },
  { icon: Target, text: 'What is the best channel for footwear promotions?', color: 'text-pink-400' },
  { icon: Megaphone, text: 'Suggest a re-engagement strategy for churning customers', color: 'text-cyan-400' },
]

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const chatMut = useMutation({
    mutationFn: (message: string) => api.post('/copilot/chat', { message, context: '' }).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }])
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your AI API key configuration.', timestamp: new Date() }])
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }])
    setInput('')
    chatMut.mutate(text)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Marketing Copilot</h1>
            <p className="text-muted-foreground text-sm">Your intelligent marketing assistant for FitStyle</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="pulse-dot" />
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
                I can help with customer segmentation, campaign planning, channel selection, and marketing analytics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s.text)}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] hover:border-violet-500/30 transition-all text-left group">
                    <s.icon className={`w-5 h-5 mt-0.5 ${s.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-500 text-white rounded-br-sm'
                    : 'bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-bl-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-violet-200' : 'text-muted-foreground'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          {chatMut.isPending && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-2xl rounded-bl-sm px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[hsl(var(--border))]">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              className="flex-1 px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-violet-500 outline-none text-sm"
              placeholder="Ask about segments, campaigns, channels, or marketing strategy..."
              disabled={chatMut.isPending}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || chatMut.isPending}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white disabled:opacity-50 hover:from-violet-500 hover:to-violet-400 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
