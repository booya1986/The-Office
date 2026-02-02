/**
 * TaskManager - Manages tasks, dependencies, and workflow
 */

import { EventEmitter } from 'events'
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskResult,
  KanbanBoard,
  KanbanColumn,
  Backlog,
  Pipeline,
  PipelineStage,
  PipelineStatus,
  PipelineStageStatus,
  AgentType,
} from '@pixel-office/shared'

export interface TaskManagerConfig {
  maxConcurrentTasks?: number
  autoAssignTasks?: boolean
}

export class TaskManager extends EventEmitter {
  private tasks: Map<string, Task>
  private kanban: KanbanBoard
  private backlog: Backlog
  private pipeline: Pipeline | null
  private config: Required<TaskManagerConfig>

  constructor(config: TaskManagerConfig = {}) {
    super()
    this.tasks = new Map()
    this.pipeline = null
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks ?? 5,
      autoAssignTasks: config.autoAssignTasks ?? false,
    }

    // Initialize kanban board
    this.kanban = this.initializeKanbanBoard()

    // Initialize backlog
    this.backlog = {
      id: `backlog-${Date.now()}`,
      tasks: [],
      totalEstimatedEffort: 0,
    }
  }

  /**
   * Create a new task
   */
  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const task: Task = {
      id: this.generateTaskId(),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.tasks.set(task.id, task)

    // Add to backlog
    this.backlog.tasks.push(task.id)
    this.backlog.totalEstimatedEffort += task.estimatedEffort

    // Add to kanban backlog column
    const backlogColumn = this.kanban.columns.find(
      (col) => col.status === TaskStatus.BACKLOG
    )
    if (backlogColumn) {
      backlogColumn.tasks.push(task.id)
    }

    this.emit('task_created', { taskId: task.id, task })

    return task
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.status === status)
  }

  /**
   * Get tasks assigned to agent
   */
  getTasksByAgent(agentType: AgentType): Task[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedTo === agentType
    )
  }

  /**
   * Update task
   */
  updateTask(taskId: string, updates: Partial<Task>): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    const oldStatus = task.status

    Object.assign(task, updates, { updatedAt: new Date() })

    // If status changed, update kanban
    if (updates.status && updates.status !== oldStatus) {
      this.moveTaskToColumn(taskId, updates.status)
    }

    this.emit('task_updated', { taskId, updates, oldStatus })
  }

  /**
   * Assign task to agent
   */
  assignTask(taskId: string, agentType: AgentType): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.assignedTo = agentType
    task.status = TaskStatus.ASSIGNED
    task.updatedAt = new Date()

    this.moveTaskToColumn(taskId, TaskStatus.ASSIGNED)

    this.emit('task_assigned', { taskId, agentType })
  }

  /**
   * Start task
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.status = TaskStatus.IN_PROGRESS
    task.startedAt = new Date()
    task.updatedAt = new Date()
    task.progress = 0

    this.moveTaskToColumn(taskId, TaskStatus.IN_PROGRESS)

    this.emit('task_started', { taskId })
  }

  /**
   * Update task progress
   */
  updateProgress(taskId: string, progress: number, message?: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.progress = Math.min(100, Math.max(0, progress))
    task.updatedAt = new Date()

    this.emit('task_progress', { taskId, progress, message })
  }

  /**
   * Complete task
   */
  completeTask(taskId: string, result: TaskResult): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.status = TaskStatus.COMPLETED
    task.completedAt = new Date()
    task.updatedAt = new Date()
    task.progress = 100
    task.result = result

    this.moveTaskToColumn(taskId, TaskStatus.COMPLETED)

    // Check and unblock dependent tasks
    this.checkAndUnblockDependentTasks(taskId)

    this.emit('task_completed', { taskId, result })
  }

  /**
   * Fail task
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.status = TaskStatus.FAILED
    task.updatedAt = new Date()
    task.result = {
      success: false,
      output: error,
      filesChanged: [],
      testsRun: 0,
      testsPassed: 0,
      errors: [{ type: 'task_error', message: error }],
      warnings: [],
      metrics: {},
    }

    this.moveTaskToColumn(taskId, TaskStatus.FAILED)

    this.emit('task_failed', { taskId, error })
  }

  /**
   * Block task
   */
  blockTask(taskId: string, blocker: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.status = TaskStatus.BLOCKED
    task.blockedBy.push(blocker)
    task.updatedAt = new Date()

    this.emit('task_blocked', { taskId, blocker })
  }

  /**
   * Unblock task
   */
  unblockTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    task.status = TaskStatus.BACKLOG
    task.blockedBy = []
    task.updatedAt = new Date()

    this.emit('task_unblocked', { taskId })
  }

  /**
   * Delete task
   */
  deleteTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      return
    }

    // Remove from all kanban columns
    for (const column of this.kanban.columns) {
      column.tasks = column.tasks.filter((id) => id !== taskId)
    }

    // Remove from backlog
    this.backlog.tasks = this.backlog.tasks.filter((id) => id !== taskId)
    this.backlog.totalEstimatedEffort -= task.estimatedEffort

    this.tasks.delete(taskId)

    this.emit('task_deleted', { taskId })
  }

  /**
   * Get Kanban board
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

      // Check WIP limit
      if (
        targetColumn.limit &&
        targetColumn.tasks.length > targetColumn.limit
      ) {
        this.emit('column_limit_exceeded', {
          column: targetColumn.name,
          limit: targetColumn.limit,
          current: targetColumn.tasks.length,
        })
      }
    }
  }

  /**
   * Check and unblock dependent tasks
   */
  private checkAndUnblockDependentTasks(completedTaskId: string): void {
    for (const task of this.tasks.values()) {
      if (task.dependencies.includes(completedTaskId)) {
        // Remove the dependency
        task.dependencies = task.dependencies.filter(
          (id) => id !== completedTaskId
        )

        // If no more dependencies and was blocked, unblock
        if (task.dependencies.length === 0 && task.status === TaskStatus.BLOCKED) {
          this.unblockTask(task.id)
        }
      }
    }
  }

  /**
   * Initialize Kanban board
   */
  private initializeKanbanBoard(): KanbanBoard {
    return {
      id: `kanban-${Date.now()}`,
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
   * Create pipeline for CI/CD
   */
  createPipeline(name: string, stages: Omit<PipelineStage, 'startedAt' | 'completedAt' | 'error'>[]): Pipeline {
    this.pipeline = {
      id: `pipeline-${Date.now()}`,
      name,
      stages: stages.map(stage => ({
        ...stage,
        startedAt: null,
        completedAt: null,
        error: null,
      })),
      status: PipelineStatus.IDLE,
      startedAt: null,
      completedAt: null,
    }

    this.emit('pipeline_created', { pipeline: this.pipeline })

    return this.pipeline
  }

  /**
   * Run pipeline
   */
  async runPipeline(): Promise<void> {
    if (!this.pipeline) {
      throw new Error('No pipeline configured')
    }

    this.pipeline.status = PipelineStatus.RUNNING
    this.pipeline.startedAt = new Date()

    this.emit('pipeline_started', { pipelineId: this.pipeline.id })

    for (const stage of this.pipeline.stages) {
      stage.status = PipelineStageStatus.RUNNING
      stage.startedAt = new Date()

      this.emit('pipeline_stage_started', {
        pipelineId: this.pipeline.id,
        stageId: stage.id,
      })

      // Stage execution would be handled by agents
      // For now, just emit event
      this.emit('pipeline_stage_execute', {
        pipelineId: this.pipeline.id,
        stage,
      })

      // Wait for stage completion (this would be async in real implementation)
      // For now, mark as success
      stage.status = PipelineStageStatus.SUCCESS
      stage.completedAt = new Date()

      this.emit('pipeline_stage_completed', {
        pipelineId: this.pipeline.id,
        stageId: stage.id,
      })
    }

    this.pipeline.status = PipelineStatus.SUCCESS
    this.pipeline.completedAt = new Date()

    this.emit('pipeline_completed', { pipelineId: this.pipeline.id })
  }

  /**
   * Get project statistics
   */
  getStatistics(): {
    total: number
    byStatus: Record<TaskStatus, number>
    byPriority: Record<TaskPriority, number>
    totalEstimatedEffort: number
    totalActualEffort: number
    completionRate: number
  } {
    const tasks = Array.from(this.tasks.values())

    const byStatus = Object.values(TaskStatus).reduce((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status).length
      return acc
    }, {} as Record<TaskStatus, number>)

    const byPriority = Object.values(TaskPriority).reduce((acc, priority) => {
      acc[priority] = tasks.filter((t) => t.priority === priority).length
      return acc
    }, {} as Record<TaskPriority, number>)

    const totalEstimatedEffort = tasks.reduce((sum, t) => sum + t.estimatedEffort, 0)
    const totalActualEffort = tasks.reduce((sum, t) => sum + t.actualEffort, 0)
    const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
    const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      totalEstimatedEffort,
      totalActualEffort,
      completionRate,
    }
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Cleanup
   */
  shutdown(): void {
    this.removeAllListeners()
  }
}
