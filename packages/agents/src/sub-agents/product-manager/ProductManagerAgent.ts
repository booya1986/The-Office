/**
 * ProductManagerAgent - Specialized agent for product management and requirements
 */

import {
  AgentType,
  Task,
  TaskResult,
  TaskType,
} from '@pixel-office/shared'
import { BaseAgent } from '../../base/BaseAgent'

export class ProductManagerAgent extends BaseAgent {
  get type(): AgentType {
    return AgentType.PRODUCT_MANAGER
  }

  get specialty(): string[] {
    return [
      'product-strategy',
      'requirements-gathering',
      'user-stories',
      'roadmap-planning',
      'feature-prioritization',
      'stakeholder-management',
      'market-research',
      'competitive-analysis',
      'product-metrics',
      'sprint-planning',
      'backlog-management',
      'product-vision',
    ]
  }

  get capabilities(): string[] {
    return [
      'write_user_stories',
      'prioritize_features',
      'create_roadmap',
      'define_requirements',
      'analyze_competition',
      'gather_feedback',
      'plan_sprints',
      'manage_backlog',
      'define_success_metrics',
    ]
  }

  canHandle(task: Task): boolean {
    const pmTaskTypes = [
      TaskType.PLANNING,
      TaskType.REQUIREMENTS,
      TaskType.FEATURE_SPEC,
    ]

    if (pmTaskTypes.includes(task.type)) {
      return true
    }

    const pmKeywords = [
      'requirements',
      'user story',
      'feature',
      'roadmap',
      'planning',
      'prioritize',
      'backlog',
      'sprint',
      'product',
      'stakeholder',
      'specification',
      'prd',
    ]

    const descriptionLower = task.description.toLowerCase()
    return pmKeywords.some((keyword) => descriptionLower.includes(keyword))
  }

  async executeTask(task: Task): Promise<TaskResult> {
    this.logAction('execute_task', `Executing product management task: ${task.title}`, { taskId: task.id })

    try {
      await this.reportProgress(task.id, 0, 'Starting product management task...')

      // Gather requirements
      await this.reportProgress(task.id, 15, 'Gathering requirements...')
      const requirements = await this.gatherRequirements(task)

      // Write user stories
      await this.reportProgress(task.id, 30, 'Writing user stories...')
      const userStories = await this.writeUserStories(requirements)

      // Prioritize features
      await this.reportProgress(task.id, 50, 'Prioritizing features...')
      const prioritized = await this.prioritizeFeatures(userStories)

      // Create roadmap
      await this.reportProgress(task.id, 70, 'Creating product roadmap...')
      const roadmap = await this.createRoadmap(prioritized)

      // Define success metrics
      await this.reportProgress(task.id, 85, 'Defining success metrics...')
      const metrics = await this.defineMetrics(requirements)

      // Generate PRD
      await this.reportProgress(task.id, 95, 'Generating PRD...')
      const prd = await this.generatePRD(requirements, userStories, roadmap, metrics)

      await this.reportProgress(task.id, 100, 'Product management task completed!')

      const allFiles = [...userStories, ...roadmap, ...prd]

      return {
        success: true,
        output: `Successfully created PRD with ${userStories.length} user stories and roadmap`,
        filesChanged: allFiles,
        testsRun: 0,
        testsPassed: 0,
        errors: [],
        warnings: [],
        metrics: {
          userStories: userStories.length,
          features: prioritized.length,
          milestones: roadmap.length,
          metricsDefned: metrics.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: `Product management task failed: ${(error as Error).message}`,
        filesChanged: [],
        testsRun: 0,
        testsPassed: 0,
        errors: [
          {
            type: 'pm_error',
            message: (error as Error).message,
          },
        ],
        warnings: [],
        metrics: {},
      }
    }
  }

  private async gatherRequirements(task: Task): Promise<any> {
    return {
      functional: [],
      nonFunctional: [],
      constraints: [],
      assumptions: [],
    }
  }

  private async writeUserStories(requirements: any): Promise<string[]> {
    return [
      'product/user-stories/story-1.md',
      'product/user-stories/story-2.md',
      'product/user-stories/story-3.md',
    ]
  }

  private async prioritizeFeatures(userStories: string[]): Promise<any[]> {
    return [
      { priority: 'high', story: userStories[0] },
      { priority: 'medium', story: userStories[1] },
      { priority: 'low', story: userStories[2] },
    ]
  }

  private async createRoadmap(features: any[]): Promise<string[]> {
    return [
      'product/roadmap-q1.md',
      'product/roadmap-q2.md',
    ]
  }

  private async defineMetrics(requirements: any): Promise<any[]> {
    return [
      { name: 'User Activation', target: '70%' },
      { name: 'Feature Adoption', target: '50%' },
    ]
  }

  private async generatePRD(requirements: any, stories: string[], roadmap: string[], metrics: any[]): Promise<string[]> {
    return [
      'product/PRD.md',
      'product/feature-specs.md',
    ]
  }
}
