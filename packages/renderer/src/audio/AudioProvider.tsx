import React, { createContext, useContext, useEffect, useState } from 'react'
import { soundManager } from './SoundManager'
import type { SoundEffect, MusicTrack, AudioSettings } from './types'

interface AudioContextType {
  playSFX: (effect: SoundEffect) => void
  playMusic: (track: MusicTrack) => void
  stopMusic: () => void
  setMasterVolume: (volume: number) => void
  setSFXVolume: (volume: number) => void
  setMusicVolume: (volume: number) => void
  toggleSFX: () => void
  toggleMusic: () => void
  settings: AudioSettings
  isReady: boolean
}

const AudioContext = createContext<AudioContextType | null>(null)

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(soundManager.getSettings())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = async () => {
      await soundManager.initialize()
      setIsReady(true)
    }

    // Listen for first click to initialize
    const handleClick = () => {
      initAudio()
      document.removeEventListener('click', handleClick)
    }

    document.addEventListener('click', handleClick)

    // Listen to settings changes
    const handleSettingsChange = (newSettings: AudioSettings) => {
      setSettings(newSettings)
    }

    soundManager.on('settings:changed', handleSettingsChange)
    soundManager.on('settings:loaded', handleSettingsChange)

    return () => {
      soundManager.off('settings:changed', handleSettingsChange)
      soundManager.off('settings:loaded', handleSettingsChange)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  const value: AudioContextType = {
    playSFX: (effect) => soundManager.playSFX(effect),
    playMusic: (track) => soundManager.playMusic(track),
    stopMusic: () => soundManager.stopMusic(),
    setMasterVolume: (volume) => soundManager.setMasterVolume(volume),
    setSFXVolume: (volume) => soundManager.setSFXVolume(volume),
    setMusicVolume: (volume) => soundManager.setMusicVolume(volume),
    toggleSFX: () => soundManager.toggleSFX(),
    toggleMusic: () => soundManager.toggleMusic(),
    settings,
    isReady,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

/**
 * Hook to use audio in components
 */
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return context
}
