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

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

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
  /**
   * Chat connection props (for backend integration)
   */
  chatProps?: {
    chatHistory?: ChatMessage[]
    streamingMessage?: string
    isStreaming?: boolean
    onSendMessage?: (message: string) => void
    connected?: boolean
  }
}

export const PixelOffice: React.FC<PixelOfficeProps> = ({
  projectPath,
  onReady,
  coreServices,
  chatProps,
}) => {
  const { panels } = useUIStore()
  const { initialized, setInitialized } = useOfficeStore()
  const [isManagerReady, setIsManagerReady] = useState(false)
  const [showKanban, setShowKanban] = useState(false)

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

        {/* Kanban toggle button */}
        <button
          className="kanban-toggle-btn"
          onClick={() => setShowKanban(true)}
        >
          📊 Task Board
        </button>

        <StatusBar />
      </main>

      {/* Right sidebar - Chat */}
      {panels.chat.open && (
        <aside
          className="pixel-office-sidebar pixel-office-sidebar-right"
          style={{ width: panels.chat.width }}
        >
          <ChatPanel {...chatProps} />
        </aside>
      )}

      {/* Kanban board (floating overlay) */}
      {showKanban && (
        <KanbanBoard onClose={() => setShowKanban(false)} />
      )}
    </div>
  )
}
