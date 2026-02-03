/**
 * GridRenderer - Renders the office grid
 */

import * as PIXI from 'pixi.js'

export class GridRenderer {
  container: PIXI.Container
  private tileSize: number
  private gridGraphics: PIXI.Graphics

  constructor(tileSize: number) {
    this.tileSize = tileSize
    this.container = new PIXI.Container()
    this.gridGraphics = new PIXI.Graphics()
    this.container.addChild(this.gridGraphics)
    this.container.visible = false // Hidden by default
  }

  /**
   * Render grid
   */
  render(cols: number, rows: number): void {
    this.gridGraphics.clear()
    this.gridGraphics.lineStyle(1, 0xcccccc, 0.3)

    // Vertical lines
    for (let x = 0; x <= cols; x++) {
      this.gridGraphics.moveTo(x * this.tileSize, 0)
      this.gridGraphics.lineTo(x * this.tileSize, rows * this.tileSize)
    }

    // Horizontal lines
    for (let y = 0; y <= rows; y++) {
      this.gridGraphics.moveTo(0, y * this.tileSize)
      this.gridGraphics.lineTo(cols * this.tileSize, y * this.tileSize)
    }
  }

  /**
   * Set grid visibility
   */
  setVisible(visible: boolean): void {
    this.container.visible = visible
  }
}
