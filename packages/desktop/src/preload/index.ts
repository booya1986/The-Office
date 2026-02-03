import { contextBridge, ipcRenderer } from 'electron'

/**
 * Preload script - Expose safe APIs to renderer process
 *
 * This script runs in the renderer context but has access to Node.js APIs.
 * It uses contextBridge to expose a limited, safe API to the renderer.
 */

// Define the API interface
export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>
  getPath: (name: string) => Promise<string>

  // Window controls
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void

  // Agent operations
  sendMessageToAgent: (message: string) => Promise<any>

  // Task operations
  createTask: (task: any) => Promise<any>

  // Event listeners
  onMenuCommand: (callback: (command: string, data?: any) => void) => void
  removeMenuCommandListener: (callback: (command: string, data?: any) => void) => void
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
  getPath: (name: string) => ipcRenderer.invoke('app:path', name),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // Agent operations
  sendMessageToAgent: (message: string) => ipcRenderer.invoke('agent:send-message', message),

  // Task operations
  createTask: (task: any) => ipcRenderer.invoke('task:create', task),

  // Event listeners
  onMenuCommand: (callback) => {
    const listener = (_event: any, command: string, data?: any) => {
      callback(command, data)
    }
    ipcRenderer.on('menu:new-project', () => listener(null, 'new-project'))
    ipcRenderer.on('menu:open-project', () => listener(null, 'open-project'))
    ipcRenderer.on('menu:toggle-panel', (_event, panel) => listener(null, 'toggle-panel', panel))
    ipcRenderer.on('menu:list-agents', () => listener(null, 'list-agents'))
    ipcRenderer.on('menu:chat-manager', () => listener(null, 'chat-manager'))
    ipcRenderer.on('menu:about', () => listener(null, 'about'))
  },

  removeMenuCommandListener: (callback) => {
    ipcRenderer.removeAllListeners('menu:new-project')
    ipcRenderer.removeAllListeners('menu:open-project')
    ipcRenderer.removeAllListeners('menu:toggle-panel')
    ipcRenderer.removeAllListeners('menu:list-agents')
    ipcRenderer.removeAllListeners('menu:chat-manager')
    ipcRenderer.removeAllListeners('menu:about')
  },
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
