import { EventEmitter } from 'eventemitter3'
import type { Agent, AgentStatus, Task, TaskResult } from '@pixel-office/shared'
import { useAgentStore } from '../store/agentStore'
import type { AgentAnimation } from '../types'

/**
 * AgentBridge - Connects the visual renderer to real agent data
 *
 * This service:
 * - Listens to agent events from the core system
 * - Updates the renderer's agent store in real-time
 * - Maps agent states to visual animations
 * - Manages agent lifecycle (creation, updates, removal)
 */
export class AgentBridge extends EventEmitter {
  private agents: Map<string, Agent> = new Map()
  private updateInterval: NodeJS.Timeout | null = null
  private isRunning: boolean = false

  constructor() {
    super()
    this.setupEventListeners()
  }

  /**
   * Start the bridge - begin listening to agent updates
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true

    // Poll for agent updates every 100ms for smooth animations
    this.updateInterval = setInterval(() => {
      this.syncAgents()
    }, 100)

    this.emit('started')
  }

  /**
   * Stop the bridge - stop listening to updates
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    this.emit('stopped')
  }

  /**
   * Register an agent with the bridge
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent)

    // Add to renderer store
    const { addAgent } = useAgentStore.getState()
    addAgent({
      id: agent.id,
      type: agent.type,
      name: agent.name || agent.type,
      position: this.getAgentPosition(agent),
      status: this.mapAgentStatus(agent.status),
      animation: this.mapAgentAnimation(agent.status),
    })

    this.emit('agent:registered', agent)
  }

  /**
   * Unregister an agent from the bridge
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId)

    const { removeAgent } = useAgentStore.getState()
    removeAgent(agentId)

    this.emit('agent:unregistered', agentId)
  }

  /**
   * Update agent status (triggered by agent events)
   */
  updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId)
    if (!agent) return

    agent.status = status

    const { updateAgent, setAgentAnimation } = useAgentStore.getState()

    updateAgent(agentId, {
      status: this.mapAgentStatus(status),
    })

    setAgentAnimation(agentId, this.mapAgentAnimation(status))

    this.emit('agent:status-changed', agentId, status)
  }

  /**
   * Notify that agent started a task
   */
  onTaskStarted(agentId: string, task: Task): void {
    const { setAgentAnimation } = useAgentStore.getState()

    // Set to typing animation when working on a task
    setAgentAnimation(agentId, 'typing')

    this.emit('agent:task-started', agentId, task)
  }

  /**
   * Notify that agent completed a task
   */
  onTaskCompleted(agentId: string, task: Task, result: TaskResult): void {
    const { setAgentAnimation } = useAgentStore.getState()

    // Celebrate on successful completion
    if (result.status === 'completed') {
      setAgentAnimation(agentId, 'celebrating')

      // Return to idle after celebration
      setTimeout(() => {
        setAgentAnimation(agentId, 'idle')
      }, 2000)
    } else {
      // Just return to idle on failure
      setAgentAnimation(agentId, 'idle')
    }

    this.emit('agent:task-completed', agentId, task, result)
  }

  /**
   * Notify that agent is thinking/planning
   */
  onAgentThinking(agentId: string): void {
    const { setAgentAnimation } = useAgentStore.getState()
    setAgentAnimation(agentId, 'thinking')

    this.emit('agent:thinking', agentId)
  }

  /**
   * Sync all agents from the core system
   */
  private syncAgents(): void {
    // In a real implementation, this would fetch agent states
    // from the core system. For now, we just update existing agents.

    for (const [agentId, agent] of this.agents.entries()) {
      const { updateAgent } = useAgentStore.getState()

      updateAgent(agentId, {
        status: this.mapAgentStatus(agent.status),
      })
    }
  }

  /**
   * Set up event listeners for agent events
   */
  private setupEventListeners(): void {
    // These will be connected to the actual agent event emitters
    // in the integration phase
  }

  /**
   * Get agent position in the office (based on agent type)
   */
  private getAgentPosition(agent: Agent): { x: number; y: number } {
    // Assign positions based on agent type in a grid layout
    const positions: Record<string, { x: number; y: number }> = {
      orchestrator: { x: 8, y: 4 },  // Center of office
      frontend: { x: 3, y: 2 },
      backend: { x: 13, y: 2 },
      mobile: { x: 3, y: 6 },
      database: { x: 13, y: 6 },
      qa: { x: 5, y: 4 },
      devops: { x: 11, y: 4 },
      security: { x: 3, y: 8 },
      performance: { x: 13, y: 8 },
      accessibility: { x: 5, y: 8 },
      uiux: { x: 6, y: 2 },
      graphic_designer: { x: 10, y: 2 },
      technical_writer: { x: 6, y: 6 },
      product_manager: { x: 10, y: 6 },
      data_analyst: { x: 11, y: 8 },
      documentation: { x: 8, y: 8 },
    }

    return positions[agent.type] || { x: 8, y: 4 }
  }

  /**
   * Map AgentStatus to visual status
   */
  private mapAgentStatus(status: AgentStatus): 'idle' | 'busy' | 'thinking' | 'error' {
    switch (status) {
      case 'idle':
        return 'idle'
      case 'busy':
      case 'working':
        return 'busy'
      case 'thinking':
      case 'planning':
        return 'thinking'
      case 'error':
      case 'failed':
        return 'error'
      default:
        return 'idle'
    }
  }

  /**
   * Map AgentStatus to animation
   */
  private mapAgentAnimation(status: AgentStatus): AgentAnimation {
    switch (status) {
      case 'busy':
      case 'working':
        return 'typing'
      case 'thinking':
      case 'planning':
        return 'thinking'
      case 'idle':
      default:
        return 'idle'
    }
  }

  /**
   * Get all registered agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  /**
   * Get a specific agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId)
  }

  /**
   * Check if bridge is running
   */
  isActive(): boolean {
    return this.isRunning
  }
}

// Singleton instance
export const agentBridge = new AgentBridge()
