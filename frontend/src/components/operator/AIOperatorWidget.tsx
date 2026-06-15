import { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, X, Send, Maximize2, Minimize2, Check, AlertCircle, RefreshCw, Zap, GripHorizontal } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { motion, useDragControls } from 'framer-motion'
import api from '@/lib/api'
import './AIOperatorWidget.css'
import { useNotification } from '@/contexts/NotificationContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  statusText?: string
  proposal?: any
  suggestions?: string[]
}

export default function AIOperatorWidget() {
  const queryClient = useQueryClient()
  const { addNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your FitStyle Agent. I can summarize performance, find customer segments, and help you automate campaign workflows. What's our goal today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  // Internal raw messages history sent to the backend
  const rawHistoryRef = useRef<any[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Removed appendToStreamMessage because mutating prev inside setMessages causes duplication in Strict Mode
  const setStatusMessage = (status: string) => {
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (last && last.role === 'assistant' && last.isStreaming) {
        const updated = [...prev]
        updated[updated.length - 1].statusText = status
        return updated
      }
      return [...prev, { id: Date.now().toString(), role: 'assistant', content: '', isStreaming: true, statusText: status }]
    })
  }

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isProcessing) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsProcessing(true)

    rawHistoryRef.current.push({ role: 'user', content: text })

    try {
      const token = localStorage.getItem('fitstyle_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/operator/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: rawHistoryRef.current })
      })

      if (!response.body) throw new Error('No body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let buffer = ''

      // Initialize the streaming message
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '', isStreaming: true }])
      let streamingContent = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim()
              if (dataStr === '[DONE]') {
                done = true
                break
              }
              if (!dataStr) continue

              try {
                const data = JSON.parse(dataStr)
                if (data.type === 'token') {
                  streamingContent += data.content
                  setMessages(prev => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    if (last && last.role === 'assistant' && last.isStreaming) {
                      last.content = streamingContent
                    }
                    return updated
                  })
                } else if (data.type === 'status') {
                  setStatusMessage(data.message)
                } else if (data.type === 'message_complete') {
                  rawHistoryRef.current.push(data.message)
                } else if (data.type === 'proposal') {
                  setMessages(prev => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    last.isStreaming = false
                    last.statusText = undefined
                    last.proposal = data
                    return updated
                  })
                }
              } catch (e) {
                console.error('SSE parse error:', e, dataStr)
              }
            }
          }
        }
      }

      // Finalize message stream and extract suggestions
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.isStreaming) {
          last.isStreaming = false
          last.statusText = undefined

          // Parse <suggestions> block
          const match = last.content.match(/<suggestions>(.*?)<\/suggestions>/is)
          if (match) {
            last.content = last.content.replace(match[0], '').trim()
            try {
              last.suggestions = JSON.parse(match[1])
            } catch (e) { }
          }
        }
        return updated
      })

    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Connection lost. Please try again.' }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApprove = async (proposal: any) => {
    setIsProcessing(true)
    try {
      const res = await api.post('/operator/execute', {
        tool_name: proposal.tool_name,
        arguments: proposal.arguments
      })

      // Invalidate relevant queries based on the action and trigger notification
      if (proposal.tool_name === 'create_segment') {
        queryClient.invalidateQueries({ queryKey: ['segments'] })
        addNotification(
          'Segment Created',
          `The segment "${proposal.arguments.name}" has been successfully created.`,
          'success'
        )
      }
      if (proposal.tool_name === 'draft_campaign') {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        addNotification(
          'Campaign Drafted',
          `The campaign "${proposal.arguments.name}" was successfully drafted.`,
          'success'
        )
      }

      // Update the message history with the tool result so the agent knows it succeeded
      rawHistoryRef.current.push({
        role: 'tool',
        tool_call_id: proposal.tool_call_id,
        name: proposal.tool_name,
        content: JSON.stringify(res.data)
      })

      // Inform user in the UI
      setMessages(prev => {
        const updated = [...prev]
        const idx = updated.findIndex(m => m.proposal?.tool_call_id === proposal.tool_call_id)
        if (idx !== -1) {
          updated[idx].proposal = { ...updated[idx].proposal, status: 'EXECUTED' }
        }
        return updated
      })

      // Automatically trigger the next turn
      handleSend("Tool executed successfully. Please verify the result.")

    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Failed to execute the action.' }])
      setIsProcessing(false)
    }
  }

  if (!isOpen) {
    return (
      <button className="op-fab" onClick={() => setIsOpen(true)}>
        <Bot className="w-6 h-6 text-white op-fab-icon" />
        <span className="op-fab-text">FitStyle Agent</span>
        <span className="op-fab-badge" />
      </button>
    )
  }

  return (
    <motion.div
      className={`op-drawer ${isExpanded ? 'op-expanded' : ''}`}
      drag={!isExpanded}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      style={!isExpanded ? { position: 'fixed', bottom: 24, right: 24 } : {}}
    >
      <div
        className="op-header"
        onPointerDown={(e) => { if (!isExpanded) dragControls.start(e) }}
        style={{ cursor: isExpanded ? 'default' : 'grab' }}
      >
        <div className="op-brand">
          <div className="op-brand-icon">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="op-brand-info">
            <h3>FitStyle Agent</h3>
            <span className={isProcessing ? 'op-status-typing' : ''}>
              {isProcessing ? 'Typing...' : 'Online'}
            </span>
          </div>
        </div>
        <div className="op-actions">
          {!isExpanded && (
            <div className="op-drag-handle" title="Drag to move">
              <GripHorizontal className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="op-body">
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`op-msg-wrapper ${msg.role === 'user' ? 'op-msg-user' : 'op-msg-agent'}`}>
            <div className="op-msg-bubble">
              {msg.statusText && (
                <div className="op-status-text">
                  <RefreshCw className="w-3 h-3 animate-spin" /> {msg.statusText}
                </div>
              )}
              {msg.content && (
                <div className="op-text">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}

              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="op-suggestions">
                  {msg.suggestions.map((sug, idx) => (
                    <button key={idx} className="op-suggestion-btn" onClick={() => handleSend(sug)}>
                      <Zap className="w-3 h-3" /> {sug}
                    </button>
                  ))}
                </div>
              )}

              {msg.isStreaming && !msg.statusText && !msg.content && (
                <div className="op-gemini-loader">
                  <div className="op-gl-line" />
                  <div className="op-gl-line short" />
                </div>
              )}

              {msg.proposal && msg.proposal.status !== 'EXECUTED' && (
                <div className="op-proposal-card">
                  <div className="op-proposal-header">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h4>Approval Required</h4>
                  </div>
                  <p className="op-proposal-desc">
                    The agent wants to execute <strong>{msg.proposal.tool_name}</strong>.
                  </p>
                  <pre className="op-proposal-args">
                    {JSON.stringify(msg.proposal.arguments, null, 2)}
                  </pre>
                  <div className="op-proposal-actions">
                    <button onClick={() => handleApprove(msg.proposal)} className="op-btn-approve">
                      <Check className="w-3.5 h-3.5" /> Approve & Execute
                    </button>
                  </div>
                </div>
              )}

              {msg.proposal && msg.proposal.status === 'EXECUTED' && (
                <div className="op-proposal-executed">
                  <Check className="w-3.5 h-3.5" /> Action Executed
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="op-footer">
        <div className="op-input-wrap">
          <input
            type="text"
            placeholder="Ask me to find customers or launch a campaign..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isProcessing}
          />
          <button onClick={() => handleSend()} disabled={isProcessing || !input.trim()}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
