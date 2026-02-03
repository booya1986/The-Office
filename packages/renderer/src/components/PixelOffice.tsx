/**
 * PixelOffice - Main component for the visual office interface
 */

import React, { useEffect, useState } from 'react'
import { OfficeCanvas } from './OfficeCanvas'
import { ChatPanel } from './ui/ChatPanel'
import { KanbanBoard } from './ui/KanbanBoard'
import { FileTreePanel } from './ui/FileTreePanel'
import { StatusBar } from './ui/StatusBar'
import { useUIStore } from '../store/uiStore'
import { useOfficeStore } from '../store/officeStore'
import { officeManager } from '../services'
import '../styles/pixel-office.css'

export interface PixelOfficeProps {
  projectPath?: string
  onReady?: () => void
  /**
   * Optional core services to connect
   * Pass instances of OrchestratorAgent, TaskManager, ProjectManager
   */
  coreServices?: {
    orchestrator?: any
    taskManager?: any
    projectManager?: any
  }
}

export const PixelOffice: React.FC<PixelOfficeProps> = ({
  projectPath,
  onReady,
  coreServices,
}) => {
  const { panels } = useUIStore()
  const { initialized, setInitialized } = useOfficeStore()
  const [isManagerReady, setIsManagerReady] = useState(false)

  useEffect(() => {
    // Initialize office manager
    const initializeOffice = async () => {
      try {
        // Start the office manager
        await officeManager.start()

        // Connect to core services if provided
        if (coreServices) {
          officeManager.connectToCore(coreServices)
        }

        setIsManagerReady(true)
        setInitialized(true)
        onReady?.()
      } catch (error) {
        console.error('Failed to initialize office:', error)
      }
    }

    initializeOffice()

    // Cleanup on unmount
    return () => {
      officeManager.stop()
    }
  }, [setInitialized, onReady, coreServices])

  if (!initialized || !isManagerReady) {
    return (
      <div className="pixel-office-loading">
        <div className="loading-spinner" />
        <p>Initializing Pixel Office...</p>
        {isManagerReady && <p className="loading-status">Office Manager Ready</p>}
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
