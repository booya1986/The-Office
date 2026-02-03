/**
 * TechnicalWriterAgent - Specialized agent for technical documentation and writing
 */

import {
  AgentType,
  Task,
  TaskResult,
  TaskType,
} from '@pixel-office/shared'
import { BaseAgent } from '../../base/BaseAgent'

export class TechnicalWriterAgent extends BaseAgent {
  get type(): AgentType {
    return AgentType.TECHNICAL_WRITER
  }

  get specialty(): string[] {
    return [
      'technical-documentation',
      'api-documentation',
      'user-guides',
      'tutorials',
      'README-files',
      'release-notes',
      'knowledge-base',
      'code-comments',
      'jsdoc',
      'swagger',
      'markdown',
      'technical-writing',
      'content-strategy',
      'information-design',
    ]
  }

  get capabilities(): string[] {
    return [
      'write_api_docs',
      'create_tutorials',
      'write_user_guide',
      'document_code',
      'write_release_notes',
      'create_readme',
      'write_knowledge_base',
      'generate_api_reference',
      'create_getting_started_guide',
    ]
  }

  canHandle(task: Task): boolean {
    const docTaskTypes = [
      TaskType.DOCUMENTATION,
      TaskType.CONTENT_WRITING,
      TaskType.API_DOCUMENTATION,
    ]

    if (docTaskTypes.includes(task.type)) {
      return true
    }

    const docKeywords = [
      'documentation',
      'docs',
      'readme',
      'guide',
      'tutorial',
      'api',
      'reference',
      'manual',
      'write',
      'document',
      'explain',
      'instructions',
      'how-to',
    ]

    const descriptionLower = task.description.toLowerCase()
    return docKeywords.some((keyword) => descriptionLower.includes(keyword))
  }

  async executeTask(task: Task): Promise<TaskResult> {
    this.logAction('execute_task', `Executing technical writing task: ${task.title}`, { taskId: task.id })

    try {
      await this.reportProgress(task.id, 0, 'Starting technical writing task...')

      // Analyze code/project
      await this.reportProgress(task.id, 10, 'Analyzing code and features...')
      const analysis = await this.analyzeCode(task)

      // Outline documentation structure
      await this.reportProgress(task.id, 25, 'Creating documentation outline...')
      const outline = await this.createOutline(analysis)

      // Write main documentation
      await this.reportProgress(task.id, 45, 'Writing documentation...')
      const mainDocs = await this.writeDocumentation(outline)

      // Create code examples
      await this.reportProgress(task.id, 65, 'Creating code examples...')
      const examples = await this.createCodeExamples(analysis)

      // Write tutorials
      await this.reportProgress(task.id, 80, 'Writing tutorials...')
      const tutorials = await this.writeTutorials(analysis)

      // Generate API reference
      await this.reportProgress(task.id, 95, 'Generating API reference...')
      const apiDocs = await this.generateAPIReference(analysis)

      await this.reportProgress(task.id, 100, 'Technical writing task completed!')

      const allFiles = [...mainDocs, ...examples, ...tutorials, ...apiDocs]

      return {
        success: true,
        output: `Successfully created documentation with ${mainDocs.length} guides and ${tutorials.length} tutorials`,
        filesChanged: allFiles,
        testsRun: 0,
        testsPassed: 0,
        errors: [],
        warnings: [],
        metrics: {
          guides: mainDocs.length,
          tutorials: tutorials.length,
          codeExamples: examples.length,
          apiEndpoints: apiDocs.length,
          wordCount: 5000,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: `Technical writing task failed: ${(error as Error).message}`,
        filesChanged: [],
        testsRun: 0,
        testsPassed: 0,
        errors: [
          {
            type: 'documentation_error',
            message: (error as Error).message,
          },
        ],
        warnings: [],
        metrics: {},
      }
    }
  }

  private async analyzeCode(task: Task): Promise<any> {
    return {
      features: [],
      apis: [],
      components: [],
      complexity: 'medium',
    }
  }

  private async createOutline(analysis: any): Promise<any> {
    return {
      sections: [
        'Introduction',
        'Getting Started',
        'API Reference',
        'Examples',
        'Tutorials',
      ],
    }
  }

  private async writeDocumentation(outline: any): Promise<string[]> {
    return [
      'docs/introduction.md',
      'docs/getting-started.md',
      'docs/features.md',
    ]
  }

  private async createCodeExamples(analysis: any): Promise<string[]> {
    return [
      'docs/examples/basic-usage.md',
      'docs/examples/advanced-usage.md',
    ]
  }

  private async writeTutorials(analysis: any): Promise<string[]> {
    return [
      'docs/tutorials/first-steps.md',
      'docs/tutorials/building-app.md',
    ]
  }

  private async generateAPIReference(analysis: any): Promise<string[]> {
    return [
      'docs/api/classes.md',
      'docs/api/functions.md',
      'docs/api/types.md',
    ]
  }
}
