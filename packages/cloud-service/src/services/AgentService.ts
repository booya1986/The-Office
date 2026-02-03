/**
 * AgentService - Connects the visual office to Claude API
 * Self-contained version with local type definitions
 */

import { EventEmitter } from 'events'
import Anthropic from '@anthropic-ai/sdk'

// Local type definitions (avoid workspace import issues)
export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  QA = 'qa',
  DEVOPS = 'devops',
  SECURITY = 'security',
  DATABASE = 'database',
  UIUX = 'uiux',
  PRODUCT_MANAGER = 'product_manager',
}

export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
}

export interface AgentState {
  id: string
  type: AgentType
  name: string
  status: AgentStatus
  animation: 'idle' | 'typing' | 'thinking' | 'celebrating'
  position: { x: number; y: number }
  currentTask: string | null
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'in_progress' | 'completed'
  assignedTo: AgentType | null
  progress: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export class AgentService extends EventEmitter {
  private anthropic: Anthropic
  private agents: Map<string, AgentState>
  private tasks: Map<string, Task>
  private chatHistory: ChatMessage[]

  constructor(apiKey: string) {
    super()
    this.anthropic = new Anthropic({ apiKey })
    this.agents = new Map()
    this.tasks = new Map()
    this.chatHistory = []

    this.initializeAgents()
  }

  private initializeAgents(): void {
    const defaultAgents: AgentState[] = [
      {
        id: 'orchestrator-1',
        type: AgentType.ORCHESTRATOR,
        name: 'Office Manager',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 6, y: 3 },
        currentTask: null,
      },
      {
        id: 'frontend-1',
        type: AgentType.FRONTEND,
        name: 'Alex (Frontend)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 2, y: 2 },
        currentTask: null,
      },
      {
        id: 'backend-1',
        type: AgentType.BACKEND,
        name: 'Sam (Backend)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 5, y: 2 },
        currentTask: null,
      },
      {
        id: 'qa-1',
        type: AgentType.QA,
        name: 'Jordan (QA)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 8, y: 2 },
        currentTask: null,
      },
      {
        id: 'devops-1',
        type: AgentType.DEVOPS,
        name: 'Taylor (DevOps)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 2, y: 5 },
        currentTask: null,
      },
      {
        id: 'security-1',
        type: AgentType.SECURITY,
        name: 'Casey (Security)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 5, y: 5 },
        currentTask: null,
      },
      {
        id: 'database-1',
        type: AgentType.DATABASE,
        name: 'Morgan (Database)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 8, y: 5 },
        currentTask: null,
      },
      {
        id: 'uiux-1',
        type: AgentType.UIUX,
        name: 'Riley (UI/UX)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 3, y: 7 },
        currentTask: null,
      },
      {
        id: 'pm-1',
        type: AgentType.PRODUCT_MANAGER,
        name: 'Pat (Product)',
        status: AgentStatus.IDLE,
        animation: 'idle',
        position: { x: 7, y: 7 },
        currentTask: null,
      },
    ]

    for (const agent of defaultAgents) {
      this.agents.set(agent.id, agent)
    }
  }

  /**
   * Process a chat message from the user
   */
  async processMessage(message: string): Promise<void> {
    // Add user message to history
    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    })

    // Set orchestrator to thinking
    this.updateAgentStatus('orchestrator-1', AgentStatus.THINKING, 'thinking')

    try {
      // Build conversation for Claude
      const messages = this.chatHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      // Get streaming response from Claude
      const stream = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: this.buildSystemPrompt(),
        messages,
        stream: true,
      })

      let fullResponse = ''

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta as { type: string; text?: string }
          if (delta.type === 'text_delta' && delta.text) {
            fullResponse += delta.text
            this.emit('chat:streaming', { chunk: delta.text, agentId: 'orchestrator-1' })
          }
        }
      }

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      })

      // Parse response for task creation
      this.parseAndCreateTasks(fullResponse)

      // Emit complete response
      this.emit('chat:response', {
        message: fullResponse,
        agentId: 'orchestrator-1',
      })
    } catch (error) {
      console.error('Error processing message:', error)
      this.emit('chat:error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      // Reset orchestrator status
      this.updateAgentStatus('orchestrator-1', AgentStatus.IDLE, 'idle')
    }
  }

  private buildSystemPrompt(): string {
    const agentList = Array.from(this.agents.values())
      .map((a) => `- ${a.name} (${a.type})`)
      .join('\n')

    return `You are the Office Manager of a pixel art AI development office.

Your team includes:
${agentList}

When users ask for development tasks, you:
1. Acknowledge the request warmly
2. Break it down into specific tasks
3. Assign tasks to appropriate team members
4. Provide status updates

Format task assignments like this:
📋 TASK: [task title]
👤 ASSIGNED TO: [agent name]
📝 DESCRIPTION: [brief description]

Be friendly, professional, and keep responses concise. Use emojis sparingly.
When you create tasks, the visual office will show the assigned agents starting to work.`
  }

  private parseAndCreateTasks(response: string): void {
    const taskPattern = /📋 TASK: (.+)\n👤 ASSIGNED TO: (.+)\n📝 DESCRIPTION: (.+)/g
    let match

    while ((match = taskPattern.exec(response)) !== null) {
      const [, title, assignedTo, description] = match

      if (!title || !assignedTo || !description) continue

      // Find the agent
      const agent = Array.from(this.agents.values()).find(
        (a) => a.name.toLowerCase().includes(assignedTo.toLowerCase()) || assignedTo.toLowerCase().includes(a.type)
      )

      if (agent) {
        const task = this.createTask(title.trim(), description.trim(), agent)
        this.updateAgentStatus(agent.id, AgentStatus.WORKING, 'typing')
        this.simulateTaskProgress(task.id, agent.id)
      }
    }
  }

  private createTask(title: string, description: string, agent: AgentState): Task {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      status: 'in_progress',
      assignedTo: agent.type,
      progress: 0,
    }

    this.tasks.set(task.id, task)
    agent.currentTask = task.id

    this.emit('task:created', { task, agentId: agent.id })

    return task
  }

  private simulateTaskProgress(taskId: string, agentId: string): void {
    const task = this.tasks.get(taskId)
    const agent = this.agents.get(agentId)

    if (!task || !agent) return

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        task.status = 'completed'
        task.progress = 100
        agent.currentTask = null

        this.updateAgentStatus(agentId, AgentStatus.IDLE, 'celebrating')

        setTimeout(() => {
          this.updateAgentStatus(agentId, AgentStatus.IDLE, 'idle')
        }, 2000)

        this.emit('task:completed', { taskId, agentId })
      } else {
        task.progress = Math.round(progress)
        this.emit('task:progress', { taskId, agentId, progress: task.progress })
      }
    }, 2000 + Math.random() * 2000)
  }

  private updateAgentStatus(
    agentId: string,
    status: AgentStatus,
    animation: 'idle' | 'typing' | 'thinking' | 'celebrating'
  ): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.status = status
      agent.animation = animation
      this.emit('agent:status', { agentId, status, animation })
    }
  }

  getAgents(): AgentState[] {
    return Array.from(this.agents.values())
  }

  getTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory
  }
}
