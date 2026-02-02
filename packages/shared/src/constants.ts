/**
 * Global Constants
 */

export const APP_NAME = 'Pixel Office Simulator'
export const APP_VERSION = '0.1.0'
export const APP_DESCRIPTION = 'Visual Development Environment with AI Agent Orchestration'

// Office Configuration
export const OFFICE_CONFIG = {
  TILE_WIDTH: 64,
  TILE_HEIGHT: 32,
  SPRITE_SIZE: 32,
  MAX_AGENTS: 16,
  DEFAULT_THEME: 'modern-office',
} as const

// Agent Configuration
export const AGENT_CONFIG = {
  MAX_QUEUE_SIZE: 100,
  HEARTBEAT_INTERVAL: 5000, // ms
  TASK_TIMEOUT: 600000, // 10 minutes
  RETRY_ATTEMPTS: 3,
} as const

// API Configuration
export const API_CONFIG = {
  CLAUDE_MODEL: 'claude-opus-4-5-20251101',
  CLAUDE_MAX_TOKENS: 4096,
  CLAUDE_TEMPERATURE: 0.7,
  REQUEST_TIMEOUT: 30000, // ms
} as const

// File System
export const FS_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  WATCH_DEBOUNCE: 300, // ms
  IGNORED_DIRS: ['node_modules', '.git', 'dist', 'build', '.next', 'out'],
} as const

// UI
export const UI_CONFIG = {
  ANIMATION_FPS: 12,
  IDLE_FPS: 4,
  MAX_CHAT_HISTORY: 1000,
  AUTO_SAVE_INTERVAL: 60000, // 1 minute
} as const

// Colors (Pixel Art Palette)
export const COLOR_PALETTE = {
  // Office Colors
  FLOOR: '#8B7355',
  WALL: '#E5D4B5',
  SHADOW: '#3D3D3D',
  HIGHLIGHT: '#FFFFFF',

  // Agent Colors
  ORCHESTRATOR: '#FFD700', // Gold
  FRONTEND: '#61DAFB', // React Blue
  BACKEND: '#3C873A', // Node Green
  QA: '#E94B3C', // Red
  DEVOPS: '#0DB7ED', // Docker Blue
  SECURITY: '#FF6B6B', // Security Red
  DATABASE: '#336791', // PostgreSQL Blue
  DOCUMENTATION: '#FFA500', // Orange

  // Status Colors
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
} as const

// Keyboard Shortcuts
export const SHORTCUTS = {
  TOGGLE_OFFICE: 'F12',
  OPEN_CHAT: 'C',
  NEW_PROJECT: 'Ctrl+N',
  OPEN_PROJECT: 'Ctrl+O',
  SAVE: 'Ctrl+S',
  FIND: 'Ctrl+F',
  COMMAND_PALETTE: 'Ctrl+Shift+P',
} as const
