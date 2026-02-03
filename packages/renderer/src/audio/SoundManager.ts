import { EventEmitter } from 'eventemitter3'
import { SoundGenerator } from './SoundGenerator'
import type { SoundEffect, MusicTrack, AudioSettings } from './types'

/**
 * SoundManager - Central manager for all audio in the application
 *
 * Manages:
 * - Sound effects (8-bit style using Web Audio API)
 * - Background music (lo-fi ambient tracks)
 * - Volume controls and settings
 * - Audio context lifecycle
 */
export class SoundManager extends EventEmitter {
  private soundGenerator: SoundGenerator
  private settings: AudioSettings
  private musicAudio: HTMLAudioElement | null = null
  private currentTrack: MusicTrack | null = null
  private isInitialized: boolean = false

  constructor() {
    super()
    
    // Default settings
    this.settings = {
      masterVolume: 0.7,
      sfxVolume: 0.5,
      musicVolume: 0.3,
      sfxEnabled: true,
      musicEnabled: true,
    }

    this.soundGenerator = new SoundGenerator()

    // Load settings from localStorage
    this.loadSettings()
  }

  /**
   * Initialize audio (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Resume audio context (required after user interaction)
      await this.soundGenerator['audioContext'].resume()
      this.isInitialized = true
      this.emit('initialized')
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }

  /**
   * Play a sound effect
   */
  playSFX(effect: SoundEffect): void {
    if (!this.settings.sfxEnabled || !this.isInitialized) return

    const volume = this.settings.masterVolume * this.settings.sfxVolume

    switch (effect) {
      case SoundEffect.AGENT_SPAWN:
        this.soundGenerator.playPowerUp(volume)
        break
      
      case SoundEffect.AGENT_TYPING:
        this.soundGenerator.playTyping(volume * 0.5)
        break
      
      case SoundEffect.AGENT_THINKING:
        this.soundGenerator.playBeep(440, 0.1, volume * 0.3)
        break
      
      case SoundEffect.AGENT_COMPLETE:
        this.soundGenerator.playSuccess(volume)
        break
      
      case SoundEffect.AGENT_ERROR:
        this.soundGenerator.playError(volume)
        break
      
      case SoundEffect.AGENT_CELEBRATE:
        this.soundGenerator.playCelebration(volume)
        break
      
      case SoundEffect.TASK_CREATED:
        this.soundGenerator.playBeep(660, 0.1, volume * 0.4)
        break
      
      case SoundEffect.TASK_STARTED:
        this.soundGenerator.playBeep(550, 0.15, volume * 0.4)
        break
      
      case SoundEffect.TASK_COMPLETED:
        this.soundGenerator.playSuccess(volume * 0.8)
        break
      
      case SoundEffect.TASK_FAILED:
        this.soundGenerator.playError(volume * 0.8)
        break
      
      case SoundEffect.PANEL_OPEN:
      case SoundEffect.PANEL_CLOSE:
        this.soundGenerator.playSwoosh(volume * 0.5)
        break
      
      case SoundEffect.BUTTON_CLICK:
        this.soundGenerator.playClick(volume)
        break
      
      case SoundEffect.NOTIFICATION:
        this.soundGenerator.playNotification(volume)
        break
      
      case SoundEffect.KEYBOARD_CLICK:
        this.soundGenerator.playTyping(volume * 0.3)
        break
      
      case SoundEffect.COFFEE_POUR:
      case SoundEffect.PAPER_SHUFFLE:
        this.soundGenerator.playWhiteNoise(0.15, volume * 0.2)
        break
      
      default:
        this.soundGenerator.playClick(volume)
    }

    this.emit('sfx:played', effect)
  }

  /**
   * Play background music
   */
  playMusic(track: MusicTrack): void {
    if (!this.settings.musicEnabled) return

    // Stop current music
    this.stopMusic()

    // Note: In a real implementation, you would load actual audio files
    // For now, we'll just emit an event
    this.currentTrack = track
    this.emit('music:started', track)

    // Could implement actual music playback here:
    // this.musicAudio = new Audio(`/assets/music/${track}.mp3`)
    // this.musicAudio.volume = this.settings.masterVolume * this.settings.musicVolume
    // this.musicAudio.loop = true
    // this.musicAudio.play()
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.musicAudio) {
      this.musicAudio.pause()
      this.musicAudio.currentTime = 0
      this.musicAudio = null
    }

    if (this.currentTrack) {
      this.emit('music:stopped', this.currentTrack)
      this.currentTrack = null
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume))
    this.updateMusicVolume()
    this.saveSettings()
    this.emit('settings:changed', this.settings)
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
    this.emit('settings:changed', this.settings)
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume))
    this.updateMusicVolume()
    this.saveSettings()
    this.emit('settings:changed', this.settings)
  }

  /**
   * Toggle SFX
   */
  toggleSFX(): void {
    this.settings.sfxEnabled = !this.settings.sfxEnabled
    this.saveSettings()
    this.emit('settings:changed', this.settings)
  }

  /**
   * Toggle music
   */
  toggleMusic(): void {
    this.settings.musicEnabled = !this.settings.musicEnabled
    
    if (!this.settings.musicEnabled) {
      this.stopMusic()
    }
    
    this.saveSettings()
    this.emit('settings:changed', this.settings)
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  /**
   * Update music volume
   */
  private updateMusicVolume(): void {
    if (this.musicAudio) {
      this.musicAudio.volume = this.settings.masterVolume * this.settings.musicVolume
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('pixel-office-audio-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save audio settings:', error)
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('pixel-office-audio-settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
        this.emit('settings:loaded', this.settings)
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error)
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopMusic()
    this.soundGenerator.dispose()
    this.removeAllListeners()
  }

  /**
   * Check if audio is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

// Singleton instance
export const soundManager = new SoundManager()
