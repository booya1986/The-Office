/**
 * SoundGenerator - Generates 8-bit style sounds using Web Audio API
 *
 * Creates retro game-style sound effects programmatically without
 * requiring audio files.
 */
export class SoundGenerator {
  private audioContext: AudioContext

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  /**
   * Play a beep sound (simple tone)
   */
  playBeep(frequency: number = 440, duration: number = 0.1, volume: number = 0.3): void {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'square' // 8-bit style square wave

    gainNode.gain.value = volume
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    )

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  /**
   * Play a power-up sound (ascending pitch)
   */
  playPowerUp(volume: number = 0.3): void {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'square'
    oscillator.frequency.value = 220
    oscillator.frequency.exponentialRampToValueAtTime(
      880,
      this.audioContext.currentTime + 0.3
    )

    gainNode.gain.value = volume
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3
    )

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  /**
   * Play a success sound (major chord)
   */
  playSuccess(volume: number = 0.3): void {
    const frequencies = [523.25, 659.25, 783.99] // C, E, G (C major chord)
    const duration = 0.5

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 0.15, volume * 0.5)
      }, index * 50)
    })
  }

  /**
   * Play an error sound (descending pitch)
   */
  playError(volume: number = 0.3): void {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'sawtooth'
    oscillator.frequency.value = 440
    oscillator.frequency.exponentialRampToValueAtTime(
      110,
      this.audioContext.currentTime + 0.2
    )

    gainNode.gain.value = volume
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.2
    )

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  /**
   * Play a click sound
   */
  playClick(volume: number = 0.2): void {
    this.playBeep(800, 0.05, volume)
  }

  /**
   * Play a typing sound
   */
  playTyping(volume: number = 0.15): void {
    const frequency = 200 + Math.random() * 200
    this.playBeep(frequency, 0.03, volume)
  }

  /**
   * Play a notification sound
   */
  playNotification(volume: number = 0.3): void {
    this.playBeep(880, 0.1, volume)
    setTimeout(() => {
      this.playBeep(1108, 0.15, volume)
    }, 100)
  }

  /**
   * Play a celebration sound (fanfare)
   */
  playCelebration(volume: number = 0.3): void {
    const melody = [
      { freq: 523, time: 0 },     // C
      { freq: 659, time: 150 },   // E
      { freq: 784, time: 300 },   // G
      { freq: 1047, time: 450 },  // C (high)
    ]

    melody.forEach(note => {
      setTimeout(() => {
        this.playBeep(note.freq, 0.2, volume)
      }, note.time)
    })
  }

  /**
   * Play a swoosh sound (panel open/close)
   */
  playSwoosh(volume: number = 0.2): void {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.value = 800
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      this.audioContext.currentTime + 0.2
    )

    gainNode.gain.value = volume
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.2
    )

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  /**
   * Generate white noise (for ambient sounds)
   */
  playWhiteNoise(duration: number = 0.1, volume: number = 0.1): void {
    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = buffer
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    gainNode.gain.value = volume

    source.start(this.audioContext.currentTime)
  }

  /**
   * Cleanup audio context
   */
  dispose(): void {
    this.audioContext.close()
  }
}
