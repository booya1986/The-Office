import { EventEmitter } from 'eventemitter3'
import type { Task, TaskStatus } from '@pixel-office/shared'
import { useUIStore } from '../store/uiStore'

/**
 * TaskBridge - Connects tasks to the visual Kanban board
 *
 * This service:
 * - Listens to task events from TaskManager
 * - Updates the Kanban board in real-time
 * - Manages task lifecycle (creation, updates, completion)
 * - Tracks task dependencies and relationships
 */
export class TaskBridge extends EventEmitter {
  private tasks: Map<string, Task> = new Map()
  private isRunning: boolean = false

  constructor() {
    super()
  }

  /**
   * Start the bridge
   */
  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.emit('started')
  }

  /**
   * Stop the bridge
   */
  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false
    this.emit('stopped')
  }

  /**
   * Register a task with the bridge
   */
  registerTask(task: Task): void {
    this.tasks.set(task.id, task)
    this.updateKanbanBoard()
    this.emit('task:registered', task)
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId)
    if (!task) return

    task.status = status
    this.updateKanbanBoard()
    this.emit('task:status-changed', taskId, status)
  }

  /**
   * Remove a task
   */
  removeTask(taskId: string): void {
    this.tasks.delete(taskId)
    this.updateKanbanBoard()
    this.emit('task:removed', taskId)
  }

  /**
   * Update the Kanban board with current tasks
   */
  private updateKanbanBoard(): void {
    const todoTasks: Task[] = []
    const inProgressTasks: Task[] = []
    const doneTasks: Task[] = []

    for (const task of this.tasks.values()) {
      switch (task.status) {
        case 'pending':
        case 'queued':
          todoTasks.push(task)
          break
        case 'in_progress':
        case 'running':
          inProgressTasks.push(task)
          break
        case 'completed':
        case 'success':
          doneTasks.push(task)
          break
        case 'failed':
        case 'cancelled':
          // Show failed tasks in done column with error indication
          doneTasks.push(task)
          break
      }
    }

    // Update UI store with task data
    // The Kanban component will read from this data
    this.emit('kanban:updated', {
      todo: todoTasks,
      inProgress: inProgressTasks,
      done: doneTasks,
    })
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.status === status)
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * Check if bridge is running
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * Get task statistics
   */
  getStats(): {
    total: number
    todo: number
    inProgress: number
    completed: number
    failed: number
  } {
    let todo = 0
    let inProgress = 0
    let completed = 0
    let failed = 0

    for (const task of this.tasks.values()) {
      switch (task.status) {
        case 'pending':
        case 'queued':
          todo++
          break
        case 'in_progress':
        case 'running':
          inProgress++
          break
        case 'completed':
        case 'success':
          completed++
          break
        case 'failed':
        case 'cancelled':
          failed++
          break
      }
    }

    return {
      total: this.tasks.size,
      todo,
      inProgress,
      completed,
      failed,
    }
  }
}

// Singleton instance
export const taskBridge = new TaskBridge()
