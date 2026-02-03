/**
 * UI state store
 * Manages UI panels, modals, and interactions
 */

import { create } from 'zustand'
import type { UIPanelState } from '../types'

interface UIState {
  // Panel states
  panels: UIPanelState

  // Panel actions
  togglePanel: (panel: keyof UIPanelState) => void
  openPanel: (panel: keyof UIPanelState) => void
  closePanel: (panel: keyof UIPanelState) => void
  setPanelWidth: (panel: keyof UIPanelState, width: number) => void

  // Agent info panel
  showAgentInfo: (agentId: string) => void
  hideAgentInfo: () => void

  // Modals
  activeModal: string | null
  showModal: (modalId: string) => void
  hideModal: () => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void

  // Loading
  loading: boolean
  loadingMessage: string
  setLoading: (loading: boolean, message?: string) => void
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: number
  duration?: number
}

const DEFAULT_PANELS: UIPanelState = {
  chat: { open: true, width: 400 },
  kanban: { open: false, width: 600 },
  fileTree: { open: false, width: 300 },
  agentInfo: { open: false },
}

export const useUIStore = create<UIState>((set, get) => ({
  // Panels
  panels: DEFAULT_PANELS,

  togglePanel: (panel) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panel]: {
          ...state.panels[panel],
          open: !state.panels[panel].open,
        },
      },
    })),

  openPanel: (panel) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panel]: {
          ...state.panels[panel],
          open: true,
        },
      },
    })),

  closePanel: (panel) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panel]: {
          ...state.panels[panel],
          open: false,
        },
      },
    })),

  setPanelWidth: (panel, width) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panel]: {
          ...state.panels[panel],
          width,
        },
      },
    })),

  // Agent info
  showAgentInfo: (agentId) =>
    set((state) => ({
      panels: {
        ...state.panels,
        agentInfo: {
          open: true,
          selectedAgent: agentId,
        },
      },
    })),

  hideAgentInfo: () =>
    set((state) => ({
      panels: {
        ...state.panels,
        agentInfo: {
          open: false,
          selectedAgent: undefined,
        },
      },
    })),

  // Modals
  activeModal: null,
  showModal: (modalId) => set({ activeModal: modalId }),
  hideModal: () => set({ activeModal: null }),

  // Notifications
  notifications: [],

  addNotification: (notification) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotif: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    }

    set((state) => ({
      notifications: [...state.notifications, newNotif],
    }))

    // Auto-remove after duration
    if (notification.duration !== undefined) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration)
    } else {
      // Default 5 seconds
      setTimeout(() => {
        get().removeNotification(id)
      }, 5000)
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Loading
  loading: false,
  loadingMessage: '',
  setLoading: (loading, message = '') =>
    set({ loading, loadingMessage: message }),
}))
