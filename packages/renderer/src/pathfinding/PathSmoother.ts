import type { Point, Path } from './types'

/**
 * PathSmoother - Smooths jagged A* paths into more natural movement
 *
 * Uses Catmull-Rom spline interpolation to create smooth curves
 * between waypoints while maintaining path validity.
 */
export class PathSmoother {
  /**
   * Smooth a path using Catmull-Rom spline
   */
  smoothPath(path: Path, segments: number = 4): Path {
    if (path.points.length < 3) {
      return path // Can't smooth paths with less than 3 points
    }

    const smoothedPoints: Point[] = []
    const points = path.points

    // Add first point
    smoothedPoints.push({ ...points[0] })

    // Smooth between points
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1]

      // Generate segments between p1 and p2
      for (let t = 0; t <= 1; t += 1 / segments) {
        if (t === 0 && i > 0) continue // Skip first point except for first segment

        const point = this.catmullRom(p0, p1, p2, p3, t)
        smoothedPoints.push(point)
      }
    }

    // Add last point
    smoothedPoints.push({ ...points[points.length - 1] })

    return {
      points: smoothedPoints,
      cost: path.cost,
      smoothed: true,
    }
  }

  /**
   * Catmull-Rom spline interpolation
   */
  private catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t
    const t3 = t2 * t

    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)

    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)

    return { x, y }
  }

  /**
   * Simplify path by removing unnecessary waypoints
   * Uses Douglas-Peucker algorithm
   */
  simplifyPath(path: Path, tolerance: number = 0.5): Path {
    if (path.points.length < 3) {
      return path
    }

    const simplified = this.douglasPeucker(path.points, tolerance)

    return {
      points: simplified,
      cost: path.cost,
      smoothed: path.smoothed,
    }
  }

  /**
   * Douglas-Peucker path simplification
   */
  private douglasPeucker(points: Point[], tolerance: number): Point[] {
    if (points.length < 3) {
      return points
    }

    // Find point with maximum distance from line
    let maxDistance = 0
    let maxIndex = 0

    const start = points[0]
    const end = points[points.length - 1]

    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], start, end)
      if (distance > maxDistance) {
        maxDistance = distance
        maxIndex = i
      }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance)
      const right = this.douglasPeucker(points.slice(maxIndex), tolerance)

      // Combine results (remove duplicate middle point)
      return [...left.slice(0, -1), ...right]
    } else {
      // All points are within tolerance, return just endpoints
      return [start, end]
    }
  }

  /**
   * Calculate perpendicular distance from point to line
   */
  private perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y

    // Line length squared
    const lengthSquared = dx * dx + dy * dy

    if (lengthSquared === 0) {
      // Line is actually a point
      return Math.sqrt(
        (point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2
      )
    }

    // Calculate projection onto line
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
      )
    )

    // Find closest point on line
    const closestX = lineStart.x + t * dx
    const closestY = lineStart.y + t * dy

    // Return distance to closest point
    return Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2)
  }
}
