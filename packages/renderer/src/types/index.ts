/**
 * Renderer type definitions
 */

import type { AgentType, AgentStatus, Task } from '@pixel-office/shared'

/**
 * Office layout configuration
 */
export interface OfficeLayout {
  width: number
  height: number
  tileSize: number
  gridSize: { cols: number; rows: number }
  theme: OfficeTheme
}

export type OfficeTheme = 'modern-office' | 'retro-office' | 'minimal-office' | 'cozy-office'

/**
 * Agent sprite data
 */
export interface AgentSpriteData {
  id: string
  type: AgentType
  name: string
  position: Position
  status: AgentStatus
  animation: AgentAnimation
  sprite?: any // PIXI.Sprite
}

export type AgentAnimation =
  | 'idle'
  | 'typing'
  | 'thinking'
  | 'walking'
  | 'celebrating'
  | 'stuck'
  | 'talking'

/**
 * Position on office grid
 */
export interface Position {
  x: number
  y: number
}

/**
 * Furniture/decoration types
 */
export interface FurnitureData {
  id: string
  type: FurnitureType
  position: Position
  size: { width: number; height: number }
  rotation?: number
  occupiedBy?: string // agent ID
}

export type FurnitureType =
  | 'desk'
  | 'chair'
  | 'computer'
  | 'plant'
  | 'bookshelf'
  | 'coffee-machine'
  | 'whiteboard'
  | 'meeting-table'
  | 'water-cooler'
  | 'filing-cabinet'

/**
 * Camera/viewport state
 */
export interface CameraState {
  x: number
  y: number
  zoom: number
  following?: string // agent ID to follow
}

/**
 * Office interaction event
 */
export interface OfficeInteraction {
  type: InteractionType
  target: string // agent or furniture ID
  position: Position
  timestamp: number
}

export type InteractionType =
  | 'agent-click'
  | 'furniture-click'
  | 'floor-click'
  | 'agent-hover'
  | 'drag-start'
  | 'drag-end'

/**
 * UI panel states
 */
export interface UIPanelState {
  chat: { open: boolean; width: number }
  kanban: { open: boolean; width: number }
  fileTree: { open: boolean; width: number }
  agentInfo: { open: boolean; selectedAgent?: string }
}

/**
 * Rendering options
 */
export interface RenderOptions {
  showGrid: boolean
  showAgentNames: boolean
  showAgentStatus: boolean
  showPaths: boolean
  enableShadows: boolean
  animationSpeed: number
}
