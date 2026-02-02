/**
 * BaseAgent - Abstract base class for all agents
 */

import {
  AgentType,
  AgentStatus,
  AgentConfig,
  AgentState,
  AgentAction,
  AgentMessage,
  MessageType,
  MessagePriority,
  Task,
  TaskResult,
  TaskStatus,
} from '@pixel-office/shared'
import { EventEmitter } from 'events'

export abstract class BaseAgent extends EventEmitter {
  protected id: string
  protected state: AgentState
  protected config: AgentConfig

  constructor(id: string, config: AgentConfig) {
    super()
    this.id = id
    this.config = config
    this.state = this.initializeState()
  }

  // Abstract methods that must be implemented by sub-agents
  abstract get type(): AgentType
  abstract get specialty(): string[]
  abstract get capabilities(): string[]

  /**
   * Execute a task assigned to this agent
   */
  abstract executeTask(task: Task): Promise<TaskResult>

  /**
   * Determine if this agent can handle a given task
   */
  abstract canHandle(task: Task): boolean

  /**
   * Initialize agent state
   */
  protected initializeState(): AgentState {
    return {
      id: this.id,
      type: this.type,
      name: this.config.name,
      status: AgentStatus.IDLE,
      currentTask: null,
      position: { x: 0, y: 0 },
      animation: 'idle',
      workQueue: [],
      history: [],
      config: this.config,
      metrics: {
        tasksCompleted: 0,
        tasksInProgress: 0,
        tasksFailed: 0,
        averageTaskTime: 0,
        successRate: 0,
        lastActiveAt: new Date(),
      },
    }
  }

  /**
   * Receive a task assignment
   */
  async receiveTask(task: Task): Promise<void> {
    this.logAction('receive_task', `Received task: ${task.title}`, { taskId: task.id })

    // Check if agent can handle this task
    if (!this.canHandle(task)) {
      await this.sendMessage({
        from: this.id,
        to: 'orchestrator',
        type: MessageType.TASK_REJECTED,
        payload: {
          taskId: task.id,
          reason: 'Agent cannot handle this task type',
        },
        timestamp: new Date(),
        priority: MessagePriority.NORMAL,
      })
      return
    }

    // Add to work queue
    this.state.workQueue.push(task.id)

    // Send acceptance
    await this.sendMessage({
      from: this.id,
      to: 'orchestrator',
      type: MessageType.TASK_ACCEPTED,
      payload: { taskId: task.id },
      timestamp: new Date(),
      priority: MessagePriority.NORMAL,
    })

    // Start working if idle
    if (this.state.status === AgentStatus.IDLE) {
      await this.processNextTask()
    }
  }

  /**
   * Process the next task in the queue
   */
  protected async processNextTask(): Promise<void> {
    if (this.state.workQueue.length === 0) {
      this.updateStatus(AgentStatus.IDLE)
      return
    }

    const taskId = this.state.workQueue[0]
    this.state.currentTask = taskId
    this.state.metrics.tasksInProgress++

    this.updateStatus(AgentStatus.WORKING)

    // Emit event for UI to update
    this.emit('task_started', { taskId })

    try {
      // Get task details (would come from task manager)
      const task = await this.getTaskDetails(taskId)

      // Execute the task
      const result = await this.executeTask(task)

      // Report completion
      await this.reportTaskCompletion(task.id, result)

      // Update metrics
      this.state.metrics.tasksCompleted++
      this.state.metrics.tasksInProgress--

    } catch (error) {
      // Report failure
      await this.reportTaskFailure(taskId, error as Error)

      // Update metrics
      this.state.metrics.tasksFailed++
      this.state.metrics.tasksInProgress--
    } finally {
      // Remove from queue
      this.state.workQueue.shift()
      this.state.currentTask = null

      // Process next task
      await this.processNextTask()
    }
  }

  /**
   * Report task progress
   */
  protected async reportProgress(taskId: string, progress: number, message?: string): Promise<void> {
    await this.sendMessage({
      from: this.id,
      to: 'orchestrator',
      type: MessageType.PROGRESS_UPDATE,
      payload: {
        taskId,
        progress,
        message,
      },
      timestamp: new Date(),
      priority: MessagePriority.NORMAL,
    })

    this.emit('progress', { taskId, progress, message })
  }

  /**
   * Report task completion
   */
  protected async reportTaskCompletion(taskId: string, result: TaskResult): Promise<void> {
    this.logAction('task_completed', `Completed task: ${taskId}`, { taskId, result })

    await this.sendMessage({
      from: this.id,
      to: 'orchestrator',
      type: MessageType.TASK_COMPLETED,
      payload: {
        taskId,
        result,
      },
      timestamp: new Date(),
      priority: MessagePriority.HIGH,
    })

    this.emit('task_completed', { taskId, result })
  }

  /**
   * Report task failure
   */
  protected async reportTaskFailure(taskId: string, error: Error): Promise<void> {
    this.logAction('task_failed', `Failed task: ${taskId}`, { taskId, error: error.message })

    await this.sendMessage({
      from: this.id,
      to: 'orchestrator',
      type: MessageType.TASK_FAILED,
      payload: {
        taskId,
        error: {
          message: error.message,
          stack: error.stack,
        },
      },
      timestamp: new Date(),
      priority: MessagePriority.HIGH,
    })

    this.emit('task_failed', { taskId, error })
  }

  /**
   * Request help when stuck
   */
  protected async requestHelp(taskId: string, blocker: string): Promise<void> {
    this.updateStatus(AgentStatus.STUCK)
    this.logAction('request_help', `Requesting help for task: ${taskId}`, { taskId, blocker })

    await this.sendMessage({
      from: this.id,
      to: 'orchestrator',
      type: MessageType.HELP_REQUESTED,
      payload: {
        taskId,
        blocker,
      },
      timestamp: new Date(),
      priority: MessagePriority.CRITICAL,
    })

    this.emit('help_requested', { taskId, blocker })
  }

  /**
   * Request collaboration with another agent
   */
  protected async requestCollaboration(agentId: string, taskId: string, reason: string): Promise<void> {
    await this.sendMessage({
      from: this.id,
      to: agentId,
      type: MessageType.COLLABORATION_REQUEST,
      payload: {
        taskId,
        reason,
      },
      timestamp: new Date(),
      priority: MessagePriority.HIGH,
    })

    this.emit('collaboration_requested', { agentId, taskId, reason })
  }

  /**
   * Update agent status
   */
  protected updateStatus(status: AgentStatus): void {
    this.state.status = status
    this.state.metrics.lastActiveAt = new Date()

    // Update animation based on status
    this.state.animation = this.getAnimationForStatus(status)

    this.emit('status_changed', { status })
  }

  /**
   * Get animation name for status
   */
  protected getAnimationForStatus(status: AgentStatus): string {
    const animationMap: Record<AgentStatus, string> = {
      [AgentStatus.IDLE]: 'idle',
      [AgentStatus.THINKING]: 'thinking',
      [AgentStatus.WORKING]: 'typing',
      [AgentStatus.REPORTING]: 'walking',
      [AgentStatus.STUCK]: 'confused',
      [AgentStatus.BREAK]: 'drinking-coffee',
      [AgentStatus.OFFLINE]: 'offline',
    }

    return animationMap[status] || 'idle'
  }

  /**
   * Log agent action
   */
  protected logAction(type: string, description: string, data: Record<string, any> = {}): void {
    const action: AgentAction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      timestamp: new Date(),
      description,
      data,
    }

    this.state.history.push(action)

    // Keep only last 100 actions
    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(-100)
    }
  }

  /**
   * Send message to another agent or orchestrator
   */
  protected async sendMessage(message: AgentMessage): Promise<void> {
    // This will be implemented by the communication layer
    this.emit('message', message)
  }

  /**
   * Get task details from task manager
   */
  protected async getTaskDetails(taskId: string): Promise<Task> {
    // This will be implemented by the task manager integration
    // For now, throw an error
    throw new Error('getTaskDetails not implemented')
  }

  /**
   * Get current state
   */
  getState(): AgentState {
    return { ...this.state }
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.id
  }

  /**
   * Get agent type
   */
  getType(): AgentType {
    return this.type
  }

  /**
   * Shutdown agent
   */
  async shutdown(): Promise<void> {
    this.updateStatus(AgentStatus.OFFLINE)
    this.removeAllListeners()
  }
}
