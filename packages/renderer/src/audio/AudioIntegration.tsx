import { useEffect } from 'react'
import { useAudio } from './AudioProvider'
import { agentBridge } from '../services/AgentBridge'
import { taskBridge } from '../services/TaskBridge'
import { SoundEffect } from './types'

/**
 * AudioIntegration - Connects audio system to app events
 *
 * This component listens to events from bridges and plays
 * appropriate sound effects.
 */
export const AudioIntegration: React.FC = () => {
  const { playSFX } = useAudio()

  useEffect(() => {
    // Agent events
    const handleAgentRegistered = () => {
      playSFX(SoundEffect.AGENT_SPAWN)
    }

    const handleAgentStatusChanged = (_agentId: string, status: string) => {
      if (status === 'thinking' || status === 'planning') {
        playSFX(SoundEffect.AGENT_THINKING)
      }
    }

    const handleTaskStarted = () => {
      playSFX(SoundEffect.TASK_STARTED)
    }

    const handleTaskCompleted = (_agentId: string, _task: any, result: any) => {
      if (result.status === 'completed') {
        playSFX(SoundEffect.AGENT_CELEBRATE)
      } else {
        playSFX(SoundEffect.AGENT_ERROR)
      }
    }

    // Task events
    const handleTaskCreated = () => {
      playSFX(SoundEffect.TASK_CREATED)
    }

    const handleTaskStatusChanged = (_taskId: string, status: string) => {
      if (status === 'completed') {
        playSFX(SoundEffect.TASK_COMPLETED)
      } else if (status === 'failed') {
        playSFX(SoundEffect.TASK_FAILED)
      }
    }

    // Register listeners
    agentBridge.on('agent:registered', handleAgentRegistered)
    agentBridge.on('agent:status-changed', handleAgentStatusChanged)
    agentBridge.on('agent:task-started', handleTaskStarted)
    agentBridge.on('agent:task-completed', handleTaskCompleted)

    taskBridge.on('task:registered', handleTaskCreated)
    taskBridge.on('task:status-changed', handleTaskStatusChanged)

    // Cleanup
    return () => {
      agentBridge.off('agent:registered', handleAgentRegistered)
      agentBridge.off('agent:status-changed', handleAgentStatusChanged)
      agentBridge.off('agent:task-started', handleTaskStarted)
      agentBridge.off('agent:task-completed', handleTaskCompleted)

      taskBridge.off('task:registered', handleTaskCreated)
      taskBridge.off('task:status-changed', handleTaskStatusChanged)
    }
  }, [playSFX])

  // This component doesn't render anything
  return null
}
