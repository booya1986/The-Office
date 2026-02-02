/**
 * PixelOffice - Main component for the visual office interface
 */

import React, { useEffect } from 'react'
import { OfficeCanvas } from './OfficeCanvas'
import { ChatPanel } from './ui/ChatPanel'
import { KanbanBoard } from './ui/KanbanBoard'
import { FileTreePanel } from './ui/FileTreePanel'
import { StatusBar } from './ui/StatusBar'
import { useUIStore } from '../store/uiStore'
import { useOfficeStore } from '../store/officeStore'
import '../styles/pixel-office.css'

export interface PixelOfficeProps {
  projectPath?: string
  onReady?: () => void
}

export const PixelOffice: React.FC<PixelOfficeProps> = ({ projectPath, onReady }) => {
  const { panels } = useUIStore()
  const { initialized, setInitialized } = useOfficeStore()

  useEffect(() => {
    // Initialize office
    setInitialized(true)
    onReady?.()
  }, [setInitialized, onReady])

  if (!initialized) {
    return (
      <div className="pixel-office-loading">
        <div className="loading-spinner" />
        <p>Initializing Pixel Office...</p>
      </div>
    )
  }

  return (
    <div className="pixel-office">
      {/* Left sidebar - File tree */}
      {panels.fileTree.open && (
        <aside
          className="pixel-office-sidebar pixel-office-sidebar-left"
          style={{ width: panels.fileTree.width }}
        >
          <FileTreePanel />
        </aside>
      )}

      {/* Main office canvas */}
      <main className="pixel-office-main">
        <OfficeCanvas />
        <StatusBar />
      </main>

      {/* Right sidebar - Chat */}
      {panels.chat.open && (
        <aside
          className="pixel-office-sidebar pixel-office-sidebar-right"
          style={{ width: panels.chat.width }}
        >
          <ChatPanel />
        </aside>
      )}

      {/* Kanban board (floating) */}
      {panels.kanban.open && (
        <div
          className="pixel-office-kanban-container"
          style={{ width: panels.kanban.width }}
        >
          <KanbanBoard />
        </div>
      )}
    </div>
  )
}
