/**
 * GraphicDesignerAgent - Specialized agent for graphic design and visual assets
 */

import {
  AgentType,
  Task,
  TaskResult,
  TaskType,
} from '@pixel-office/shared'
import { BaseAgent } from '../../base/BaseAgent'

export class GraphicDesignerAgent extends BaseAgent {
  get type(): AgentType {
    return AgentType.GRAPHIC_DESIGNER
  }

  get specialty(): string[] {
    return [
      'visual-design',
      'branding',
      'logo-design',
      'illustrations',
      'icons',
      'typography',
      'color-theory',
      'layout-design',
      'infographics',
      'image-editing',
      'vector-graphics',
      'brand-identity',
      'design-systems',
      'asset-creation',
    ]
  }

  get capabilities(): string[] {
    return [
      'create_logo',
      'design_brand_identity',
      'create_icons',
      'design_illustrations',
      'create_infographics',
      'design_layouts',
      'choose_color_palette',
      'select_typography',
      'create_visual_assets',
    ]
  }

  canHandle(task: Task): boolean {
    const graphicTaskTypes = [
      TaskType.DESIGN,
      TaskType.ASSET_CREATION,
      TaskType.BRANDING,
    ]

    if (graphicTaskTypes.includes(task.type)) {
      return true
    }

    const graphicKeywords = [
      'logo',
      'branding',
      'brand',
      'icon',
      'illustration',
      'graphic',
      'design',
      'visual',
      'color',
      'typography',
      'layout',
      'asset',
      'image',
      'infographic',
    ]

    const descriptionLower = task.description.toLowerCase()
    return graphicKeywords.some((keyword) => descriptionLower.includes(keyword))
  }

  async executeTask(task: Task): Promise<TaskResult> {
    this.logAction('execute_task', `Executing graphic design task: ${task.title}`, { taskId: task.id })

    try {
      await this.reportProgress(task.id, 0, 'Starting graphic design task...')

      // Understand brand requirements
      await this.reportProgress(task.id, 10, 'Understanding brand requirements...')
      const requirements = await this.analyzeBrandRequirements(task)

      // Choose color palette
      await this.reportProgress(task.id, 25, 'Selecting color palette...')
      const colorPalette = await this.selectColorPalette(requirements)

      // Select typography
      await this.reportProgress(task.id, 35, 'Choosing typography...')
      const typography = await this.selectTypography(requirements)

      // Create visual assets
      await this.reportProgress(task.id, 50, 'Creating visual assets...')
      const assets = await this.createVisualAssets(requirements, colorPalette, typography)

      // Design layouts
      await this.reportProgress(task.id, 70, 'Designing layouts...')
      const layouts = await this.designLayouts(assets)

      // Create design system
      await this.reportProgress(task.id, 90, 'Creating design system documentation...')
      const designSystem = await this.createDesignSystem(colorPalette, typography, assets)

      await this.reportProgress(task.id, 100, 'Graphic design task completed!')

      const allFiles = [...assets, ...layouts, ...designSystem]

      return {
        success: true,
        output: `Successfully created ${assets.length} visual assets and design system`,
        filesChanged: allFiles,
        testsRun: 0,
        testsPassed: 0,
        errors: [],
        warnings: [],
        metrics: {
          assets: assets.length,
          layouts: layouts.length,
          colorVariants: colorPalette.length,
          typefaces: typography.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        output: `Graphic design task failed: ${(error as Error).message}`,
        filesChanged: [],
        testsRun: 0,
        testsPassed: 0,
        errors: [
          {
            type: 'design_error',
            message: (error as Error).message,
          },
        ],
        warnings: [],
        metrics: {},
      }
    }
  }

  private async analyzeBrandRequirements(task: Task): Promise<any> {
    return {
      style: 'modern',
      mood: 'professional',
      target: 'developers',
    }
  }

  private async selectColorPalette(requirements: any): Promise<any[]> {
    return [
      { name: 'primary', hex: '#4F46E5' },
      { name: 'secondary', hex: '#06B6D4' },
      { name: 'accent', hex: '#F59E0B' },
    ]
  }

  private async selectTypography(requirements: any): Promise<any[]> {
    return [
      { role: 'heading', font: 'Inter', weight: 'bold' },
      { role: 'body', font: 'Inter', weight: 'regular' },
    ]
  }

  private async createVisualAssets(requirements: any, colors: any[], typography: any[]): Promise<string[]> {
    return [
      'assets/logo.svg',
      'assets/logo-dark.svg',
      'assets/icons/check.svg',
      'assets/icons/arrow.svg',
      'assets/illustrations/hero.svg',
    ]
  }

  private async designLayouts(assets: string[]): Promise<string[]> {
    return [
      'design/layouts/landing-page.fig',
      'design/layouts/dashboard.fig',
    ]
  }

  private async createDesignSystem(colors: any[], typography: any[], assets: string[]): Promise<string[]> {
    return [
      'design/design-system.md',
      'design/brand-guidelines.pdf',
    ]
  }
}
