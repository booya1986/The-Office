/**
 * VoiceInput - Speech-to-text input component using Web Speech API
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'

export interface VoiceInputProps {
  onTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void
  disabled?: boolean
}

// Check for Web Speech API support
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onInterimTranscript,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setIsSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimText('')
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setInterimText('')
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (interimTranscript) {
          setInterimText(interimTranscript)
          onInterimTranscript?.(interimTranscript)
        }

        if (finalTranscript) {
          setInterimText('')
          onTranscript(finalTranscript.trim())
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript, onInterimTranscript])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || disabled) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }, [isListening, disabled])

  if (!isSupported) {
    return (
      <button className="voice-btn voice-btn-unsupported" disabled title="Speech recognition not supported">
        🎤
      </button>
    )
  }

  return (
    <div className="voice-input-container">
      <button
        className={`voice-btn ${isListening ? 'voice-btn-active' : ''}`}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <span className="voice-indicator">
            <span className="voice-pulse"></span>
            🎙️
          </span>
        ) : (
          '🎤'
        )}
      </button>
      {interimText && (
        <div className="voice-interim-text">
          {interimText}...
        </div>
      )}
    </div>
  )
}
