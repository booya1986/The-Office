/**
 * ChatPanel - Chat interface with the Product Manager
 */

import React, { useState, useEffect, useRef } from 'react'
import { VoiceInput } from './VoiceInput'

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
  const [interimVoice, setInterimVoice] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle voice transcript - send immediately when speech is finalized
  const handleVoiceTranscript = (transcript: string) => {
    if (transcript && onSendMessage && connected) {
      onSendMessage(transcript)
    }
  }

  // Show interim voice results in the input
  const handleInterimTranscript = (text: string) => {
    setInterimVoice(text)
  }

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
        <h3>💬 Product Manager</h3>
        <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      <div className="chat-messages">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Product Manager'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}

        {/* Show streaming message */}
        {isStreaming && streamingMessage && (
          <div className="chat-message chat-message-assistant streaming">
            <strong>Product Manager:</strong>
            <p>{streamingMessage}</p>
            <span className="typing-indicator">▋</span>
          </div>
        )}

        {chatHistory.length === 0 && !isStreaming && (
          <div className="chat-empty">
            <p>👋 Hello! I'm your Product Manager.</p>
            <p>Tell me what you'd like to build!</p>
            <p className="chat-hint">Try: "Create a React todo app with authentication"</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          onInterimTranscript={handleInterimTranscript}
          disabled={!connected || isStreaming}
        />
        <input
          type="text"
          value={interimVoice || message}
          onChange={(e) => {
            setMessage(e.target.value)
            setInterimVoice('')
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={connected ? 'Type or speak your message...' : 'Connecting to backend...'}
          disabled={!connected || isStreaming}
        />
        <button onClick={handleSend} disabled={!connected || isStreaming || !message.trim()}>
          {isStreaming ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
