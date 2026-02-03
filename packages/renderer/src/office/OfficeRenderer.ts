/**
 * OfficeRenderer - Main PixiJS rendering engine
 * Creates a detailed pixel art office environment
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
  backgroundImage?: string
}

// Office furniture and decoration colors
const COLORS = {
  carpet: 0x5c5449,
  carpetAlt: 0x524a40,
  wall: 0xd4cfc4,
  wallBottom: 0xc4bfb4,
  desk: 0xcd9b5a,
  deskDark: 0xa87d45,
  deskLight: 0xe6b878,
  chair: 0x3d4657,
  chairLight: 0x5c6574,
  monitor: 0x2a2d34,
  monitorScreen: 0x4a90d9,
  keyboard: 0xe8e4dc,
  plant: 0x4a8c3d,
  plantDark: 0x3d7530,
  plantPot: 0x8b5a2b,
  window: 0x87ceeb,
  windowFrame: 0x8a8a8a,
  whiteboard: 0xfafafa,
  whiteboardFrame: 0x6a6a6a,
  partition: 0xc4bfb4,
  partitionTop: 0x8a8a8a,
  waterCooler: 0x87ceeb,
  clock: 0xfafafa,
}

export class OfficeRenderer {
  private app: PIXI.Application
  private container: HTMLElement
  private stage: PIXI.Container

  // Layers
  private backgroundLayer: PIXI.Container
  private floorLayer: PIXI.Container
  private wallLayer: PIXI.Container
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
  private backgroundImageUrl?: string
  private backgroundSprite?: PIXI.Sprite
  private resizeObserver?: ResizeObserver

  constructor(container: HTMLElement, options: OfficeRendererOptions) {
    this.backgroundImageUrl = options.backgroundImage
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

    // Get container dimensions for responsive sizing
    const containerWidth = container.clientWidth || options.width
    const containerHeight = container.clientHeight || options.height

    // Create PixiJS application with container size
    this.app = new PIXI.Application({
      width: containerWidth,
      height: containerHeight,
      backgroundColor: COLORS.wall,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      resizeTo: container,
    })

    // Add canvas to container
    container.appendChild(this.app.view as HTMLCanvasElement)

    // Create main stage
    this.stage = new PIXI.Container()
    this.app.stage.addChild(this.stage)

    // Create layers (bottom to top)
    this.backgroundLayer = new PIXI.Container()
    this.floorLayer = new PIXI.Container()
    this.wallLayer = new PIXI.Container()
    this.furnitureLayer = new PIXI.Container()
    this.agentsLayer = new PIXI.Container()
    this.uiLayer = new PIXI.Container()

    this.stage.addChild(this.backgroundLayer)
    this.stage.addChild(this.floorLayer)
    this.stage.addChild(this.wallLayer)
    this.stage.addChild(this.furnitureLayer)
    this.stage.addChild(this.agentsLayer)
    this.stage.addChild(this.uiLayer)

    // Initialize grid renderer
    this.gridRenderer = new GridRenderer(this.tileSize)
    this.uiLayer.addChild(this.gridRenderer.container)

    // Setup initial render - use background image if provided, otherwise use programmatic rendering
    if (this.backgroundImageUrl) {
      this.loadBackgroundImage(this.backgroundImageUrl)
    } else {
      this.renderBackground()
      this.renderFloor()
      this.renderWalls()
      this.renderFurniture()
    }

    // Setup interactions
    this.setupInteractions()

    // Setup resize observer
    this.setupResizeObserver()
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      // Re-scale background on resize
      this.scaleBackgroundToFit()
    })
    this.resizeObserver.observe(this.container)
  }

  private async loadBackgroundImage(url: string): Promise<void> {
    try {
      const texture = await PIXI.Assets.load(url)
      this.backgroundSprite = new PIXI.Sprite(texture)
      this.backgroundSprite.anchor.set(0, 0)
      this.backgroundSprite.position.set(0, 0)

      // Scale background to fit the screen while maintaining aspect ratio (cover)
      this.scaleBackgroundToFit()

      this.backgroundLayer.addChild(this.backgroundSprite)
    } catch (error) {
      console.error('Failed to load background image:', error)
      // Fallback to programmatic rendering
      this.renderBackground()
      this.renderFloor()
      this.renderWalls()
      this.renderFurniture()
    }
  }

  private scaleBackgroundToFit(): void {
    if (!this.backgroundSprite) return

    const screenWidth = this.app.screen.width
    const screenHeight = this.app.screen.height
    const textureWidth = this.backgroundSprite.texture.width
    const textureHeight = this.backgroundSprite.texture.height

    // Calculate scale to cover the entire screen
    const scaleX = screenWidth / textureWidth
    const scaleY = screenHeight / textureHeight
    const scale = Math.max(scaleX, scaleY)

    this.backgroundSprite.scale.set(scale, scale)

    // Center the background
    this.backgroundSprite.position.set(
      (screenWidth - textureWidth * scale) / 2,
      (screenHeight - textureHeight * scale) / 2
    )
  }

  start(): void {
    this.app.ticker.add(this.update.bind(this))
  }

  private update(delta: number): void {
    for (const sprite of this.agentSprites.values()) {
      sprite.update(delta * this.renderOptions.animationSpeed)
    }
    this.updateCamera()
  }

  private updateCamera(): void {
    this.stage.position.set(-this.camera.x, -this.camera.y)
    this.stage.scale.set(this.camera.zoom, this.camera.zoom)
  }

  setCamera(camera: CameraState): void {
    this.camera = camera
    if (camera.following) {
      const agent = this.agentSprites.get(camera.following)
      if (agent) {
        const pos = agent.getPosition()
        this.camera.x = pos.x * this.tileSize - this.app.screen.width / 2
        this.camera.y = pos.y * this.tileSize - this.app.screen.height / 2
      }
    }
  }

  setRenderOptions(options: RenderOptions): void {
    this.renderOptions = options
    this.gridRenderer.setVisible(options.showGrid)
    for (const sprite of this.agentSprites.values()) {
      sprite.setNameVisible(options.showAgentNames)
    }
  }

  updateAgents(agents: AgentSpriteData[]): void {
    for (const [id, sprite] of this.agentSprites) {
      if (!agents.find((a) => a.id === id)) {
        sprite.destroy()
        this.agentSprites.delete(id)
      }
    }
    for (const agentData of agents) {
      let sprite = this.agentSprites.get(agentData.id)
      if (!sprite) {
        sprite = new AgentSprite(agentData, this.tileSize)
        this.agentsLayer.addChild(sprite.container)
        this.agentSprites.set(agentData.id, sprite)
      } else {
        sprite.update(0, agentData)
      }
    }
  }

  private renderBackground(): void {
    const g = new PIXI.Graphics()
    g.beginFill(COLORS.wall)
    g.drawRect(0, 0, this.app.screen.width * 2, 120)
    g.endFill()
    g.beginFill(COLORS.wallBottom)
    g.drawRect(0, 120, this.app.screen.width * 2, 8)
    g.endFill()
    this.backgroundLayer.addChild(g)
  }

  private renderFloor(): void {
    const cols = Math.ceil(this.app.screen.width / this.tileSize) + 10
    const rows = Math.ceil(this.app.screen.height / this.tileSize) + 10
    const startY = 4

    for (let y = startY; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = new PIXI.Graphics()
        const isDiamond = ((x + y) % 4 === 0) || ((x + y) % 4 === 2)
        const color = isDiamond ? COLORS.carpet : COLORS.carpetAlt
        tile.beginFill(color)
        tile.drawRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize)
        tile.endFill()
        if (Math.random() > 0.85) {
          tile.beginFill(0x000000, 0.02)
          tile.drawRect(x * this.tileSize + Math.random() * 20, y * this.tileSize + Math.random() * 20, 2, 2)
          tile.endFill()
        }
        this.floorLayer.addChild(tile)
      }
    }
  }

  private renderWalls(): void {
    const windowPositions = [2, 8, 14, 20]
    for (const x of windowPositions) {
      this.createWindow(x * this.tileSize, 20)
    }
    this.createClock(12 * this.tileSize, 30)
    this.createWhiteboard(18 * this.tileSize, 20)
  }

  private renderFurniture(): void {
    const cubicleRows = [
      { y: 5, xPositions: [2, 7, 12] },
      { y: 10, xPositions: [2, 7, 12] },
      { y: 15, xPositions: [2, 7, 12] },
    ]
    for (const row of cubicleRows) {
      for (const x of row.xPositions) {
        this.createCubicle(x * this.tileSize, row.y * this.tileSize)
      }
    }
    this.createPlant(0.5 * this.tileSize, 5 * this.tileSize)
    this.createPlant(18 * this.tileSize, 5 * this.tileSize)
    this.createWaterCooler(16 * this.tileSize, 5 * this.tileSize)
    this.createFilingCabinet(19 * this.tileSize, 8 * this.tileSize)
  }

  private createWindow(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const w = this.tileSize * 3
    const h = this.tileSize * 2.5
    g.beginFill(COLORS.windowFrame)
    g.drawRect(0, 0, w, h)
    g.endFill()
    g.beginFill(COLORS.window)
    g.drawRect(3, 3, w - 6, h - 6)
    g.endFill()
    g.beginFill(0x6a7a8a)
    g.drawRect(5, h - 30, 15, 25)
    g.drawRect(25, h - 40, 20, 35)
    g.drawRect(50, h - 25, 12, 20)
    g.drawRect(65, h - 35, 18, 30)
    g.endFill()
    g.beginFill(COLORS.windowFrame)
    g.drawRect(w / 2 - 1, 3, 2, h - 6)
    g.endFill()
    g.position.set(x, y)
    this.wallLayer.addChild(g)
  }

  private createClock(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const r = this.tileSize * 0.8
    g.beginFill(COLORS.clock)
    g.drawCircle(0, 0, r)
    g.endFill()
    g.lineStyle(2, 0x4a4a4a)
    g.drawCircle(0, 0, r)
    g.lineStyle(2, 0x2a2a2a)
    g.moveTo(0, 0)
    g.lineTo(0, -r * 0.5)
    g.moveTo(0, 0)
    g.lineTo(r * 0.4, -r * 0.3)
    g.position.set(x, y + r)
    this.wallLayer.addChild(g)
  }

  private createWhiteboard(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const w = this.tileSize * 4
    const h = this.tileSize * 2.5
    g.beginFill(COLORS.whiteboardFrame)
    g.drawRect(0, 0, w, h)
    g.endFill()
    g.beginFill(COLORS.whiteboard)
    g.drawRect(4, 4, w - 8, h - 8)
    g.endFill()
    g.beginFill(0x4a90d9)
    g.drawRect(10, 15, 30, 40)
    g.drawRect(45, 25, 25, 30)
    g.drawRect(75, 10, 20, 45)
    g.endFill()
    g.beginFill(0xd94a4a)
    g.drawCircle(w - 40, h / 2, 20)
    g.endFill()
    g.position.set(x, y)
    this.wallLayer.addChild(g)
  }

  private createCubicle(x: number, y: number): void {
    const t = this.tileSize
    this.createPartition(x, y, t * 4.5, false)
    this.createPartition(x, y, t * 3, true)
    this.createDesk(x + t * 0.5, y + t * 0.5)
    this.createDesk(x + t * 2.5, y + t * 0.5)
    this.createChair(x + t, y + t * 2)
    this.createChair(x + t * 3, y + t * 2)
  }

  private createPartition(x: number, y: number, length: number, vertical: boolean): void {
    const g = new PIXI.Graphics()
    g.beginFill(COLORS.partition)
    if (vertical) {
      g.drawRect(0, 0, 4, length)
    } else {
      g.drawRect(0, 0, length, 4)
    }
    g.endFill()
    g.beginFill(COLORS.partitionTop)
    if (vertical) {
      g.drawRect(0, 0, 4, 2)
    } else {
      g.drawRect(0, 0, length, 2)
    }
    g.endFill()
    g.position.set(x, y)
    this.furnitureLayer.addChild(g)
  }

  private createDesk(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const t = this.tileSize
    g.beginFill(COLORS.desk)
    g.drawRect(0, 0, t * 1.8, t * 1.2)
    g.endFill()
    g.beginFill(COLORS.deskDark)
    g.drawRect(0, t * 1.2, t * 1.8, 4)
    g.endFill()
    g.beginFill(COLORS.monitor)
    g.drawRect(t * 0.4, t * 0.1, t * 1, t * 0.7)
    g.endFill()
    g.beginFill(COLORS.monitorScreen)
    g.drawRect(t * 0.45, t * 0.15, t * 0.9, t * 0.55)
    g.endFill()
    g.beginFill(COLORS.monitor)
    g.drawRect(t * 0.8, t * 0.8, t * 0.2, t * 0.15)
    g.endFill()
    g.beginFill(COLORS.keyboard)
    g.drawRect(t * 0.3, t * 0.95, t * 1.2, t * 0.15)
    g.endFill()
    if (Math.random() > 0.3) {
      const mugColor = Math.random() > 0.5 ? 0xe8e4dc : 0x4a6fa5
      g.beginFill(mugColor)
      g.drawCircle(t * 1.5 + Math.random() * t * 0.2, t * 0.4, 6)
      g.endFill()
    }
    g.position.set(x, y)
    this.furnitureLayer.addChild(g)
  }

  private createChair(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const t = this.tileSize
    g.beginFill(COLORS.chair)
    g.drawEllipse(t * 0.4, t * 0.3, t * 0.4, t * 0.25)
    g.endFill()
    g.beginFill(COLORS.chairLight)
    g.drawRect(t * 0.15, 0, t * 0.5, t * 0.25)
    g.endFill()
    g.beginFill(0x2a2a2a)
    g.drawRect(t * 0.3, t * 0.5, t * 0.2, t * 0.15)
    g.endFill()
    g.position.set(x, y)
    this.furnitureLayer.addChild(g)
  }

  private createPlant(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const t = this.tileSize
    g.beginFill(COLORS.plantPot)
    g.drawRect(t * 0.2, t * 1.2, t * 0.8, t * 0.6)
    g.endFill()
    g.beginFill(COLORS.plant)
    g.drawEllipse(t * 0.6, t * 0.6, t * 0.5, t * 0.7)
    g.endFill()
    g.beginFill(COLORS.plantDark)
    g.drawEllipse(t * 0.4, t * 0.8, t * 0.3, t * 0.5)
    g.endFill()
    g.position.set(x, y)
    this.furnitureLayer.addChild(g)
  }

  private createWaterCooler(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const t = this.tileSize
    g.beginFill(0x8a8a8a)
    g.drawRect(t * 0.2, t * 1.5, t * 0.8, t * 0.5)
    g.endFill()
    g.beginFill(0xc4c4c4)
    g.drawRect(t * 0.15, t * 0.8, t * 0.9, t * 0.7)
    g.endFill()
    g.beginFill(COLORS.waterCooler)
    g.drawRect(t * 0.25, 0, t * 0.7, t * 0.9)
    g.endFill()
    g.beginFill(0xffffff, 0.3)
    g.drawRect(t * 0.3, t * 0.1, t * 0.15, t * 0.6)
    g.endFill()
    g.position.set(x, y)
    this.furnitureLayer.addChild(g)
  }

  private createFilingCabinet(x: number, y: number): void {
    const g = new PIXI.Graphics()
    const t = this.tileSize
    g.beginFill(0x7a7a7a)
    g.drawRect(0, 0, t * 1.2, t * 2)
    g.endFill()
    for (let i = 0; i < 3; i++) {
      g.beginFill(0x8a8a8a)
      g.drawRect(t * 0.05, t * 0.1 + i * t * 0.65, t * 1.1, t * 0.55)
      g.endFill()
      g.beginFill(0x5a5a5a)
      g.drawRect(t * 0.45, t * 0.3 + i * t * 0.65, t * 0.3, t * 0.1)
      g.endFill()
    }
    g.position.set(x, y)
    this.furnitureLayer.addChild(g)
  }

  private setupInteractions(): void {
    const view = this.app.view as HTMLCanvasElement | undefined
    if (!view) return

    view.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      this.camera.zoom = Math.max(0.5, Math.min(2.0, this.camera.zoom + delta))
    })

    let isDragging = false
    let lastPos = { x: 0, y: 0 }

    view.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 1) {
        isDragging = true
        lastPos = { x: e.clientX, y: e.clientY }
      }
    })

    view.addEventListener('mousemove', (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastPos.x
        const dy = e.clientY - lastPos.y
        this.camera.x -= dx / this.camera.zoom
        this.camera.y -= dy / this.camera.zoom
        lastPos = { x: e.clientX, y: e.clientY }
      }
    })

    view.addEventListener('mouseup', () => {
      isDragging = false
    })
  }

  destroy(): void {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }

    for (const sprite of this.agentSprites.values()) {
      sprite.destroy()
    }
    this.agentSprites.clear()
    this.app.destroy(true, { children: true, texture: true, baseTexture: true })
    if (this.container.contains(this.app.view as HTMLCanvasElement)) {
      this.container.removeChild(this.app.view as HTMLCanvasElement)
    }
  }
}
