import React from 'react'
import { PixelOffice, useBackendSocket } from '@pixel-office/renderer'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

function App() {
  const {
    connected,
    chatHistory,
    streamingMessage,
    isStreaming,
    sendMessage,
  } = useBackendSocket(BACKEND_URL)

  const handleReady = () => {
    console.log('Pixel Office is ready!')
    if (connected) {
      console.log('Connected to backend!')
    }
  }

  return (
    <PixelOffice
      onReady={handleReady}
      chatProps={{
        chatHistory,
        streamingMessage,
        isStreaming,
        onSendMessage: sendMessage,
        connected,
      }}
    />
  )
}

export default App
