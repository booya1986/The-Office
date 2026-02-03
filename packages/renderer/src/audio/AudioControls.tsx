import React from 'react'
import { useAudio } from './AudioProvider'
import './AudioControls.css'

export const AudioControls: React.FC = () => {
  const {
    settings,
    setMasterVolume,
    setSFXVolume,
    setMusicVolume,
    toggleSFX,
    toggleMusic,
    isReady,
  } = useAudio()

  if (!isReady) {
    return (
      <div className="audio-controls">
        <div className="audio-init-message">
          Click anywhere to enable audio
        </div>
      </div>
    )
  }

  return (
    <div className="audio-controls">
      <h3>🎵 Audio Settings</h3>

      {/* Master Volume */}
      <div className="audio-control">
        <label>
          <span>🔊 Master Volume</span>
          <span className="volume-value">{Math.round(settings.masterVolume * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.masterVolume * 100}
          onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
          className="volume-slider"
        />
      </div>

      {/* SFX Volume */}
      <div className="audio-control">
        <label>
          <span>🎮 Sound Effects</span>
          <span className="volume-value">{Math.round(settings.sfxVolume * 100)}%</span>
        </label>
        <div className="control-row">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.sfxVolume * 100}
            onChange={(e) => setSFXVolume(Number(e.target.value) / 100)}
            className="volume-slider"
            disabled={!settings.sfxEnabled}
          />
          <button
            onClick={toggleSFX}
            className={`toggle-button ${settings.sfxEnabled ? 'active' : ''}`}
          >
            {settings.sfxEnabled ? '✓' : '✗'}
          </button>
        </div>
      </div>

      {/* Music Volume */}
      <div className="audio-control">
        <label>
          <span>🎹 Background Music</span>
          <span className="volume-value">{Math.round(settings.musicVolume * 100)}%</span>
        </label>
        <div className="control-row">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume * 100}
            onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
            className="volume-slider"
            disabled={!settings.musicEnabled}
          />
          <button
            onClick={toggleMusic}
            className={`toggle-button ${settings.musicEnabled ? 'active' : ''}`}
          >
            {settings.musicEnabled ? '✓' : '✗'}
          </button>
        </div>
      </div>
    </div>
  )
}
