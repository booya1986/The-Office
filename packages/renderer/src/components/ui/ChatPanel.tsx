/**
 * ChatPanel - Chat interface with the Office Manager
 */

import React, { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatPanelProps {
  chatHistory?: ChatMessage[]
  streamingMessage?: string
  isStreaming?: boolean
  onSendMessage?: (message: string) => void
  connected?: boolean
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  chatHistory = [],
  streamingMessage = '',
  isStreaming = false,
  onSendMessage,
  connected = false,
}) => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, streamingMessage])

  const handleSend = () => {
    if (!message.trim() || !onSendMessage) return

    onSendMessage(message)
    setMessage('')
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>💬 Office Manager</h3>
        <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      <div className="chat-messages">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Manager'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}

        {/* Show streaming message */}
        {isStreaming && streamingMessage && (
          <div className="chat-message chat-message-assistant streaming">
            <strong>Manager:</strong>
            <p>{streamingMessage}</p>
            <span className="typing-indicator">▋</span>
          </div>
        )}

        {chatHistory.length === 0 && !isStreaming && (
          <div className="chat-empty">
            <p>👋 Hello! I'm your Office Manager.</p>
            <p>Tell me what you'd like to build!</p>
            <p className="chat-hint">Try: "Create a React todo app with authentication"</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={connected ? 'Type your message...' : 'Connecting to backend...'}
          disabled={!connected || isStreaming}
        />
        <button onClick={handleSend} disabled={!connected || isStreaming || !message.trim()}>
          {isStreaming ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
