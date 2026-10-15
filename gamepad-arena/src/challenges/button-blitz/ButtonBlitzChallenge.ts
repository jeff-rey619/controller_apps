/**
 * Button Blitz Challenge
 * Press the target button (A) as many times as possible in 10 seconds
 */

import type { Challenge, ChallengeState, NormalizedInput, ScoreResult } from '../../types'
import { Renderer } from '../../engine/renderer'

export class ButtonBlitzChallenge implements Challenge {
  id = 'button-blitz'
  name = 'Button Blitz'
  description = 'Press A as fast as you can!'
  duration = 10 // seconds

  private renderer: Renderer | null = null
  private pressCount = 0
  private lastPressTime = 0
  private pressIntervals: number[] = []
  private aButtonPrev = false
  private score = 0
  private grade: ScoreResult['grade'] = 'F'
  private flashTimer = 0
  private flashDuration = 0.1
  private combo = 0
  private maxCombo = 0

  setup(ctx: CanvasRenderingContext2D, _gamepad: Gamepad): void {
    this.renderer?.destroy()
    this.renderer = new Renderer(ctx.canvas)
    this.reset()
  }

  update(dt: number, input: NormalizedInput): ChallengeState {
    if (this.flashTimer > 0) {
      this.flashTimer -= dt
    }

    const aPressed = input.buttons.a
    if (aPressed && !this.aButtonPrev) {
      const now = performance.now()
      this.pressCount++
      this.flashTimer = this.flashDuration

      if (this.lastPressTime > 0) {
        const interval = (now - this.lastPressTime) / 1000
        this.pressIntervals.push(interval)

        if (interval < 0.5) {
          this.combo++
          this.maxCombo = Math.max(this.maxCombo, this.combo)
        } else {
          this.combo = 1
        }
      }
      this.lastPressTime = now
    }
    this.aButtonPrev = aPressed

    this.calculateScore()

    return {
      progress: 1,
      score: this.score,
      metadata: {
        pressCount: this.pressCount,
        combo: this.combo,
        maxCombo: this.maxCombo,
        avgInterval: this.pressIntervals.length > 0
          ? this.pressIntervals.reduce((a, b) => a + b, 0) / this.pressIntervals.length
          : 0,
      },
    }
  }

  private calculateScore(): void {
    let score = this.pressCount * 100

    if (this.pressIntervals.length >= 3) {
      const mean = this.pressIntervals.reduce((a, b) => a + b, 0) / this.pressIntervals.length
      const variance = this.pressIntervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / this.pressIntervals.length
      const stdDev = Math.sqrt(variance)
      const rhythmBonus = Math.max(0, 1 - stdDev / 0.3) * 500
      score += Math.floor(rhythmBonus)
    }

    score += this.maxCombo * 50

    this.score = score
    this.grade = this.calculateGrade(score)
  }

  private calculateGrade(score: number): ScoreResult['grade'] {
    if (score >= 3000) return 'S'
    if (score >= 2000) return 'A'
    if (score >= 1500) return 'B'
    if (score >= 1000) return 'C'
    if (score >= 500) return 'D'
    return 'F'
  }
draw(_ctx: CanvasRenderingContext2D): void {
    if (!this.renderer) return

    const r = this.renderer
    const { width, height } = r.getContext()
    const centerX = width / 2
    const centerY = height / 2

    r.clear()
    r.drawVignette('rgba(0,0,0,0.6)')
    r.drawScanlines(0.08)

    r.drawStrokeText('BUTTON BLITZ', centerX, 60, {
      font: '32px "JetBrains Mono", monospace',
      fillColor: '#00ffff',
      strokeColor: '#000',
      lineWidth: 6,
    })

    r.drawCenteredText('PRESS [A]', centerX, centerY - 80, {
      font: '28px "JetBrains Mono", monospace',
      color: '#ff0066',
    })

    const btnRadius = 80
    const btnX = centerX
    const btnY = centerY + 20

    if (this.flashTimer > 0) {
      const alpha = this.flashTimer / this.flashDuration
      r.canvasContext.save()
      r.canvasContext.globalAlpha = alpha * 0.5
      r.drawCircle(btnX, btnY, btnRadius + 20, { fillColor: '#00ffff' })
      r.canvasContext.restore()
    }

    r.drawCircle(btnX, btnY, btnRadius, {
      fillColor: '#1a1a2e',
      strokeColor: this.flashTimer > 0 ? '#00ffff' : '#ff0066',
      lineWidth: this.flashTimer > 0 ? 6 : 3,
    })

    r.drawStrokeText('A', btnX, btnY, {
      font: 'bold 48px "JetBrains Mono", monospace',
      fillColor: '#fff',
      strokeColor: '#000',
      lineWidth: 4,
    })

    r.drawStrokeText(`${this.pressCount}`, centerX, btnY + btnRadius + 60, {
      font: 'bold 72px "JetBrains Mono", monospace',
      fillColor: '#00ffff',
      strokeColor: '#000',
      lineWidth: 6,
    })

    if (this.combo > 1) {
      r.drawCenteredText(`COMBO x${this.combo}!`, centerX, btnY + btnRadius + 130, {
        font: '24px "JetBrains Mono", monospace',
        color: '#ffff00',
      })
    }

    r.drawCenteredText(`SCORE: ${this.score}`, centerX, height - 100, {
      font: '24px "JetBrains Mono", monospace',
      color: '#00ffff',
    })

    const gradeColor = this.getGradeColor(this.grade)
    r.drawCenteredText(`GRADE: ${this.grade}`, centerX, height - 60, {
      font: '28px "JetBrains Mono", monospace',
      color: gradeColor,
    })
  }

  private getGradeColor(grade: ScoreResult['grade']): string {
    switch (grade) {
      case 'S': return '#ffd700'
      case 'A': return '#ff0066'
      case 'B': return '#00ffff'
      case 'C': return '#88ff88'
      case 'D': return '#ffaa00'
      default: return '#ff4444'
    }
  }

  getScore(): ScoreResult {
    return {
      score: this.score,
      grade: this.grade,
      details: {
        presses: this.pressCount,
        maxCombo: this.maxCombo,
        avgInterval: this.pressIntervals.length > 0
          ? this.pressIntervals.reduce((a, b) => a + b, 0) / this.pressIntervals.length
          : 0,
        pressesPerSecond: this.duration > 0 ? this.pressCount / this.duration : 0,
      },
      timestamp: Date.now(),
    }
  }

  reset(): void {
    this.pressCount = 0
    this.lastPressTime = 0
    this.pressIntervals = []
    this.aButtonPrev = false
    this.score = 0
    this.grade = 'F'
    this.flashTimer = 0
    this.combo = 0
    this.maxCombo = 0
  }
}