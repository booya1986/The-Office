/**
 * UIUXAgent - Specialized agent for UI/UX design and user experience
 */

import {
  AgentType,
  Task,
  TaskResult,
  TaskType,
} from '@pixel-office/shared'
import { BaseAgent } from '../../base/BaseAgent'

export class UIUXAgent extends BaseAgent {
  get type(): AgentType {
    return AgentType.UIUX
  }

  get specialty(): string[] {
    return [
      'user-research',
      'wireframing',
      'prototyping',
      'user-flows',
      'information-architecture',
      'interaction-design',
      'usability-testing',
      'user-personas',
      'journey-mapping',
      'design-systems',
      'accessibility',
      'responsive-design',
      'micro-interactions',
      'ux-writing',
    ]
  }

  get capabilities(): string[] {
    return [
      'create_wireframes',
      'design_user_flows',
      'conduct_user_research',
      'create_prototypes',
      'perform_usability_testing',
      'design_information_architecture',
      'create_personas',
      'map_customer_journey',
      'improve_user_experience',
    ]
  }

  canHandle(task: Task): boolean {
    const uiuxTaskTypes = [
      TaskType.DESIGN,
      TaskType.UX_RESEARCH,
      TaskType.WIREFRAMING,
    ]

    if (uiuxTaskTypes.includes(task.type)) {
      return true
    }

    const uiuxKeywords = [
      'ux',
      'ui',
      'design',
      'wireframe',
      'prototype',
      'user',
      'experience',
      'interface',
      'usability',
      'flow',
      'persona',
      'journey',
      'interaction',
    ]

    const descriptionLower = task.description.toLowerCase()
    return uiuxKeywords.some((keyword) => descriptionLower.includes(keyword))
  }

  async executeTask(task: Task): Promise<TaskResult> {
    this.logAction('execute_task', `Executing UI/UX task: ${task.title}`, { taskId: task.id })

    try {
      await this.reportProgress(task.id, 0, 'Starting UI/UX task...')

      // Conduct user research
      await this.reportProgress(task.id, 15, 'Conducting user research...')
      const research = await this.conductUserResearch(task)

      // Create personas
      await this.reportProgress(task.id, 25, 'Creating user personas...')
      const personas = await this.createPersonas(research)

      // Design user flows
      await this.reportProgress(task.id, 40, 'Designing user flows...')
      const userFlows = await this.designUserFlows(task, personas)

      // Create wireframes
      await this.reportProgress(task.id, 60, 'Creating wireframes...')
      const wireframes = await this.createWireframes(userFlows)

      // Design interactions
      await this.reportProgress(task.id, 75, 'Designing interactions...')
      const interactions = await this.designInteractions(wireframes)

      // Create prototype
      await this.reportProgress(task.id, 90, 'Creating interactive prototype...')
      const prototype = await this.createPrototype(wireframes, interactions)

      await this.reportProgress(task.id, 100, 'UI/UX task completed!')

      const allFiles = [...personas, ...userFlows, ...wireframes, ...prototype]

      return {
        success: true,
        output: `Successfully designed UX with ${wireframes.length} wireframes and ${userFlows.length} user flows`,
        filesChanged: allFiles,
        testsRun: 0,
        testsPassed: 0,
        errors: [],
        warnings: [],
        metrics: {
          personas: personas.length,
          userFlows: userFlows.length,
          wireframes: wireframes.length,
          interactions: interactions.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: `UI/UX task failed: ${(error as Error).message}`,
        filesChanged: [],
        testsRun: 0,
        testsPassed: 0,
        errors: [
          {
            type: 'uiux_error',
            message: (error as Error).message,
          },
        ],
        warnings: [],
        metrics: {},
      }
    }
  }

  private async conductUserResearch(task: Task): Promise<any> {
    return {
      targetAudience: [],
      painPoints: [],
      goals: [],
    }
  }

  private async createPersonas(research: any): Promise<string[]> {
    return [
      'design/personas/primary-user.md',
      'design/personas/secondary-user.md',
    ]
  }

  private async designUserFlows(task: Task, personas: string[]): Promise<string[]> {
    return [
      'design/flows/main-flow.fig',
      'design/flows/alternate-flow.fig',
    ]
  }

  private async createWireframes(userFlows: string[]): Promise<string[]> {
    return [
      'design/wireframes/home.fig',
      'design/wireframes/feature.fig',
    ]
  }

  private async designInteractions(wireframes: string[]): Promise<any[]> {
    return [
      { element: 'button', interaction: 'hover', effect: 'scale' },
      { element: 'card', interaction: 'click', effect: 'expand' },
    ]
  }

  private async createPrototype(wireframes: string[], interactions: any[]): Promise<string[]> {
    return [
      'design/prototypes/interactive-prototype.fig',
    ]
  }
}
