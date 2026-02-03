import { EventEmitter } from 'eventemitter3'
import { AStar } from './AStar'
import { PathSmoother } from './PathSmoother'
import { GridManager } from './GridManager'
import type { Point, Path, MovementOptions } from './types'

interface MovingAgent {
  id: string
  path: Path
  currentIndex: number
  speed: number
  position: Point
  targetPosition: Point
  onComplete?: () => void
}

/**
 * AgentMovementController - Controls agent movement in the office
 *
 * Handles pathfinding, path smoothing, and smooth agent movement.
 * Uses A* for pathfinding and Catmull-Rom for path smoothing.
 */
export class AgentMovementController extends EventEmitter {
  private gridManager: GridManager
  private pathSmoother: PathSmoother
  private movingAgents: Map<string, MovingAgent> = new Map()
  private animationFrame: number | null = null
  private lastUpdate: number = 0

  constructor(gridWidth: number = 16, gridHeight: number = 12) {
    super()
    this.gridManager = new GridManager(gridWidth, gridHeight)
    this.pathSmoother = new PathSmoother()

    // Initialize office layout
    this.gridManager.initializeOfficeLayout()
  }

  /**
   * Move agent from current position to target
   */
  moveAgent(
    agentId: string,
    from: Point,
    to: Point,
    options: Partial<MovementOptions> = {}
  ): boolean {
    const defaultOptions: MovementOptions = {
      speed: 2, // tiles per second
      diagonal: true,
      smoothPath: true,
    }

    const opts = { ...defaultOptions, ...options }

    // Find path using A*
    const astar = new AStar(this.gridManager.getGrid(), opts.diagonal)
    let path = astar.findPath(from, to)

    if (!path) {
      this.emit('movement:failed', agentId, from, to)
      return false
    }

    // Simplify and smooth path
    if (opts.smoothPath) {
      path = this.pathSmoother.simplifyPath(path, 0.3)
      path = this.pathSmoother.smoothPath(path, 8)
    }

    // Create moving agent
    const movingAgent: MovingAgent = {
      id: agentId,
      path,
      currentIndex: 0,
      speed: opts.speed,
      position: { ...from },
      targetPosition: path.points[0],
    }

    this.movingAgents.set(agentId, movingAgent)

    // Start animation loop if not running
    if (!this.animationFrame) {
      this.startAnimationLoop()
    }

    this.emit('movement:started', agentId, path)
    return true
  }

  /**
   * Stop agent movement
   */
  stopAgent(agentId: string): void {
    const agent = this.movingAgents.get(agentId)
    if (agent) {
      this.movingAgents.delete(agentId)
      this.emit('movement:stopped', agentId, agent.position)

      // Stop animation loop if no agents are moving
      if (this.movingAgents.size === 0 && this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
        this.animationFrame = null
      }
    }
  }

  /**
   * Start animation loop
   */
  private startAnimationLoop(): void {
    this.lastUpdate = performance.now()

    const update = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastUpdate) / 1000 // Convert to seconds
      this.lastUpdate = currentTime

      this.updateAgents(deltaTime)

      if (this.movingAgents.size > 0) {
        this.animationFrame = requestAnimationFrame(update)
      } else {
        this.animationFrame = null
      }
    }

    this.animationFrame = requestAnimationFrame(update)
  }

  /**
   * Update all moving agents
   */
  private updateAgents(deltaTime: number): void {
    for (const [agentId, agent] of this.movingAgents.entries()) {
      this.updateAgent(agent, deltaTime)
    }
  }

  /**
   * Update single agent
   */
  private updateAgent(agent: MovingAgent, deltaTime: number): void {
    const target = agent.targetPosition
    const dx = target.x - agent.position.x
    const dy = target.y - agent.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Calculate movement distance for this frame
    const movementDistance = agent.speed * deltaTime

    if (distance <= movementDistance) {
      // Reached current waypoint
      agent.position = { ...target }
      agent.currentIndex++

      // Check if reached end of path
      if (agent.currentIndex >= agent.path.points.length) {
        // Movement complete
        this.emit('movement:complete', agent.id, agent.position)
        agent.onComplete?.()
        this.movingAgents.delete(agent.id)
        return
      }

      // Set next waypoint
      agent.targetPosition = agent.path.points[agent.currentIndex]
    } else {
      // Move towards target
      const ratio = movementDistance / distance
      agent.position.x += dx * ratio
      agent.position.y += dy * ratio
    }

    // Emit position update
    this.emit('movement:update', agent.id, agent.position)
  }

  /**
   * Get agent position
   */
  getAgentPosition(agentId: string): Point | null {
    const agent = this.movingAgents.get(agentId)
    return agent ? { ...agent.position } : null
  }

  /**
   * Check if agent is moving
   */
  isAgentMoving(agentId: string): boolean {
    return this.movingAgents.has(agentId)
  }

  /**
   * Get grid manager
   */
  getGridManager(): GridManager {
    return this.gridManager
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    this.movingAgents.clear()
    this.removeAllListeners()
  }
}
