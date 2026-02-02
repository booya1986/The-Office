/**
 * Office state store
 * Manages office layout, camera, and rendering options
 */

import { create } from 'zustand'
import type { OfficeLayout, CameraState, RenderOptions, OfficeTheme } from '../types'

interface OfficeState {
  // Office layout
  layout: OfficeLayout
  setLayout: (layout: Partial<OfficeLayout>) => void
  setTheme: (theme: OfficeTheme) => void

  // Camera/viewport
  camera: CameraState
  setCamera: (camera: Partial<CameraState>) => void
  panCamera: (dx: number, dy: number) => void
  zoomCamera: (delta: number) => void
  followAgent: (agentId: string | null) => void

  // Rendering options
  renderOptions: RenderOptions
  setRenderOptions: (options: Partial<RenderOptions>) => void
  toggleGrid: () => void
  toggleAgentNames: () => void

  // Initialization
  initialized: boolean
  setInitialized: (value: boolean) => void
}

const DEFAULT_LAYOUT: OfficeLayout = {
  width: 1600,
  height: 1200,
  tileSize: 32,
  gridSize: { cols: 50, rows: 37 },
  theme: 'modern-office',
}

const DEFAULT_CAMERA: CameraState = {
  x: 0,
  y: 0,
  zoom: 1.0,
  following: undefined,
}

const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  showGrid: false,
  showAgentNames: true,
  showAgentStatus: true,
  showPaths: false,
  enableShadows: true,
  animationSpeed: 1.0,
}

export const useOfficeStore = create<OfficeState>((set) => ({
  // Layout
  layout: DEFAULT_LAYOUT,
  setLayout: (layout) =>
    set((state) => ({
      layout: { ...state.layout, ...layout },
    })),
  setTheme: (theme) =>
    set((state) => ({
      layout: { ...state.layout, theme },
    })),

  // Camera
  camera: DEFAULT_CAMERA,
  setCamera: (camera) =>
    set((state) => ({
      camera: { ...state.camera, ...camera },
    })),
  panCamera: (dx, dy) =>
    set((state) => ({
      camera: {
        ...state.camera,
        x: state.camera.x + dx,
        y: state.camera.y + dy,
      },
    })),
  zoomCamera: (delta) =>
    set((state) => {
      const newZoom = Math.max(0.5, Math.min(2.0, state.camera.zoom + delta))
      return {
        camera: {
          ...state.camera,
          zoom: newZoom,
        },
      }
    }),
  followAgent: (agentId) =>
    set((state) => ({
      camera: {
        ...state.camera,
        following: agentId || undefined,
      },
    })),

  // Render options
  renderOptions: DEFAULT_RENDER_OPTIONS,
  setRenderOptions: (options) =>
    set((state) => ({
      renderOptions: { ...state.renderOptions, ...options },
    })),
  toggleGrid: () =>
    set((state) => ({
      renderOptions: {
        ...state.renderOptions,
        showGrid: !state.renderOptions.showGrid,
      },
    })),
  toggleAgentNames: () =>
    set((state) => ({
      renderOptions: {
        ...state.renderOptions,
        showAgentNames: !state.renderOptions.showAgentNames,
      },
    })),

  // Initialization
  initialized: false,
  setInitialized: (value) => set({ initialized: value }),
}))
