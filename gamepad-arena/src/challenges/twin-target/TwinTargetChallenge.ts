/**
 * Twin Target — Dual Stick Rush MVP
 *
 * Two cursors (cyan left, purple right) must reach their targets before the
 * round timer expires. Each successful round awards points and spawns a new
 * target pair. A 60-second session ends with score, streak, and result screen.
 */

import type { Challenge, ChallengeState, NormalizedInput, ScoreResult } from '../../types'
import { Renderer } from '../../engine/renderer'
import { applyDeadzone } from '../../utils/input'

const SESSION_DURATION = 60 // seconds
const ROUND_TIME = 4 // seconds per round
const TARGET_RADIUS = 24
const CURSOR_RADIUS = 12
const MOVE_SPEED = 400 // pixels per second at full stick
const DEADZONE = 0.15

interface Cursor {
  x: number
  y: number
  targetX: number
  targetY: number
  zoneLeft: number
  zoneRight: number
  zoneTop: number
  zoneBottom: number
  color: string
}

interface RoundResult {
  completed: boolean
  timeMs: number
  clean: boolean // no wrong-target touches
}

export class TwinTargetChallenge implements Challenge {
  id = 'twin-target'
  name = 'Dual Stick Rush'
  description = 'Move both cursors to their targets fast!'
  duration = SESSION_DURATION

  private renderer: Renderer | null = null
  private leftCursor: Cursor | null = null
  private rightCursor: Cursor | null = null

  sessionTime = 0
  roundTime = 0
  roundResults: RoundResult[] = []
  streak = 0
  bestStreak = 0
  totalCompleted = 0
  totalClean = 0

  score = 0
  grade: ScoreResult['grade'] = 'F'

  setup(ctx: CanvasRenderingContext2D, _gamepad: Gamepad): void {
    this.renderer?.destroy()
    this.renderer = new Renderer(ctx.canvas)
    this.reset()
  }

  update(dt: number, input: NormalizedInput): ChallengeState {
    this.sessionTime += dt
    this.roundTime += dt

    const leftInput = {
      x: applyDeadzone(input.axes.leftStick.x, DEADZONE),
      y: applyDeadzone(input.axes.leftStick.y, DEADZONE),
    }
    const rightInput = {
      x: applyDeadzone(input.axes.rightStick.x, DEADZONE),
      y: applyDeadzone(input.axes.rightStick.y, DEADZONE),
    }

    if (this.leftCursor) {
      this.moveCursor(this.leftCursor, leftInput, dt)
    }
    if (this.rightCursor) {
      this.moveCursor(this.rightCursor, rightInput, dt)
    }

    // Check if both cursors reached their targets
    if (this.leftCursor && this.rightCursor) {
      const leftReached = this.distance(this.leftCursor.x, this.leftCursor.y, this.leftCursor.targetX, this.leftCursor.targetY) < TARGET_RADIUS
      const rightReached = this.distance(this.rightCursor.x, this.rightCursor.y, this.rightCursor.targetX, this.rightCursor.targetY) < TARGET_RADIUS

      if (leftReached && rightReached) {
        this.completeRound()
      }
    }

    // Round timeout
    if (this.roundTime >= ROUND_TIME) {
      this.completeRound(false)
    }

    // Session end
    if (this.sessionTime >= this.duration) {
      this.calculateScore()
    }

    return {
      progress: Math.min(1, this.sessionTime / this.duration),
      score: this.score,
      metadata: {
        streak: this.streak,
        bestStreak: this.bestStreak,
        completed: this.totalCompleted,
      },
    }
  }

  private moveCursor(cursor: Cursor, input: { x: number; y: number }, dt: number): void {
    const dx = input.x * MOVE_SPEED * dt
    const dy = input.y * MOVE_SPEED * dt

    cursor.x = Math.max(cursor.zoneLeft, Math.min(cursor.zoneRight, cursor.x + dx))
    cursor.y = Math.max(cursor.zoneTop, Math.min(cursor.zoneBottom, cursor.y + dy))
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  private completeRound(completed: boolean = true): void {
    const result: RoundResult = {
      completed,
      timeMs: this.roundTime * 1000,
      clean: completed,
    }
    this.roundResults.push(result)

    if (completed) {
      this.totalCompleted++
      this.streak++
      this.bestStreak = Math.max(this.bestStreak, this.streak)
      this.totalClean++
    } else {
      this.streak = 0
    }

    // Spawn new targets
    this.spawnTargets()
    this.roundTime = 0
  }

  private spawnTargets(): void {
    const renderer = this.renderer!
    const { width, height } = renderer.getContext()

    const zoneWidth = width / 2 - 40
    const zoneHeight = height - 120

    // Left zone
    this.leftCursor = {
      x: 100,
      y: height / 2,
      targetX: 60 + Math.random() * (zoneWidth - 80),
      targetY: 60 + Math.random() * (zoneHeight - 80),
      zoneLeft: 20,
      zoneRight: width / 2 - 20,
      zoneTop: 60,
      zoneBottom: height - 60,
      color: '#28D7E5', // cyan
    }

    // Right zone
    this.rightCursor = {
      x: width - 100,
      y: height / 2,
      targetX: width / 2 + 20 + Math.random() * (zoneWidth - 80),
      targetY: 60 + Math.random() * (zoneHeight - 80),
      zoneLeft: width / 2 + 20,
      zoneRight: width - 20,
      zoneTop: 60,
      zoneBottom: height - 60,
      color: '#B46BFF', // purple
    }
  }

  calculateScore(): void {
    const baseScore = this.totalCompleted * 100
    const speedBonus = this.roundResults
      .filter(r => r.completed)
      .reduce((sum, r) => sum + Math.max(0, 50 - (r.timeMs / 1000)), 0)
    const cleanBonus = this.totalClean * 25
    const streakMultiplier = 1 + Math.min(this.bestStreak * 0.1, 2)

    this.score = Math.round((baseScore + speedBonus + cleanBonus) * streakMultiplier)
    this.grade = this.calculateGrade(this.score)
  }

  private calculateGrade(score: number): ScoreResult['grade'] {
    if (score >= 5000) return 'S'
    if (score >= 3500) return 'A'
    if (score >= 2500) return 'B'
    if (score >= 1500) return 'C'
    if (score >= 800) return 'D'
    return 'F'
  }

  draw(_ctx: CanvasRenderingContext2D): void {
    if (!this.renderer) return

    const r = this.renderer
    const { width, height } = r.getContext()

    r.clear('#0B1020')

    // Draw zones
    r.drawRect(20, 60, width / 2 - 40, height - 120, {
      fillColor: '#121C2C',
      strokeColor: '#2a3a4e',
      lineWidth: 2,
    })
    r.drawRect(width / 2 + 20, 60, width / 2 - 40, height - 120, {
      fillColor: '#121C2C',
      strokeColor: '#2a3a4e',
      lineWidth: 2,
    })

    // Draw cursors and targets
    if (this.leftCursor) this.drawCursor(r, this.leftCursor)
    if (this.rightCursor) this.drawCursor(r, this.rightCursor)

    // HUD
    const remaining = Math.max(0, this.duration - this.sessionTime)
    r.drawCenteredText(`Session: ${remaining.toFixed(1)}s`, width / 2, 30, {
      font: '18px "JetBrains Mono", monospace',
      color: '#E8F1FF',
    })

    r.drawCenteredText(`Round: ${this.roundTime.toFixed(1)}s`, width / 2, 55, {
      font: '14px "JetBrains Mono", monospace',
      color: '#8CA4C2',
    })

    r.drawCenteredText(`Score: ${this.score}  Streak: x${this.streak}`, width / 2, height - 20, {
      font: '16px "JetBrains Mono", monospace',
      color: '#F6C453',
    })
  }

  private drawCursor(r: Renderer, cursor: Cursor): void {
    // Target
    r.drawCircle(cursor.targetX, cursor.targetY, TARGET_RADIUS, {
      strokeColor: cursor.color,
      lineWidth: 3,
    })
    r.drawCenteredText('●', cursor.targetX, cursor.targetY, {
      font: '16px "JetBrains Mono", monospace',
      color: cursor.color,
    })

    // Cursor
    r.drawCircle(cursor.x, cursor.y, CURSOR_RADIUS, {
      fillColor: cursor.color,
      strokeColor: '#ffffff',
      lineWidth: 2,
    })
  }

  getScore(): ScoreResult {
    this.calculateScore()
    const avgTime = this.roundResults.filter(r => r.completed).length > 0
      ? this.roundResults.filter(r => r.completed).reduce((sum, r) => sum + r.timeMs, 0) / this.roundResults.filter(r => r.completed).length
      : 0

    return {
      score: this.score,
      grade: this.grade,
      details: {
        completed: this.totalCompleted,
        clean: this.totalClean,
        bestStreak: this.bestStreak,
        avgTime: avgTime / 1000,
        accuracy: this.totalCompleted > 0 ? Math.round((this.totalClean / this.totalCompleted) * 100) : 0,
      },
      timestamp: Date.now(),
    }
  }

  reset(): void {
    this.sessionTime = 0
    this.roundTime = 0
    this.roundResults = []
    this.streak = 0
    this.bestStreak = 0
    this.totalCompleted = 0
    this.totalClean = 0
    this.score = 0
    this.grade = 'F'
    this.leftCursor = null
    this.rightCursor = null

    // Only spawn targets if renderer exists (for testing, skip canvas setup)
    if (this.renderer) {
      this.spawnTargets()
    }
  }
}
