/**
 * @pixel-office/renderer
 * Visual office interface with React and PixiJS
 */

// Core Components
export { PixelOffice } from './components/PixelOffice'
export { OfficeCanvas } from './components/OfficeCanvas'

// UI Components
export { ChatPanel } from './components/ui/ChatPanel'
export { KanbanBoard } from './components/ui/KanbanBoard'
export { FileTreePanel } from './components/ui/FileTreePanel'
export { StatusBar } from './components/ui/StatusBar'

// Office Rendering
export { OfficeRenderer } from './office/OfficeRenderer'
export { AgentSprite } from './office/sprites/AgentSprite'
export { FurnitureSprite } from './office/sprites/FurnitureSprite'

// State Management
export { useOfficeStore } from './store/officeStore'
export { useAgentStore } from './store/agentStore'
export { useUIStore } from './store/uiStore'

// Types
export * from './types'
