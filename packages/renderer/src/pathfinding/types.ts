/**
 * Pathfinding types
 */

export interface Point {
  x: number
  y: number
}

export interface PathNode {
  position: Point
  g: number // Cost from start
  h: number // Heuristic cost to goal
  f: number // Total cost (g + h)
  parent: PathNode | null
}

export interface Path {
  points: Point[]
  cost: number
  smoothed?: boolean
}

export enum CellType {
  EMPTY = 0,
  OBSTACLE = 1,
  AGENT = 2,
  FURNITURE = 3,
}

export interface GridCell {
  x: number
  y: number
  type: CellType
  cost: number // Movement cost (1 = normal, higher = difficult terrain)
}

export interface MovementOptions {
  speed: number // Tiles per second
  diagonal: boolean // Allow diagonal movement
  smoothPath: boolean // Smooth the path
}
