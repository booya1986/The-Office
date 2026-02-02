/**
 * Agent state store
 * Manages agent sprites, positions, and animations
 */

import { create } from 'zustand'
import type { AgentSpriteData, Position, AgentAnimation } from '../types'
import type { AgentType } from '@pixel-office/shared'

interface AgentState {
  // Agents map
  agents: Map<string, AgentSpriteData>

  // Agent management
  addAgent: (agent: AgentSpriteData) => void
  removeAgent: (agentId: string) => void
  updateAgent: (agentId: string, updates: Partial<AgentSpriteData>) => void

  // Position & movement
  setAgentPosition: (agentId: string, position: Position) => void
  moveAgent: (agentId: string, targetPosition: Position) => void

  // Animation
  setAgentAnimation: (agentId: string, animation: AgentAnimation) => void
  playAnimation: (agentId: string, animation: AgentAnimation, duration?: number) => void

  // Selection
  selectedAgent: string | null
  selectAgent: (agentId: string | null) => void

  // Queries
  getAgent: (agentId: string) => AgentSpriteData | undefined
  getAgentsByType: (type: AgentType) => AgentSpriteData[]
  getAllAgents: () => AgentSpriteData[]
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: new Map(),

  // Agent management
  addAgent: (agent) =>
    set((state) => {
      const newAgents = new Map(state.agents)
      newAgents.set(agent.id, agent)
      return { agents: newAgents }
    }),

  removeAgent: (agentId) =>
    set((state) => {
      const newAgents = new Map(state.agents)
      newAgents.delete(agentId)
      return { agents: newAgents }
    }),

  updateAgent: (agentId, updates) =>
    set((state) => {
      const agent = state.agents.get(agentId)
      if (!agent) return state

      const newAgents = new Map(state.agents)
      newAgents.set(agentId, { ...agent, ...updates })
      return { agents: newAgents }
    }),

  // Position & movement
  setAgentPosition: (agentId, position) =>
    set((state) => {
      const agent = state.agents.get(agentId)
      if (!agent) return state

      const newAgents = new Map(state.agents)
      newAgents.set(agentId, { ...agent, position })
      return { agents: newAgents }
    }),

  moveAgent: (agentId, targetPosition) => {
    // TODO: Implement pathfinding and smooth movement
    get().setAgentPosition(agentId, targetPosition)
  },

  // Animation
  setAgentAnimation: (agentId, animation) =>
    set((state) => {
      const agent = state.agents.get(agentId)
      if (!agent) return state

      const newAgents = new Map(state.agents)
      newAgents.set(agentId, { ...agent, animation })
      return { agents: newAgents }
    }),

  playAnimation: (agentId, animation, duration) => {
    get().setAgentAnimation(agentId, animation)

    if (duration) {
      setTimeout(() => {
        const agent = get().agents.get(agentId)
        if (agent) {
          get().setAgentAnimation(agentId, 'idle')
        }
      }, duration)
    }
  },

  // Selection
  selectedAgent: null,
  selectAgent: (agentId) => set({ selectedAgent: agentId }),

  // Queries
  getAgent: (agentId) => get().agents.get(agentId),

  getAgentsByType: (type) =>
    Array.from(get().agents.values()).filter((agent) => agent.type === type),

  getAllAgents: () => Array.from(get().agents.values()),
}))
