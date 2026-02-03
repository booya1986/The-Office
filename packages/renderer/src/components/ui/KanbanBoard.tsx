/**
 * KanbanBoard - Visual task board with floating overlay
 */

import React, { useEffect, useState } from 'react'
import type { Task } from '@pixel-office/shared'
import { taskBridge } from '../../services/TaskBridge'

interface KanbanBoardProps {
  onClose: () => void
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onClose }) => {
  const [tasks, setTasks] = useState<{
    backlog: Task[]
    inProgress: Task[]
    done: Task[]
  }>({
    backlog: [],
    inProgress: [],
    done: [],
  })

  useEffect(() => {
    // Get initial tasks
    const updateTasks = () => {
      const kanbanData = taskBridge.getKanbanData()
      setTasks({
        backlog: kanbanData.todo || [],
        inProgress: kanbanData.inProgress || [],
        done: kanbanData.done || [],
      })
    }

    updateTasks()

    // Listen for task updates
    const handleKanbanUpdate = () => {
      updateTasks()
    }

    taskBridge.on('kanban:updated', handleKanbanUpdate)
    taskBridge.on('task:registered', handleKanbanUpdate)
    taskBridge.on('task:status-changed', handleKanbanUpdate)

    return () => {
      taskBridge.off('kanban:updated', handleKanbanUpdate)
      taskBridge.off('task:registered', handleKanbanUpdate)
      taskBridge.off('task:status-changed', handleKanbanUpdate)
    }
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'kanban-task-priority-high'
      case 'medium':
        return 'kanban-task-priority-medium'
      case 'low':
        return 'kanban-task-priority-low'
      default:
        return ''
    }
  }

  const getAgentInitials = (assignedTo: string | null | undefined) => {
    if (!assignedTo) return '?'
    const str = String(assignedTo)
    return str
      .split('_')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatAgentName = (assignedTo: string | null | undefined) => {
    if (!assignedTo) return 'Unassigned'
    return String(assignedTo).replace(/_/g, ' ')
  }

  const renderTask = (task: Task) => (
    <div key={task.id} className={`kanban-task ${getPriorityClass(task.priority)}`}>
      <div className="kanban-task-title">{task.title}</div>
      {task.description && (
        <div className="kanban-task-description">{task.description}</div>
      )}
      {task.progress !== undefined && task.progress > 0 && task.progress < 100 && (
        <div className="kanban-task-progress">
          <div
            className="kanban-task-progress-bar"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      )}
      {task.assignedTo && (
        <div className="kanban-task-assignee">
          <div className="kanban-task-assignee-avatar">
            {getAgentInitials(task.assignedTo)}
          </div>
          <span>{formatAgentName(task.assignedTo)}</span>
        </div>
      )}
    </div>
  )

  const totalTasks = tasks.backlog.length + tasks.inProgress.length + tasks.done.length

  return (
    <div className="kanban-overlay" onClick={onClose}>
      <div className="kanban-board" onClick={(e) => e.stopPropagation()}>
        <div className="kanban-header">
          <h3>📊 Task Board</h3>
          <button className="kanban-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {totalTasks === 0 ? (
          <div className="kanban-empty">
            <p>No tasks yet</p>
            <p className="kanban-empty-hint">
              Talk to the Product Manager to create tasks!
            </p>
          </div>
        ) : (
          <div className="kanban-columns">
            <div className="kanban-column">
              <div className="kanban-column-header">
                <h4>📋 Backlog</h4>
                <span className="kanban-column-count">{tasks.backlog.length}</span>
              </div>
              <div className="kanban-tasks">
                {tasks.backlog.map(renderTask)}
              </div>
            </div>

            <div className="kanban-column">
              <div className="kanban-column-header">
                <h4>🔄 In Progress</h4>
                <span className="kanban-column-count">{tasks.inProgress.length}</span>
              </div>
              <div className="kanban-tasks">
                {tasks.inProgress.map(renderTask)}
              </div>
            </div>

            <div className="kanban-column">
              <div className="kanban-column-header">
                <h4>✅ Done</h4>
                <span className="kanban-column-count">{tasks.done.length}</span>
              </div>
              <div className="kanban-tasks">
                {tasks.done.map(renderTask)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
