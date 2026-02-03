import type { Point, PathNode, Path, GridCell } from './types'

/**
 * A* Pathfinding Algorithm
 *
 * Finds the shortest path between two points on a grid using A* algorithm.
 * Time complexity: O(b^d) where b is branching factor and d is depth
 * Space complexity: O(b^d)
 */
export class AStar {
  private grid: GridCell[][]
  private allowDiagonal: boolean

  constructor(grid: GridCell[][], allowDiagonal: boolean = true) {
    this.grid = grid
    this.allowDiagonal = allowDiagonal
  }

  /**
   * Find path from start to goal
   */
  findPath(start: Point, goal: Point): Path | null {
    // Validate points
    if (!this.isValid(start) || !this.isValid(goal)) {
      return null
    }

    // Check if goal is walkable
    if (!this.isWalkable(goal)) {
      // Try to find nearest walkable cell
      const nearestGoal = this.findNearestWalkable(goal)
      if (!nearestGoal) return null
      goal = nearestGoal
    }

    const openList: PathNode[] = []
    const closedList: Set<string> = new Set()

    // Create start node
    const startNode: PathNode = {
      position: start,
      g: 0,
      h: this.heuristic(start, goal),
      f: 0,
      parent: null,
    }
    startNode.f = startNode.g + startNode.h

    openList.push(startNode)

    while (openList.length > 0) {
      // Get node with lowest f score
      const currentNode = this.getLowestFScore(openList)
      const currentIndex = openList.indexOf(currentNode)

      // Remove from open list
      openList.splice(currentIndex, 1)

      // Add to closed list
      closedList.add(this.pointToKey(currentNode.position))

      // Goal reached
      if (this.pointsEqual(currentNode.position, goal)) {
        return this.reconstructPath(currentNode)
      }

      // Get neighbors
      const neighbors = this.getNeighbors(currentNode.position)

      for (const neighbor of neighbors) {
        // Skip if in closed list
        if (closedList.has(this.pointToKey(neighbor))) {
          continue
        }

        // Calculate costs
        const gScore = currentNode.g + this.getMovementCost(currentNode.position, neighbor)
        const hScore = this.heuristic(neighbor, goal)
        const fScore = gScore + hScore

        // Check if neighbor is in open list
        const existingNode = openList.find((n) => this.pointsEqual(n.position, neighbor))

        if (existingNode) {
          // Update if better path found
          if (gScore < existingNode.g) {
            existingNode.g = gScore
            existingNode.f = fScore
            existingNode.parent = currentNode
          }
        } else {
          // Add to open list
          const neighborNode: PathNode = {
            position: neighbor,
            g: gScore,
            h: hScore,
            f: fScore,
            parent: currentNode,
          }
          openList.push(neighborNode)
        }
      }
    }

    // No path found
    return null
  }

  /**
   * Reconstruct path from goal node
   */
  private reconstructPath(goalNode: PathNode): Path {
    const points: Point[] = []
    let current: PathNode | null = goalNode
    let cost = 0

    while (current) {
      points.unshift(current.position)
      cost = current.g
      current = current.parent
    }

    return { points, cost }
  }

  /**
   * Get node with lowest f score
   */
  private getLowestFScore(nodes: PathNode[]): PathNode {
    return nodes.reduce((lowest, node) => (node.f < lowest.f ? node : lowest))
  }

  /**
   * Heuristic function (Manhattan distance)
   */
  private heuristic(a: Point, b: Point): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  /**
   * Get movement cost between two adjacent points
   */
  private getMovementCost(from: Point, to: Point): number {
    const isDiagonal = from.x !== to.x && from.y !== to.y
    const baseCost = isDiagonal ? Math.SQRT2 : 1

    const cell = this.grid[to.y][to.x]
    return baseCost * cell.cost
  }

  /**
   * Get valid neighbors of a point
   */
  private getNeighbors(point: Point): Point[] {
    const neighbors: Point[] = []
    const directions = this.allowDiagonal
      ? [
          { x: 0, y: -1 }, // North
          { x: 1, y: 0 }, // East
          { x: 0, y: 1 }, // South
          { x: -1, y: 0 }, // West
          { x: -1, y: -1 }, // Northwest
          { x: 1, y: -1 }, // Northeast
          { x: 1, y: 1 }, // Southeast
          { x: -1, y: 1 }, // Southwest
        ]
      : [
          { x: 0, y: -1 }, // North
          { x: 1, y: 0 }, // East
          { x: 0, y: 1 }, // South
          { x: -1, y: 0 }, // West
        ]

    for (const dir of directions) {
      const neighbor = {
        x: point.x + dir.x,
        y: point.y + dir.y,
      }

      if (this.isValid(neighbor) && this.isWalkable(neighbor)) {
        // For diagonal movement, check if both adjacent cells are walkable
        if (this.allowDiagonal && dir.x !== 0 && dir.y !== 0) {
          const horizontal = { x: point.x + dir.x, y: point.y }
          const vertical = { x: point.x, y: point.y + dir.y }

          if (this.isWalkable(horizontal) && this.isWalkable(vertical)) {
            neighbors.push(neighbor)
          }
        } else {
          neighbors.push(neighbor)
        }
      }
    }

    return neighbors
  }

  /**
   * Check if point is valid (within grid bounds)
   */
  private isValid(point: Point): boolean {
    return (
      point.y >= 0 &&
      point.y < this.grid.length &&
      point.x >= 0 &&
      point.x < this.grid[0].length
    )
  }

  /**
   * Check if point is walkable
   */
  private isWalkable(point: Point): boolean {
    if (!this.isValid(point)) return false

    const cell = this.grid[point.y][point.x]
    return cell.type === 0 || cell.type === 2 // Empty or Agent
  }

  /**
   * Find nearest walkable cell to a point
   */
  private findNearestWalkable(point: Point): Point | null {
    const maxRadius = 5

    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue

          const neighbor = {
            x: point.x + dx,
            y: point.y + dy,
          }

          if (this.isValid(neighbor) && this.isWalkable(neighbor)) {
            return neighbor
          }
        }
      }
    }

    return null
  }

  /**
   * Compare two points
   */
  private pointsEqual(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y
  }

  /**
   * Convert point to string key
   */
  private pointToKey(point: Point): string {
    return `${point.x},${point.y}`
  }
}
