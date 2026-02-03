import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { PixelOffice } from './components/PixelOffice'
import { AudioProvider } from './audio/AudioProvider'
import { AudioIntegration } from './audio/AudioIntegration'
import { AudioControls } from './audio/AudioControls'
import { useAgentStore } from './store/agentStore'
import { AgentType } from '@pixel-office/shared'
import './styles/pixel-office.css'

/**
 * Demo App - Shows the Pixel Office with sample agents
 */
const DemoApp: React.FC = () => {
  const { addAgent, setAgentAnimation } = useAgentStore()

  useEffect(() => {
    // Add sample agents to the office
    const sampleAgents = [
      {
        id: 'orchestrator-1',
        type: AgentType.ORCHESTRATOR,
        name: 'Office Manager',
        position: { x: 8, y: 4 },
        status: 'idle' as const,
        animation: 'idle' as const,
      },
      {
        id: 'frontend-1',
        type: AgentType.FRONTEND,
        name: 'Frontend Dev',
        position: { x: 3, y: 2 },
        status: 'busy' as const,
        animation: 'typing' as const,
      },
      {
        id: 'backend-1',
        type: AgentType.BACKEND,
        name: 'Backend Dev',
        position: { x: 13, y: 2 },
        status: 'busy' as const,
        animation: 'typing' as const,
      },
      {
        id: 'qa-1',
        type: AgentType.QA,
        name: 'QA Engineer',
        position: { x: 5, y: 4 },
        status: 'thinking' as const,
        animation: 'thinking' as const,
      },
      {
        id: 'devops-1',
        type: AgentType.DEVOPS,
        name: 'DevOps',
        position: { x: 11, y: 4 },
        status: 'idle' as const,
        animation: 'idle' as const,
      },
      {
        id: 'uiux-1',
        type: AgentType.UIUX,
        name: 'UI/UX Designer',
        position: { x: 6, y: 2 },
        status: 'busy' as const,
        animation: 'typing' as const,
      },
    ]

    // Add agents to store
    sampleAgents.forEach((agent) => {
      addAgent(agent)
    })

    // Animate agents randomly
    const animationInterval = setInterval(() => {
      const animations = ['idle', 'typing', 'thinking', 'celebrating'] as const
      const randomAgent = sampleAgents[Math.floor(Math.random() * sampleAgents.length)]
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)]

      setAgentAnimation(randomAgent.id, randomAnimation)
    }, 3000)

    return () => {
      clearInterval(animationInterval)
    }
  }, [addAgent, setAgentAnimation])

  return (
    <AudioProvider>
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        {/* Audio Controls in top-right */}
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 1000,
        }}>
          <AudioControls />
        </div>

        {/* Main Office */}
        <PixelOffice
          projectPath="/demo"
          onReady={() => {
            console.log('🏢 Pixel Office is ready!')
          }}
        />

        {/* Audio Integration */}
        <AudioIntegration />

        {/* Demo Info */}
        <div style={{
          position: 'fixed',
          bottom: 10,
          left: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'monospace',
        }}>
          <div><strong>🏢 Pixel Office Demo</strong></div>
          <div>• Click agents to see details</div>
          <div>• Use mouse to pan (drag)</div>
          <div>• Scroll to zoom</div>
          <div>• Toggle panels with keyboard shortcuts</div>
        </div>
      </div>
    </AudioProvider>
  )
}

// Render app
const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>
)
