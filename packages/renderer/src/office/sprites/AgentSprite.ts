/**
 * AgentSprite - Represents an agent in the office
 */

import * as PIXI from 'pixi.js'
import type { AgentSpriteData, Position } from '../../types'
import { AgentType } from '@pixel-office/shared'

export class AgentSprite {
  container: PIXI.Container
  private sprite: PIXI.Graphics
  private nameText: PIXI.Text
  private statusIndicator: PIXI.Graphics
  private tileSize: number
  private data: AgentSpriteData

  constructor(data: AgentSpriteData, tileSize: number) {
    this.data = data
    this.tileSize = tileSize
    this.container = new PIXI.Container()

    // Create sprite (simple colored square for now)
    this.sprite = this.createSprite()
    this.container.addChild(this.sprite)

    // Create name label
    this.nameText = new PIXI.Text(data.name, {
      fontSize: 10,
      fill: 0x000000,
      fontFamily: 'monospace',
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
   * Create agent sprite based on type
   */
  private createSprite(): PIXI.Graphics {
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

    // Add icon/symbol based on agent type
    this.addAgentIcon(sprite, this.data.type)

    return sprite
  }

  /**
   * Add icon to represent agent type
   */
  private addAgentIcon(graphics: PIXI.Graphics, type: AgentType): void {
    const centerX = this.tileSize / 2
    const centerY = this.tileSize / 2

    graphics.beginFill(0xffffff)

    switch (type) {
      case AgentType.FRONTEND:
        // F icon
        graphics.drawRect(centerX - 4, centerY - 6, 2, 12)
        graphics.drawRect(centerX - 4, centerY - 6, 6, 2)
        graphics.drawRect(centerX - 4, centerY - 1, 5, 2)
        break
      case AgentType.BACKEND:
        // B icon
        graphics.drawRect(centerX - 4, centerY - 6, 2, 12)
        graphics.drawRect(centerX - 4, centerY - 6, 6, 2)
        graphics.drawRect(centerX - 4, centerY - 1, 6, 2)
        graphics.drawRect(centerX - 4, centerY + 4, 6, 2)
        break
      default:
        // Default dot
        graphics.drawCircle(centerX, centerY, 3)
    }

    graphics.endFill()
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
  private animate(delta: number): void {
    switch (this.data.animation) {
      case 'typing':
        // Slight bobbing motion
        this.sprite.position.y = Math.sin(Date.now() * 0.01) * 2
        break
      case 'thinking':
        // Rotate slightly
        this.sprite.rotation = Math.sin(Date.now() * 0.005) * 0.1
        break
      case 'celebrating':
        // Jump animation
        this.sprite.position.y = Math.abs(Math.sin(Date.now() * 0.02)) * -10
        break
      default:
        // Reset to idle
        this.sprite.position.y = 0
        this.sprite.rotation = 0
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
