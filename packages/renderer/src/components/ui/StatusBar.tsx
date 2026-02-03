/**
 * StatusBar - Bottom status bar
 */

import React from 'react'
import { useAgentStore } from '../../store/agentStore'

export const StatusBar: React.FC = () => {
  const agents = useAgentStore((state) => state.getAllAgents())

  const workingAgents = agents.filter((a) => a.status === 'working').length
  const totalAgents = agents.length

  return (
    <div className="status-bar">
      <div className="status-item">
        <span>🤖 Agents: {workingAgents}/{totalAgents} working</span>
      </div>
      <div className="status-item">
        <span>📊 Tasks: 0 active</span>
      </div>
      <div className="status-item">
        <span>⚡ Ready</span>
      </div>
    </div>
  )
}
