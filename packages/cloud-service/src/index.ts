/**
 * Pixel Office Cloud Service
 * Simple backend that connects the visual office to Claude API
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Server } from 'socket.io'
import { config, validateConfig } from './config'
import { AgentService } from './services/AgentService'

async function main() {
  // Validate configuration
  validateConfig()

  console.log('🏢 Starting Pixel Office Backend...')

  // Create Fastify instance
  const fastify = Fastify({ logger: false })

  // Register CORS
  await fastify.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  })

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  // Initialize Agent Service
  const agentService = new AgentService(config.anthropicApiKey)

  // REST API endpoints
  fastify.get('/api/agents', async () => ({
    agents: agentService.getAgents(),
  }))

  fastify.get('/api/tasks', async () => ({
    tasks: agentService.getTasks(),
  }))

  // Start Fastify server first
  await fastify.listen({ port: config.port, host: '0.0.0.0' })

  // Setup Socket.io on the same server
  const io = new Server(fastify.server, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  })

  // Forward AgentService events to all connected clients
  agentService.on('chat:streaming', (data) => {
    io.emit('chat:streaming', data)
  })

  agentService.on('chat:response', (data) => {
    io.emit('chat:response', data)
  })

  agentService.on('chat:error', (data) => {
    io.emit('chat:error', data)
  })

  agentService.on('agent:status', (data) => {
    io.emit('agent:status', data)
  })

  agentService.on('task:created', (data) => {
    io.emit('task:created', data)
  })

  agentService.on('task:progress', (data) => {
    io.emit('task:progress', data)
  })

  agentService.on('task:completed', (data) => {
    io.emit('task:completed', data)
  })

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // Send initial state
    socket.emit('init', {
      agents: agentService.getAgents(),
      tasks: agentService.getTasks(),
      chatHistory: agentService.getChatHistory(),
    })

    // Handle chat messages
    socket.on('chat:message', async (data: { message: string }) => {
      console.log(`💬 Message received: ${data.message}`)
      await agentService.processMessage(data.message)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏢 Pixel Office Backend is running!                     ║
║                                                           ║
║   Server:    http://localhost:${config.port}                       ║
║   WebSocket: ws://localhost:${config.port}                         ║
║   Health:    http://localhost:${config.port}/health                ║
║                                                           ║
║   Frontend should connect to this server.                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)
}

main().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
