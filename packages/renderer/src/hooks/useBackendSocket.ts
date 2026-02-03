/**
 * useBackendSocket - Hook for connecting to the Pixel Office backend
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAgentStore } from '../store/agentStore'
import type { AgentStatus, Task } from '@pixel-office/shared'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BackendState {
  connected: boolean
  agents: any[]
  tasks: Task[]
  chatHistory: ChatMessage[]
}

export function useBackendSocket(serverUrl: string = 'http://localhost:3001') {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const { updateAgent, addAgent } = useAgentStore()

  useEffect(() => {
    // Connect to backend
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('🔌 Connected to Pixel Office backend')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from backend')
      setConnected(false)
    })

    // Handle initial state
    socket.on('init', (data: BackendState) => {
      console.log('📦 Received initial state:', data)

      // Add agents to store
      for (const agent of data.agents) {
        addAgent(agent)
      }

      // Set chat history
      setChatHistory(data.chatHistory || [])
    })

    // Handle chat streaming
    socket.on('chat:streaming', (data: { chunk: string }) => {
      setIsStreaming(true)
      setStreamingMessage((prev) => prev + data.chunk)
    })

    // Handle complete chat response
    socket.on('chat:response', (data: { message: string }) => {
      setIsStreaming(false)
      setStreamingMessage('')
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ])
    })

    // Handle chat error
    socket.on('chat:error', (data: { error: string }) => {
      setIsStreaming(false)
      setStreamingMessage('')
      console.error('Chat error:', data.error)
    })

    // Handle agent status updates
    socket.on(
      'agent:status',
      (data: { agentId: string; status: AgentStatus; animation: string }) => {
        updateAgent(data.agentId, {
          status: data.status,
          animation: data.animation as any,
        })
      }
    )

    // Handle task events
    socket.on('task:created', (data: { task: Task; agentId: string }) => {
      console.log('📋 Task created:', data.task.title)
    })

    socket.on(
      'task:progress',
      (data: { taskId: string; agentId: string; progress: number }) => {
        console.log(`📊 Task progress: ${data.progress}%`)
      }
    )

    socket.on('task:completed', (data: { taskId: string; agentId: string }) => {
      console.log('✅ Task completed:', data.taskId)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [serverUrl, addAgent, updateAgent])

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.connected) {
      // Add user message to local history immediately
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'user',
          content: message,
          timestamp: new Date(),
        },
      ])

      // Send to backend
      socketRef.current.emit('chat:message', { message })
    }
  }, [])

  return {
    connected,
    chatHistory,
    streamingMessage,
    isStreaming,
    sendMessage,
    socket: socketRef.current,
  }
}
