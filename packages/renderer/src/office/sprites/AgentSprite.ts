/**
 * AgentSprite - Represents an agent in the office
 */

import * as PIXI from 'pixi.js'
import type { AgentSpriteData, Position } from '../../types'
import { AgentType } from '@pixel-office/shared'

// Agent sprite image paths
const AGENT_IMAGES = {
  male: '/agent_male.png',
  female: '/agent_female.png',
}

// Determine gender based on agent type (for visual variety)
const FEMALE_AGENT_TYPES = [
  AgentType.FRONTEND,
  AgentType.QA,
  AgentType.ACCESSIBILITY,
  AgentType.UIUX,
  AgentType.GRAPHIC_DESIGNER,
  AgentType.DOCUMENTATION,
  AgentType.PRODUCT_MANAGER,
]

export class AgentSprite {
  container: PIXI.Container
  private spriteContainer: PIXI.Container
  private imageSprite?: PIXI.Sprite
  private fallbackSprite?: PIXI.Graphics
  private nameText: PIXI.Text
  private statusIndicator: PIXI.Graphics
  private tileSize: number
  private data: AgentSpriteData
  private static texturesLoaded = false
  private static maleTexture?: PIXI.Texture
  private static femaleTexture?: PIXI.Texture

  constructor(data: AgentSpriteData, tileSize: number) {
    this.data = data
    this.tileSize = tileSize
    this.container = new PIXI.Container()
    this.spriteContainer = new PIXI.Container()
    this.container.addChild(this.spriteContainer)

    // Load and create sprite
    this.loadAndCreateSprite()

    // Create name label
    this.nameText = new PIXI.Text(data.name, {
      fontSize: 10,
      fill: 0xffffff,
      fontFamily: 'monospace',
      stroke: 0x000000,
      strokeThickness: 2,
    })
    this.nameText.anchor.set(0.5, 1)
    this.nameText.position.set(tileSize / 2, -2)
    this.container.addChild(this.nameText)

    // Create status indicator
    this.statusIndicator = this.createStatusIndicator()
    this.container.addChild(this.statusIndicator)

    // Set initial position
    this.setPosition(data.position)

    // Make interactive
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'
  }

  /**
   * Load textures and create sprite
   */
  private async loadAndCreateSprite(): Promise<void> {
    // Create fallback first
    this.fallbackSprite = this.createFallbackSprite()
    this.spriteContainer.addChild(this.fallbackSprite)

    try {
      // Load textures if not already loaded
      if (!AgentSprite.texturesLoaded) {
        const [maleTexture, femaleTexture] = await Promise.all([
          PIXI.Assets.load(AGENT_IMAGES.male),
          PIXI.Assets.load(AGENT_IMAGES.female),
        ])
        AgentSprite.maleTexture = maleTexture
        AgentSprite.femaleTexture = femaleTexture
        AgentSprite.texturesLoaded = true
      }

      // Create image sprite
      const isFemale = FEMALE_AGENT_TYPES.includes(this.data.type)
      const texture = isFemale ? AgentSprite.femaleTexture : AgentSprite.maleTexture

      if (texture) {
        this.imageSprite = new PIXI.Sprite(texture)

        // Scale to fit tile size (make it 3x larger)
        const spriteSize = this.tileSize * 4.5
        const scale = spriteSize / Math.max(texture.width, texture.height)
        this.imageSprite.scale.set(scale, scale)

        // Center the sprite
        this.imageSprite.anchor.set(0.5, 1)
        this.imageSprite.position.set(this.tileSize / 2, this.tileSize)

        // Remove fallback and add image sprite
        if (this.fallbackSprite) {
          this.spriteContainer.removeChild(this.fallbackSprite)
          this.fallbackSprite.destroy()
          this.fallbackSprite = undefined
        }
        this.spriteContainer.addChild(this.imageSprite)
      }
    } catch (error) {
      console.warn('Failed to load agent sprite image, using fallback:', error)
    }
  }

  /**
   * Create fallback sprite (colored square) if images fail to load
   */
  private createFallbackSprite(): PIXI.Graphics {
    const sprite = new PIXI.Graphics()
    const color = this.getAgentColor(this.data.type)
    const size = this.tileSize * 0.8

    // Body
    sprite.beginFill(color)
    sprite.drawRoundedRect(
      (this.tileSize - size) / 2,
      (this.tileSize - size) / 2,
      size,
      size,
      4
    )
    sprite.endFill()

    // Shadow
    sprite.beginFill(0x000000, 0.2)
    sprite.drawEllipse(this.tileSize / 2, this.tileSize * 0.9, size / 2, size / 6)
    sprite.endFill()

    return sprite
  }

  /**
   * Create status indicator (small colored dot)
   */
  private createStatusIndicator(): PIXI.Graphics {
    const indicator = new PIXI.Graphics()
    const statusColor = this.getStatusColor()

    indicator.beginFill(statusColor)
    indicator.drawCircle(this.tileSize * 0.8, this.tileSize * 0.2, 4)
    indicator.endFill()

    // Pulsing effect for some statuses
    if (this.data.status === 'working') {
      this.addPulseAnimation(indicator)
    }

    return indicator
  }

  /**
   * Add pulsing animation
   */
  private addPulseAnimation(graphics: PIXI.Graphics): void {
    // Simple scale animation using PIXI ticker
    let time = 0
    const animate = () => {
      time += 0.05
      const scale = 1 + Math.sin(time) * 0.2
      graphics.scale.set(scale, scale)
    }
    // Note: In production, use proper animation system
    graphics.on('added', () => {
      const ticker = PIXI.Ticker.shared
      ticker.add(animate)
    })
  }

  /**
   * Get color based on agent type
   */
  private getAgentColor(type: AgentType): number {
    const colors: Record<AgentType, number> = {
      [AgentType.ORCHESTRATOR]: 0x4f46e5,
      [AgentType.FRONTEND]: 0x06b6d4,
      [AgentType.BACKEND]: 0x10b981,
      [AgentType.MOBILE]: 0x8b5cf6,
      [AgentType.DATABASE]: 0xf59e0b,
      [AgentType.QA]: 0xef4444,
      [AgentType.DEVOPS]: 0x3b82f6,
      [AgentType.SECURITY]: 0xdc2626,
      [AgentType.PERFORMANCE]: 0xeab308,
      [AgentType.ACCESSIBILITY]: 0xa855f7,
      [AgentType.UIUX]: 0xec4899,
      [AgentType.GRAPHIC_DESIGNER]: 0xf97316,
      [AgentType.DOCUMENTATION]: 0x6366f1,
      [AgentType.TECHNICAL_WRITER]: 0x8b5cf6,
      [AgentType.PRODUCT_MANAGER]: 0x14b8a6,
      [AgentType.DATA_ANALYST]: 0x06b6d4,
    }
    return colors[type] || 0x9ca3af
  }

  /**
   * Get color based on agent status
   */
  private getStatusColor(): number {
    switch (this.data.status) {
      case 'working':
        return 0x10b981 // green
      case 'thinking':
        return 0xf59e0b // amber
      case 'reporting':
        return 0x06b6d4 // cyan
      case 'stuck':
        return 0xef4444 // red
      case 'break':
        return 0x8b5cf6 // purple
      case 'offline':
        return 0x6b7280 // gray
      default:
        return 0x9ca3af // gray
    }
  }

  /**
   * Update agent
   */
  update(delta: number, newData?: AgentSpriteData): void {
    if (newData) {
      this.data = newData

      // Update position if changed
      if (
        newData.position.x !== this.data.position.x ||
        newData.position.y !== this.data.position.y
      ) {
        this.setPosition(newData.position)
      }

      // Update animation
      if (newData.animation !== this.data.animation) {
        this.playAnimation(newData.animation)
      }
    }

    // Animate based on current animation state
    this.animate(delta)
  }

  /**
   * Animate sprite
   */
  private animate(_delta: number): void {
    const sprite = this.imageSprite || this.fallbackSprite
    if (!sprite) return

    switch (this.data.animation) {
      case 'typing':
        // Slight bobbing motion
        if (this.imageSprite) {
          this.spriteContainer.position.y = Math.sin(Date.now() * 0.01) * 2
        } else {
          sprite.position.y = Math.sin(Date.now() * 0.01) * 2
        }
        break
      case 'thinking':
        // Rotate slightly
        this.spriteContainer.rotation = Math.sin(Date.now() * 0.005) * 0.1
        break
      case 'celebrating':
        // Jump animation
        if (this.imageSprite) {
          this.spriteContainer.position.y = Math.abs(Math.sin(Date.now() * 0.02)) * -10
        } else {
          sprite.position.y = Math.abs(Math.sin(Date.now() * 0.02)) * -10
        }
        break
      default:
        // Reset to idle
        this.spriteContainer.position.y = 0
        this.spriteContainer.rotation = 0
    }
  }

  /**
   * Play animation
   */
  playAnimation(animation: string): void {
    this.data.animation = animation as any
  }

  /**
   * Set position
   */
  setPosition(position: Position): void {
    this.container.position.set(position.x * this.tileSize, position.y * this.tileSize)
  }

  /**
   * Get position
   */
  getPosition(): Position {
    return {
      x: this.container.position.x / this.tileSize,
      y: this.container.position.y / this.tileSize,
    }
  }

  /**
   * Set name visibility
   */
  setNameVisible(visible: boolean): void {
    this.nameText.visible = visible
  }

  /**
   * Destroy sprite
   */
  destroy(): void {
    this.container.destroy({ children: true })
  }
}
