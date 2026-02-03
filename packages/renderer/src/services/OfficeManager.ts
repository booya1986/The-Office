import { EventEmitter } from 'eventemitter3'
import { agentBridge, AgentBridge } from './AgentBridge'
import { taskBridge, TaskBridge } from './TaskBridge'
import type { Agent, Task } from '@pixel-office/shared'

/**
 * OfficeManager - Central coordinator for the visual office
 *
 * This service:
 * - Manages all bridges (agents, tasks, etc.)
 * - Coordinates between different systems
 * - Provides a single entry point for external integration
 * - Handles lifecycle management
 */
export class OfficeManager extends EventEmitter {
  private agentBridge: AgentBridge
  private taskBridge: TaskBridge
  private isInitialized: boolean = false
  private isRunning: boolean = false

  constructor() {
    super()
    this.agentBridge = agentBridge
    this.taskBridge = taskBridge
    this.setupEventForwarding()
  }

  /**
   * Initialize the office manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    this.emit('initializing')

    // Initialize all bridges
    this.agentBridge.start()
    this.taskBridge.start()

    this.isInitialized = true
    this.emit('initialized')
  }

  /**
   * Start the office manager
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (this.isRunning) return

    this.isRunning = true
    this.emit('started')
  }

  /**
   * Stop the office manager
   */
  stop(): void {
    if (!this.isRunning) return

    this.agentBridge.stop()
    this.taskBridge.stop()

    this.isRunning = false
    this.emit('stopped')
  }

  /**
   * Connect to core services (agents, tasks, etc.)
   *
   * This method should be called with instances of:
   * - OrchestratorAgent
   * - TaskManager
   * - ProjectManager
   */
  connectToCore(services: {
    orchestrator?: any
    taskManager?: any
    projectManager?: any
  }): void {
    const { orchestrator, taskManager, projectManager } = services

    // Connect to orchestrator agent events
    if (orchestrator) {
      this.connectToOrchestrator(orchestrator)
    }

    // Connect to task manager events
    if (taskManager) {
      this.connectToTaskManager(taskManager)
    }

    // Connect to project manager events
    if (projectManager) {
      this.connectToProjectManager(projectManager)
    }

    this.emit('core:connected', services)
  }

  /**
   * Connect to OrchestratorAgent
   */
  private connectToOrchestrator(orchestrator: any): void {
    // Register the orchestrator agent
    this.registerAgent({
      id: orchestrator.id,
      type: orchestrator.type,
      name: 'Office Manager',
      status: orchestrator.status || 'idle',
    } as Agent)

    // Listen to orchestrator events
    orchestrator.on?.('status-changed', (status: string) => {
      this.agentBridge.updateAgentStatus(orchestrator.id, status as any)
    })

    orchestrator.on?.('thinking', () => {
      this.agentBridge.onAgentThinking(orchestrator.id)
    })

    orchestrator.on?.('task:assigned', (agentId: string, task: Task) => {
      this.emit('agent:task-assigned', agentId, task)
    })

    // Listen to sub-agent events
    orchestrator.on?.('agent:registered', (agent: Agent) => {
      this.registerAgent(agent)
    })

    orchestrator.on?.('agent:status-changed', (agentId: string, status: string) => {
      this.agentBridge.updateAgentStatus(agentId, status as any)
    })

    orchestrator.on?.('agent:task-started', (agentId: string, task: Task) => {
      this.agentBridge.onTaskStarted(agentId, task)
    })

    orchestrator.on?.('agent:task-completed', (agentId: string, task: Task, result: any) => {
      this.agentBridge.onTaskCompleted(agentId, task, result)
    })
  }

  /**
   * Connect to TaskManager
   */
  private connectToTaskManager(taskManager: any): void {
    // Listen to task events
    taskManager.on?.('task:created', (task: Task) => {
      this.taskBridge.registerTask(task)
    })

    taskManager.on?.('task:updated', (task: Task) => {
      this.taskBridge.updateTaskStatus(task.id, task.status)
    })

    taskManager.on?.('task:completed', (task: Task) => {
      this.taskBridge.updateTaskStatus(task.id, 'completed')
    })

    taskManager.on?.('task:failed', (task: Task) => {
      this.taskBridge.updateTaskStatus(task.id, 'failed')
    })
  }

  /**
   * Connect to ProjectManager
   */
  private connectToProjectManager(projectManager: any): void {
    // Listen to project events for future features
    projectManager.on?.('file:changed', (filePath: string) => {
      this.emit('file:changed', filePath)
    })

    projectManager.on?.('project:loaded', (project: any) => {
      this.emit('project:loaded', project)
    })
  }

  /**
   * Register an agent with the office
   */
  registerAgent(agent: Agent): void {
    this.agentBridge.registerAgent(agent)
    this.emit('agent:registered', agent)
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.agentBridge.unregisterAgent(agentId)
    this.emit('agent:unregistered', agentId)
  }

  /**
   * Register a task
   */
  registerTask(task: Task): void {
    this.taskBridge.registerTask(task)
    this.emit('task:registered', task)
  }

  /**
   * Get office statistics
   */
  getStats(): {
    agents: {
      total: number
      idle: number
      busy: number
      thinking: number
    }
    tasks: {
      total: number
      todo: number
      inProgress: number
      completed: number
      failed: number
    }
  } {
    const agents = this.agentBridge.getAgents()
    const agentStats = {
      total: agents.length,
      idle: agents.filter((a) => a.status === 'idle').length,
      busy: agents.filter((a) => a.status === 'busy' || a.status === 'working').length,
      thinking: agents.filter((a) => a.status === 'thinking').length,
    }

    const taskStats = this.taskBridge.getStats()

    return {
      agents: agentStats,
      tasks: taskStats,
    }
  }

  /**
   * Forward events from bridges to the manager
   */
  private setupEventForwarding(): void {
    // Forward agent bridge events
    this.agentBridge.on('agent:registered', (agent) => {
      this.emit('agent:registered', agent)
    })

    this.agentBridge.on('agent:status-changed', (agentId, status) => {
      this.emit('agent:status-changed', agentId, status)
    })

    this.agentBridge.on('agent:task-started', (agentId, task) => {
      this.emit('agent:task-started', agentId, task)
    })

    this.agentBridge.on('agent:task-completed', (agentId, task, result) => {
      this.emit('agent:task-completed', agentId, task, result)
    })

    // Forward task bridge events
    this.taskBridge.on('task:registered', (task) => {
      this.emit('task:registered', task)
    })

    this.taskBridge.on('task:status-changed', (taskId, status) => {
      this.emit('task:status-changed', taskId, status)
    })

    this.taskBridge.on('kanban:updated', (data) => {
      this.emit('kanban:updated', data)
    })
  }

  /**
   * Check if manager is running
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop()
    this.removeAllListeners()
  }
}

// Singleton instance
export const officeManager = new OfficeManager()
