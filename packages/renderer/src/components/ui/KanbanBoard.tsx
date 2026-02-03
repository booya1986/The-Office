/**
 * KanbanBoard - Visual task board
 */

import React from 'react'

export const KanbanBoard: React.FC = () => {
  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <h3>📊 Task Board</h3>
        <button>×</button>
      </div>

      <div className="kanban-columns">
        <div className="kanban-column">
          <h4>Backlog</h4>
          <div className="kanban-tasks">
            <div className="kanban-task">Setup project</div>
          </div>
        </div>

        <div className="kanban-column">
          <h4>In Progress</h4>
          <div className="kanban-tasks">
            <div className="kanban-task">Build feature</div>
          </div>
        </div>

        <div className="kanban-column">
          <h4>Done</h4>
          <div className="kanban-tasks">
            <div className="kanban-task">Initial setup</div>
          </div>
        </div>
      </div>
    </div>
  )
}
