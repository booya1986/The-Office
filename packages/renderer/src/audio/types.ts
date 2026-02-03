/**
 * Audio system types
 */

export enum SoundEffect {
  // Agent actions
  AGENT_SPAWN = 'agent_spawn',
  AGENT_TYPING = 'agent_typing',
  AGENT_THINKING = 'agent_thinking',
  AGENT_COMPLETE = 'agent_complete',
  AGENT_ERROR = 'agent_error',
  AGENT_CELEBRATE = 'agent_celebrate',
  
  // Task events
  TASK_CREATED = 'task_created',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  
  // UI interactions
  PANEL_OPEN = 'panel_open',
  PANEL_CLOSE = 'panel_close',
  BUTTON_CLICK = 'button_click',
  NOTIFICATION = 'notification',
  
  // Office ambience
  KEYBOARD_CLICK = 'keyboard_click',
  COFFEE_POUR = 'coffee_pour',
  PAPER_SHUFFLE = 'paper_shuffle',
}

export enum MusicTrack {
  AMBIENT_LOFI_1 = 'ambient_lofi_1',
  AMBIENT_LOFI_2 = 'ambient_lofi_2',
  AMBIENT_LOFI_3 = 'ambient_lofi_3',
  FOCUS_MODE = 'focus_mode',
  CELEBRATION = 'celebration',
}

export interface AudioSettings {
  masterVolume: number // 0-1
  sfxVolume: number // 0-1
  musicVolume: number // 0-1
  sfxEnabled: boolean
  musicEnabled: boolean
}

export interface SoundConfig {
  volume: number
  pitch: number
  duration: number
  loop?: boolean
}
