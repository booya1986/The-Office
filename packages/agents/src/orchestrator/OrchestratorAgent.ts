/**
 * OrchestratorAgent - The manager agent that coordinates all sub-agents
 */

import {
  AgentType,
  AgentStatus,
  Task,
  TaskResult,
  TaskBreakdown,
  TaskStatus,
  TaskPriority,
  Project,
  ProjectBlueprint,
  KanbanBoard,
  Backlog,
  Pipeline,
} from '@pixel-office/shared'
import { BaseAgent } from '../base/BaseAgent'
import { EventEmitter } from 'events'

export interface OrchestratorConfig {
  name: string
  maxConcurrentTasks: number
  enableAutoPlanning: boolean
  enableCollaboration: boolean
}

export class OrchestratorAgent extends EventEmitter {
  private id: string
  private config: OrchestratorConfig
  private subAgents: Map<string, BaseAgent>
  private tasks: Map<string, Task>
  private backlog: Backlog
  private kanban: KanbanBoard
  private pipeline: Pipeline | null
  private currentProject: Project | null

  constructor(id: string, config: OrchestratorConfig) {
    super()
    this.id = id
    this.config = config
    this.subAgents = new Map()
    this.tasks = new Map()
    this.currentProject = null
    this.pipeline = null

    // Initialize backlog
    this.backlog = {
      id: `backlog-${id}`,
      tasks: [],
      totalEstimatedEffort: 0,
    }

    // Initialize kanban board
    this.kanban = this.initializeKanbanBoard()
  }

  get type(): AgentType {
    return AgentType.ORCHESTRATOR
  }

  /**
   * Initialize Kanban board with default columns
   */
  private initializeKanbanBoard(): KanbanBoard {
    return {
      id: `kanban-${this.id}`,
      name: 'Project Board',
      columns: [
        {
          id: 'backlog',
          name: 'Backlog',
          status: TaskStatus.BACKLOG,
          tasks: [],
          limit: null,
        },
        {
          id: 'assigned',
          name: 'Assigned',
          status: TaskStatus.ASSIGNED,
          tasks: [],
          limit: null,
        },
        {
          id: 'in-progress',
          name: 'In Progress',
          status: TaskStatus.IN_PROGRESS,
          tasks: [],
          limit: this.config.maxConcurrentTasks,
        },
        {
          id: 'review',
          name: 'Review',
          status: TaskStatus.REVIEW,
          tasks: [],
          limit: null,
        },
        {
          id: 'completed',
          name: 'Completed',
          status: TaskStatus.COMPLETED,
          tasks: [],
          limit: null,
        },
      ],
    }
  }

  /**
   * Register a sub-agent
   */
  registerAgent(agent: BaseAgent): void {
    this.subAgents.set(agent.getId(), agent)

    // Listen to agent events
    agent.on('task_completed', (data) => this.handleAgentTaskCompleted(agent, data))
    agent.on('task_failed', (data) => this.handleAgentTaskFailed(agent, data))
    agent.on('help_requested', (data) => this.handleAgentHelpRequest(agent, data))
    agent.on('progress', (data) => this.handleAgentProgress(agent, data))

    console.log(`[Orchestrator] Registered agent: ${agent.getType()}`)
  }

  /**
   * Handle user request in natural language
   */
  async handleUserRequest(message: string): Promise<string> {
    console.log(`[Orchestrator] User request: ${message}`)

    // Parse user intent (would use Claude API here)
    const intent = await this.parseUserIntent(message)

    switch (intent.type) {
      case 'create_project':
        return await this.createProject(intent.data)

      case 'add_feature':
        return await this.addFeature(intent.data)

      case 'fix_bug':
        return await this.fixBug(intent.data)

      case 'run_tests':
        return await this.runTests()

      case 'security_audit':
        return await this.securityAudit(intent.data)

      case 'get_status':
        return this.getProjectStatus()

      case 'deploy':
        return await this.deploy(intent.data)

      default:
        return await this.handleGeneralQuery(message)
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: { name: string; description: string; techStack: any }): Promise<string> {
    console.log(`[Orchestrator] Creating project: ${data.name}`)

    // Create project blueprint using Claude API
    const blueprint = await this.createProjectBlueprint(data)

    // Break down into tasks
    const tasks = await this.breakdownProjectSetup(blueprint)

    // Add tasks to backlog
    for (const task of tasks) {
      this.addTask(task)
    }

    // Assign tasks to agents
    await this.assignTasksToAgents()

    return `✅ Project "${data.name}" created! ${tasks.length} tasks planned and assigned to the team.`
  }

  /**
   * Add a new feature
   */
  async addFeature(data: { description: string }): Promise<string> {
    console.log(`[Orchestrator] Adding feature: ${data.description}`)

    // Break down feature into tasks
    const tasks = await this.breakdownFeature(data.description)

    // Add to backlog
    for (const task of tasks) {
      this.addTask(task)
    }

    // Assign tasks
    await this.assignTasksToAgents()

    return `✅ Feature planned! ${tasks.length} tasks created and assigned.`
  }

  /**
   * Run security audit
   */
  async securityAudit(data: { scope?: string }): Promise<string> {
    console.log(`[Orchestrator] Running security audit`)

    // Create security audit task
    const task: Task = {
      id: this.generateTaskId(),
      title: 'Security Audit',
      description: `Run comprehensive security audit${data.scope ? ` on ${data.scope}` : ''}`,
      type: 'security_audit' as any,
      priority: TaskPriority.HIGH,
      status: TaskStatus.BACKLOG,
      assignedTo: null,
      dependencies: [],
      blockedBy: [],
      estimatedEffort: 30,
      actualEffort: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      completedAt: null,
      dueDate: null,
      result: null,
      metadata: { scope: data.scope },
    }

    this.addTask(task)

    // Assign to security agent
    const securityAgent = this.findAgentByType(AgentType.SECURITY)
    if (securityAgent) {
      await this.assignTask(task.id, securityAgent.getId())
      return `✅ Security audit task assigned to Security Agent. Running scan...`
    } else {
      return `⚠️ No Security Agent available. Please enable Security Agent first.`
    }
  }

  /**
   * Break down user request into tasks
   */
  private async breakdownFeature(description: string): Promise<Task[]> {
    // This would use Claude API to intelligently break down the feature
    // For now, return a simple task
    return [
      {
        id: this.generateTaskId(),
        title: `Implement: ${description}`,
        description,
        type: 'feature_implementation' as any,
        priority: TaskPriority.NORMAL,
        status: TaskStatus.BACKLOG,
        assignedTo: null,
        dependencies: [],
        blockedBy: [],
        estimatedEffort: 60,
        actualEffort: 0,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: null,
        completedAt: null,
        dueDate: null,
        result: null,
        metadata: {},
      },
    ]
  }

  /**
   * Assign tasks to appropriate agents
   */
  private async assignTasksToAgents(): Promise<void> {
    const unassignedTasks = Array.from(this.tasks.values()).filter(
      (task) => task.status === TaskStatus.BACKLOG && !task.assignedTo
    )

    for (const task of unassignedTasks) {
      const agent = this.selectBestAgentForTask(task)
      if (agent) {
        await this.assignTask(task.id, agent.getId())
      }
    }
  }

  /**
   * Assign a task to a specific agent
   */
  private async assignTask(taskId: string, agentId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    const agent = this.subAgents.get(agentId)

    if (!task || !agent) {
      console.error(`[Orchestrator] Task or agent not found`)
      return
    }

    task.status = TaskStatus.ASSIGNED
    task.assignedTo = agent.getType()
    task.updatedAt = new Date()

    // Update kanban
    this.moveTaskToColumn(taskId, TaskStatus.ASSIGNED)

    // Send task to agent
    await agent.receiveTask(task)

    this.emit('task_assigned', { taskId, agentId, agentType: agent.getType() })
  }

  /**
   * Select best agent for a task
   */
  private selectBestAgentForTask(task: Task): BaseAgent | null {
    // Find agents that can handle this task
    const capableAgents = Array.from(this.subAgents.values()).filter((agent) => agent.canHandle(task))

    if (capableAgents.length === 0) {
      return null
    }

    // For now, return the first capable agent
    // In the future, consider workload, specialization, etc.
    return capableAgents[0]
  }

  /**
   * Find agent by type
   */
  private findAgentByType(type: AgentType): BaseAgent | null {
    for (const agent of this.subAgents.values()) {
      if (agent.getType() === type) {
        return agent
      }
    }
    return null
  }

  /**
   * Add task to tracking
   */
  private addTask(task: Task): void {
    this.tasks.set(task.id, task)
    this.backlog.tasks.push(task.id)
    this.backlog.totalEstimatedEffort += task.estimatedEffort

    // Add to kanban backlog column
    const backlogColumn = this.kanban.columns.find((col) => col.status === TaskStatus.BACKLOG)
    if (backlogColumn) {
      backlogColumn.tasks.push(task.id)
    }

    this.emit('task_added', { taskId: task.id })
  }

  /**
   * Move task to kanban column
   */
  private moveTaskToColumn(taskId: string, status: TaskStatus): void {
    // Remove from all columns
    for (const column of this.kanban.columns) {
      column.tasks = column.tasks.filter((id) => id !== taskId)
    }

    // Add to target column
    const targetColumn = this.kanban.columns.find((col) => col.status === status)
    if (targetColumn) {
      targetColumn.tasks.push(taskId)
    }
  }

  /**
   * Handle agent task completion
   */
  private handleAgentTaskCompleted(agent: BaseAgent, data: { taskId: string; result: TaskResult }): void {
    console.log(`[Orchestrator] Agent ${agent.getType()} completed task: ${data.taskId}`)

    const task = this.tasks.get(data.taskId)
    if (task) {
      task.status = TaskStatus.COMPLETED
      task.completedAt = new Date()
      task.result = data.result
      task.progress = 100

      this.moveTaskToColumn(data.taskId, TaskStatus.COMPLETED)

      this.emit('task_completed', { taskId: data.taskId, agentType: agent.getType(), result: data.result })
    }

    // Check if there are dependent tasks to unblock
    this.checkAndUnblockDependentTasks(data.taskId)
  }

  /**
   * Handle agent task failure
   */
  private handleAgentTaskFailed(agent: BaseAgent, data: { taskId: string; error: Error }): void {
    console.log(`[Orchestrator] Agent ${agent.getType()} failed task: ${data.taskId}`)

    const task = this.tasks.get(data.taskId)
    if (task) {
      task.status = TaskStatus.FAILED
      task.updatedAt = new Date()

      this.emit('task_failed', { taskId: data.taskId, agentType: agent.getType(), error: data.error })
    }
  }

  /**
   * Handle agent help request
   */
  private handleAgentHelpRequest(agent: BaseAgent, data: { taskId: string; blocker: string }): void {
    console.log(`[Orchestrator] Agent ${agent.getType()} needs help with task: ${data.taskId}`)

    const task = this.tasks.get(data.taskId)
    if (task) {
      task.status = TaskStatus.BLOCKED
      task.blockedBy.push(data.blocker)

      this.emit('agent_help_requested', { taskId: data.taskId, agentType: agent.getType(), blocker: data.blocker })
    }
  }

  /**
   * Handle agent progress update
   */
  private handleAgentProgress(agent: BaseAgent, data: { taskId: string; progress: number; message?: string }): void {
    const task = this.tasks.get(data.taskId)
    if (task) {
      task.progress = data.progress
      task.updatedAt = new Date()

      this.emit('task_progress', {
        taskId: data.taskId,
        agentType: agent.getType(),
        progress: data.progress,
        message: data.message,
      })
    }
  }

  /**
   * Check and unblock tasks that depend on a completed task
   */
  private checkAndUnblockDependentTasks(completedTaskId: string): void {
    for (const task of this.tasks.values()) {
      if (task.dependencies.includes(completedTaskId)) {
        // Remove the dependency
        task.dependencies = task.dependencies.filter((id) => id !== completedTaskId)

        // If no more dependencies and was blocked, unblock
        if (task.dependencies.length === 0 && task.status === TaskStatus.BLOCKED) {
          task.status = TaskStatus.BACKLOG
          task.blockedBy = []
          this.emit('task_unblocked', { taskId: task.id })
        }
      }
    }
  }

  /**
   * Get project status
   */
  private getProjectStatus(): string {
    const totalTasks = this.tasks.size
    const completed = Array.from(this.tasks.values()).filter((t) => t.status === TaskStatus.COMPLETED).length
    const inProgress = Array.from(this.tasks.values()).filter((t) => t.status === TaskStatus.IN_PROGRESS).length
    const blocked = Array.from(this.tasks.values()).filter((t) => t.status === TaskStatus.BLOCKED).length

    return `📊 Project Status:
- Total tasks: ${totalTasks}
- Completed: ${completed}
- In progress: ${inProgress}
- Blocked: ${blocked}
- Progress: ${totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0}%`
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Placeholder methods (would be implemented with Claude API)
  private async parseUserIntent(message: string): Promise<any> {
    // Would use Claude API to parse intent
    return { type: 'general_query', data: {} }
  }

  private async createProjectBlueprint(data: any): Promise<ProjectBlueprint> {
    // Would use Claude API to create blueprint
    throw new Error('Not implemented')
  }

  private async breakdownProjectSetup(blueprint: ProjectBlueprint): Promise<Task[]> {
    // Would break down blueprint into tasks
    return []
  }

  private async fixBug(data: any): Promise<string> {
    return 'Bug fix not implemented'
  }

  private async runTests(): Promise<string> {
    return 'Run tests not implemented'
  }

  private async deploy(data: any): Promise<string> {
    return 'Deploy not implemented'
  }

  private async handleGeneralQuery(message: string): Promise<string> {
    return `I received your message: "${message}". I'm still learning how to handle this.`
  }

  /**
   * Get kanban board
   */
  getKanban(): KanbanBoard {
    return this.kanban
  }

  /**
   * Get backlog
   */
  getBacklog(): Backlog {
    return this.backlog
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Shutdown orchestrator
   */
  async shutdown(): Promise<void> {
    for (const agent of this.subAgents.values()) {
      await agent.shutdown()
    }
    this.removeAllListeners()
  }
}
