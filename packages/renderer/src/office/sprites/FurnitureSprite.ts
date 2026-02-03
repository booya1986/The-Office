/**
 * FurnitureSprite - Represents furniture/decoration in the office
 */

import * as PIXI from 'pixi.js'
import type { FurnitureData, FurnitureType } from '../../types'

export class FurnitureSprite {
  container: PIXI.Container
  private graphics: PIXI.Graphics
  private tileSize: number
  private data: FurnitureData

  constructor(data: FurnitureData, tileSize: number) {
    this.data = data
    this.tileSize = tileSize
    this.container = new PIXI.Container()

    // Create furniture graphics
    this.graphics = this.createFurniture(data.type)
    this.container.addChild(this.graphics)

    // Set position and rotation
    this.container.position.set(
      data.position.x * tileSize,
      data.position.y * tileSize
    )
    if (data.rotation) {
      this.container.rotation = data.rotation
    }

    // Make interactive
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'
  }

  /**
   * Create furniture graphics based on type
   */
  private createFurniture(type: FurnitureType): PIXI.Graphics {
    const g = new PIXI.Graphics()

    switch (type) {
      case 'desk':
        return this.createDesk(g)
      case 'chair':
        return this.createChair(g)
      case 'plant':
        return this.createPlant(g)
      case 'bookshelf':
        return this.createBookshelf(g)
      case 'whiteboard':
        return this.createWhiteboard(g)
      default:
        // Default box
        g.beginFill(0x8b8b8b)
        g.drawRect(0, 0, this.tileSize, this.tileSize)
        g.endFill()
        return g
    }
  }

  private createDesk(g: PIXI.Graphics): PIXI.Graphics {
    // Desk top
    g.beginFill(0x8b4513)
    g.drawRect(0, 0, this.tileSize * 2, this.tileSize)
    g.endFill()

    // Desk legs
    g.beginFill(0x654321)
    g.drawRect(2, this.tileSize - 4, 4, 4)
    g.drawRect(this.tileSize * 2 - 6, this.tileSize - 4, 4, 4)
    g.endFill()

    return g
  }

  private createChair(g: PIXI.Graphics): PIXI.Graphics {
    // Seat
    g.beginFill(0x333333)
    g.drawRect(4, 8, this.tileSize - 8, this.tileSize - 12)
    g.endFill()

    // Backrest
    g.beginFill(0x444444)
    g.drawRect(6, 0, this.tileSize - 12, 10)
    g.endFill()

    return g
  }

  private createPlant(g: PIXI.Graphics): PIXI.Graphics {
    // Pot
    g.beginFill(0x8b4513)
    g.drawRect(8, 16, this.tileSize - 16, 12)
    g.endFill()

    // Plant leaves
    g.beginFill(0x228b22)
    g.drawCircle(this.tileSize / 2, 12, 8)
    g.drawCircle(this.tileSize / 2 - 6, 10, 6)
    g.drawCircle(this.tileSize / 2 + 6, 10, 6)
    g.endFill()

    return g
  }

  private createBookshelf(g: PIXI.Graphics): PIXI.Graphics {
    // Main structure
    g.beginFill(0x8b4513)
    g.drawRect(0, 0, this.tileSize * 2, this.tileSize * 3)
    g.endFill()

    // Shelves
    g.beginFill(0x654321)
    for (let i = 0; i < 3; i++) {
      g.drawRect(0, i * this.tileSize, this.tileSize * 2, 4)
    }
    g.endFill()

    // Books (colored rectangles)
    const bookColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]
    for (let shelf = 0; shelf < 3; shelf++) {
      for (let book = 0; book < 5; book++) {
        g.beginFill(bookColors[book])
        g.drawRect(
          book * 8 + 4,
          shelf * this.tileSize + 6,
          6,
          this.tileSize - 10
        )
        g.endFill()
      }
    }

    return g
  }

  private createWhiteboard(g: PIXI.Graphics): PIXI.Graphics {
    // Frame
    g.beginFill(0x8b8b8b)
    g.drawRect(0, 0, this.tileSize * 3, this.tileSize * 2)
    g.endFill()

    // White surface
    g.beginFill(0xffffff)
    g.drawRect(4, 4, this.tileSize * 3 - 8, this.tileSize * 2 - 8)
    g.endFill()

    // TODO: Add random drawings/text

    return g
  }

  /**
   * Update furniture state
   */
  update(newData: FurnitureData): void {
    this.data = newData

    if (newData.position.x !== this.data.position.x || newData.position.y !== this.data.position.y) {
      this.container.position.set(
        newData.position.x * this.tileSize,
        newData.position.y * this.tileSize
      )
    }

    if (newData.rotation !== this.data.rotation) {
      this.container.rotation = newData.rotation || 0
    }
  }

  /**
   * Destroy furniture sprite
   */
  destroy(): void {
    this.container.destroy({ children: true })
  }
}
