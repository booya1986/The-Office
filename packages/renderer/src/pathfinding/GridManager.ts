import type { GridCell, CellType, Point } from './types'

/**
 * GridManager - Manages the office grid for pathfinding
 *
 * Tracks obstacles, furniture, and agent positions.
 * Updates grid state for pathfinding calculations.
 */
export class GridManager {
  private grid: GridCell[][]
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.grid = this.createEmptyGrid()
  }

  /**
   * Create empty grid
   */
  private createEmptyGrid(): GridCell[][] {
    const grid: GridCell[][] = []

    for (let y = 0; y < this.height; y++) {
      grid[y] = []
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = {
          x,
          y,
          type: 0, // Empty
          cost: 1, // Normal movement cost
        }
      }
    }

    return grid
  }

  /**
   * Get grid
   */
  getGrid(): GridCell[][] {
    return this.grid
  }

  /**
   * Set cell type
   */
  setCellType(x: number, y: number, type: CellType): void {
    if (this.isValid(x, y)) {
      this.grid[y][x].type = type
      this.grid[y][x].cost = this.getDefaultCost(type)
    }
  }

  /**
   * Set cell cost
   */
  setCellCost(x: number, y: number, cost: number): void {
    if (this.isValid(x, y)) {
      this.grid[y][x].cost = cost
    }
  }

  /**
   * Get cell
   */
  getCell(x: number, y: number): GridCell | null {
    if (this.isValid(x, y)) {
      return this.grid[y][x]
    }
    return null
  }

  /**
   * Place obstacle
   */
  placeObstacle(x: number, y: number, width: number = 1, height: number = 1): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.setCellType(x + dx, y + dy, 1) // Obstacle
      }
    }
  }

  /**
   * Place furniture (harder to pass through)
   */
  placeFurniture(x: number, y: number, width: number = 1, height: number = 1): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.setCellType(x + dx, y + dy, 3) // Furniture
      }
    }
  }

  /**
   * Update agent position
   */
  updateAgentPosition(oldPos: Point | null, newPos: Point): void {
    // Clear old position
    if (oldPos && this.isValid(oldPos.x, oldPos.y)) {
      this.setCellType(oldPos.x, oldPos.y, 0) // Empty
    }

    // Set new position
    if (this.isValid(newPos.x, newPos.y)) {
      this.setCellType(newPos.x, newPos.y, 2) // Agent
    }
  }

  /**
   * Clear cell
   */
  clearCell(x: number, y: number): void {
    this.setCellType(x, y, 0) // Empty
  }

  /**
   * Clear area
   */
  clearArea(x: number, y: number, width: number, height: number): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.clearCell(x + dx, y + dy)
      }
    }
  }

  /**
   * Check if coordinates are valid
   */
  private isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  /**
   * Get default movement cost for cell type
   */
  private getDefaultCost(type: CellType): number {
    switch (type) {
      case 0: // Empty
        return 1
      case 1: // Obstacle
        return Infinity
      case 2: // Agent
        return 1
      case 3: // Furniture
        return 3 // Harder to pass through
      default:
        return 1
    }
  }

  /**
   * Get grid dimensions
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height }
  }

  /**
   * Initialize default office layout
   */
  initializeOfficeLayout(): void {
    // Clear grid
    this.grid = this.createEmptyGrid()

    // Add office walls (perimeter obstacles)
    for (let x = 0; x < this.width; x++) {
      this.setCellType(x, 0, 1) // Top wall
      this.setCellType(x, this.height - 1, 1) // Bottom wall
    }
    for (let y = 0; y < this.height; y++) {
      this.setCellType(0, y, 1) // Left wall
      this.setCellType(this.width - 1, y, 1) // Right wall
    }

    // Add desks (2x1 furniture)
    const deskPositions = [
      { x: 2, y: 2 },
      { x: 5, y: 2 },
      { x: 8, y: 2 },
      { x: 11, y: 2 },
      { x: 14, y: 2 },
      { x: 2, y: 5 },
      { x: 5, y: 5 },
      { x: 11, y: 5 },
      { x: 14, y: 5 },
      { x: 2, y: 8 },
      { x: 5, y: 8 },
      { x: 8, y: 8 },
      { x: 11, y: 8 },
      { x: 14, y: 8 },
    ]

    for (const pos of deskPositions) {
      this.placeFurniture(pos.x, pos.y, 2, 1)
    }

    // Add meeting table (3x2 furniture)
    this.placeFurniture(8, 5, 3, 2)
  }
}
