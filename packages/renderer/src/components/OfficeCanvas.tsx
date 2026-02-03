/**
 * OfficeCanvas - PixiJS canvas container
 */

import React, { useEffect, useRef } from 'react'
import { OfficeRenderer } from '../office/OfficeRenderer'
import { useOfficeStore } from '../store/officeStore'
import { useAgentStore } from '../store/agentStore'

export const OfficeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<OfficeRenderer | null>(null)

  const { layout, camera, renderOptions } = useOfficeStore()
  const { agents } = useAgentStore()

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize PixiJS renderer
    rendererRef.current = new OfficeRenderer(canvasRef.current, {
      width: layout.width,
      height: layout.height,
      tileSize: layout.tileSize,
    })

    // Start render loop
    rendererRef.current.start()

    // Cleanup
    return () => {
      rendererRef.current?.destroy()
    }
  }, [layout.width, layout.height, layout.tileSize])

  // Update camera
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setCamera(camera)
    }
  }, [camera])

  // Update render options
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setRenderOptions(renderOptions)
    }
  }, [renderOptions])

  // Update agents
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateAgents(Array.from(agents.values()))
    }
  }, [agents])

  return (
    <div className="office-canvas-container">
      <div ref={canvasRef} className="office-canvas" />

      {/* Canvas controls */}
      <div className="office-canvas-controls">
        <button
          onClick={() => useOfficeStore.getState().toggleGrid()}
          className="control-btn"
        >
          {renderOptions.showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
        <button
          onClick={() => useOfficeStore.getState().toggleAgentNames()}
          className="control-btn"
        >
          {renderOptions.showAgentNames ? 'Hide Names' : 'Show Names'}
        </button>
        <button
          onClick={() => useOfficeStore.getState().zoomCamera(0.1)}
          className="control-btn"
        >
          Zoom +
        </button>
        <button
          onClick={() => useOfficeStore.getState().zoomCamera(-0.1)}
          className="control-btn"
        >
          Zoom -
        </button>
      </div>
    </div>
  )
}
