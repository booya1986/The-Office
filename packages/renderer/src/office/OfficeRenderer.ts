/**
 * OfficeRenderer - Main PixiJS rendering engine
 */

import * as PIXI from 'pixi.js'
import type { AgentSpriteData, CameraState, RenderOptions } from '../types'
import { AgentSprite } from './sprites/AgentSprite'
import { GridRenderer } from './systems/GridRenderer'

export interface OfficeRendererOptions {
  width: number
  height: number
  tileSize: number
  backgroundColor?: number
}

export class OfficeRenderer {
  private app: PIXI.Application
  private container: HTMLElement
  private stage: PIXI.Container

  // Layers
  private floorLayer: PIXI.Container
  private furnitureLayer: PIXI.Container
  private agentsLayer: PIXI.Container
  private uiLayer: PIXI.Container

  // Systems
  private gridRenderer: GridRenderer
  private agentSprites: Map<string, AgentSprite>

  // State
  private camera: CameraState
  private renderOptions: RenderOptions
  private tileSize: number

  constructor(container: HTMLElement, options: OfficeRendererOptions) {
    this.container = container
    this.tileSize = options.tileSize
    this.agentSprites = new Map()

    // Initialize camera
    this.camera = { x: 0, y: 0, zoom: 1.0 }
    this.renderOptions = {
      showGrid: false,
      showAgentNames: true,
      showAgentStatus: true,
      showPaths: false,
      enableShadows: true,
      animationSpeed: 1.0,
    }

    // Create PixiJS application
    this.app = new PIXI.Application({
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor || 0xf0e6d2,
      antialias: false, // Pixel art - no antialiasing
      resolution: window.devicePixelRatio || 1,
    })

    // Add canvas to container
    container.appendChild(this.app.view as HTMLCanvasElement)

    // Create main stage
    this.stage = new PIXI.Container()
    this.app.stage.addChild(this.stage)

    // Create layers (bottom to top)
    this.floorLayer = new PIXI.Container()
    this.furnitureLayer = new PIXI.Container()
    this.agentsLayer = new PIXI.Container()
    this.uiLayer = new PIXI.Container()

    this.stage.addChild(this.floorLayer)
    this.stage.addChild(this.furnitureLayer)
    this.stage.addChild(this.agentsLayer)
    this.stage.addChild(this.uiLayer)

    // Initialize grid renderer
    this.gridRenderer = new GridRenderer(this.tileSize)
    this.floorLayer.addChild(this.gridRenderer.container)

    // Setup initial render
    this.renderFloor()
    this.renderFurniture()

    // Setup interactions
    this.setupInteractions()
  }

  /**
   * Start render loop
   */
  start(): void {
    this.app.ticker.add(this.update.bind(this))
  }

  /**
   * Update loop
   */
  private update(delta: number): void {
    // Update agent animations
    for (const sprite of this.agentSprites.values()) {
      sprite.update(delta * this.renderOptions.animationSpeed)
    }

    // Update camera
    this.updateCamera()
  }

  /**
   * Update camera position and zoom
   */
  private updateCamera(): void {
    this.stage.position.set(-this.camera.x, -this.camera.y)
    this.stage.scale.set(this.camera.zoom, this.camera.zoom)
  }

  /**
   * Set camera state
   */
  setCamera(camera: CameraState): void {
    this.camera = camera

    // If following an agent, center on them
    if (camera.following) {
      const agent = this.agentSprites.get(camera.following)
      if (agent) {
        const pos = agent.getPosition()
        this.camera.x = pos.x * this.tileSize - this.app.screen.width / 2
        this.camera.y = pos.y * this.tileSize - this.app.screen.height / 2
      }
    }
  }

  /**
   * Set render options
   */
  setRenderOptions(options: RenderOptions): void {
    this.renderOptions = options

    // Update grid visibility
    this.gridRenderer.setVisible(options.showGrid)

    // Update agent name visibility
    for (const sprite of this.agentSprites.values()) {
      sprite.setNameVisible(options.showAgentNames)
    }
  }

  /**
   * Update agents
   */
  updateAgents(agents: AgentSpriteData[]): void {
    // Remove agents that no longer exist
    for (const [id, sprite] of this.agentSprites) {
      if (!agents.find((a) => a.id === id)) {
        sprite.destroy()
        this.agentSprites.delete(id)
      }
    }

    // Update or create agents
    for (const agentData of agents) {
      let sprite = this.agentSprites.get(agentData.id)

      if (!sprite) {
        // Create new agent sprite
        sprite = new AgentSprite(agentData, this.tileSize)
        this.agentsLayer.addChild(sprite.container)
        this.agentSprites.set(agentData.id, sprite)
      } else {
        // Update existing sprite
        sprite.update(0, agentData)
      }
    }
  }

  /**
   * Render office floor
   */
  private renderFloor(): void {
    // Create floor tiles
    const cols = Math.ceil(this.app.screen.width / this.tileSize) + 2
    const rows = Math.ceil(this.app.screen.height / this.tileSize) + 2

    this.gridRenderer.render(cols, rows)

    // Add floor texture (simple checkerboard for now)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = new PIXI.Graphics()
        const color = (x + y) % 2 === 0 ? 0xe8dcc4 : 0xf0e6d2
        tile.beginFill(color)
        tile.drawRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize)
        tile.endFill()
        this.floorLayer.addChild(tile)
      }
    }
  }

  /**
   * Render office furniture
   */
  private renderFurniture(): void {
    // TODO: Add furniture sprites
    // For now, add some placeholder desks

    const deskPositions = [
      { x: 5, y: 5 },
      { x: 10, y: 5 },
      { x: 15, y: 5 },
      { x: 5, y: 10 },
      { x: 10, y: 10 },
      { x: 15, y: 10 },
    ]

    for (const pos of deskPositions) {
      const desk = this.createDesk(pos.x, pos.y)
      this.furnitureLayer.addChild(desk)
    }
  }

  /**
   * Create a simple desk sprite
   */
  private createDesk(x: number, y: number): PIXI.Graphics {
    const desk = new PIXI.Graphics()

    // Desk top
    desk.beginFill(0x8b4513)
    desk.drawRect(0, 0, this.tileSize * 2, this.tileSize)
    desk.endFill()

    // Desk shadow
    desk.beginFill(0x000000, 0.2)
    desk.drawRect(2, this.tileSize, this.tileSize * 2, 4)
    desk.endFill()

    desk.position.set(x * this.tileSize, y * this.tileSize)

    return desk
  }

  /**
   * Setup mouse/touch interactions
   */
  private setupInteractions(): void {
    this.app.view.addEventListener('wheel', (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      this.camera.zoom = Math.max(0.5, Math.min(2.0, this.camera.zoom + delta))
    })

    // Pan with middle mouse or touch
    let isDragging = false
    let lastPos = { x: 0, y: 0 }

    this.app.view.addEventListener('mousedown', (e) => {
      if (e.button === 1) { // Middle mouse
        isDragging = true
        lastPos = { x: e.clientX, y: e.clientY }
      }
    })

    this.app.view.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - lastPos.x
        const dy = e.clientY - lastPos.y
        this.camera.x -= dx / this.camera.zoom
        this.camera.y -= dy / this.camera.zoom
        lastPos = { x: e.clientX, y: e.clientY }
      }
    })

    this.app.view.addEventListener('mouseup', () => {
      isDragging = false
    })
  }

  /**
   * Destroy renderer
   */
  destroy(): void {
    // Destroy all agent sprites
    for (const sprite of this.agentSprites.values()) {
      sprite.destroy()
    }
    this.agentSprites.clear()

    // Destroy PixiJS app
    this.app.destroy(true, { children: true, texture: true, baseTexture: true })

    // Remove canvas from container
    if (this.container.contains(this.app.view as HTMLCanvasElement)) {
      this.container.removeChild(this.app.view as HTMLCanvasElement)
    }
  }
}
