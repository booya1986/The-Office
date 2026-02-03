/**
 * ChatPanel - Chat interface with the Office Manager
 */

import React, { useState } from 'react'

export const ChatPanel: React.FC = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  const handleSend = () => {
    if (!message.trim()) return

    setMessages([...messages, { role: 'user', content: message }])
    setMessage('')

    // TODO: Connect to OrchestratorAgent
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>💬 Office Manager</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Manager'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>👋 Hello! I'm your Office Manager.</p>
            <p>How can I help you today?</p>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}
