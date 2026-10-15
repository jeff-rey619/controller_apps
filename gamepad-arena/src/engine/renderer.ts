/**
 * Canvas 2D renderer with high-DPI support and arcade primitives.
 *
 * Colours come from the shared `PALETTE` (src/engine/palette.ts) so the canvas
 * stays in sync with the CSS design tokens. Neon glow is available on most
 * primitives via a `glow` option (shadowBlur + shadowColor).
 */

import { PALETTE, isReducedMotion } from './palette'

export interface CanvasContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
}

interface GlowOptions {
  glow?: number
  glowColor?: string
}

export class Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dpr: number
  private width = 0
  private height = 0
  private resizeObserver: ResizeObserver | null = null
  private ownsCanvas: boolean

  constructor(target: HTMLElement) {
    if (target instanceof HTMLCanvasElement) {
      this.canvas = target
      this.ownsCanvas = false
    } else {
      this.canvas = document.createElement('canvas')
      this.canvas.style.width = '100%'
      this.canvas.style.height = '100%'
      this.canvas.style.display = 'block'
      target.appendChild(this.canvas)
      this.ownsCanvas = true
    }

    const context = this.canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context not supported')
    this.ctx = context

    this.dpr = window.devicePixelRatio || 1
    this.resize()

    const container = this.canvas.parentElement
    if (container) {
      this.resizeObserver = new ResizeObserver(() => this.resize())
      this.resizeObserver.observe(container)
    }

    window.addEventListener('resize', this.resize)
  }

  private resize = (): void => {
    const container = this.canvas.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    this.width = Math.floor(rect.width)
    this.height = Math.floor(rect.height)

    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  getContext(): CanvasContext {
    return {
      ctx: this.ctx,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
    }
  }

  get canvasContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  private setGlow(glow?: number, glowColor?: string): void {
    if (glow && glow > 0) {
      this.ctx.shadowBlur = glow
      this.ctx.shadowColor = glowColor ?? PALETTE.xboxNeon
    }
  }

  clear(color: string = PALETTE.bg): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  /**
   * Layered neon backdrop drawn behind gameplay on the same canvas: a deep base
   * fill, two soft radial brand washes (Xbox green + PlayStation blue), a faint
   * grid, a decorative controller silhouette, scanlines and a vignette. Purely
   * decorative; never affects gameplay.
   */
  drawBackdrop(): void {
    const { ctx, width: w, height: h } = this
    this.clear()

    // Radial brand washes.
    const wash = (cx: number, cy: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, color)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
    wash(w * 0.22, h * 0.16, Math.max(w, h) * 0.6, PALETTE.bgWashXbox)
    wash(w * 0.82, h * 0.86, Math.max(w, h) * 0.55, PALETTE.bgWashPs)

    // Faint grid.
    ctx.save()
    ctx.strokeStyle = PALETTE.grid
    ctx.lineWidth = 1
    const step = 46
    ctx.beginPath()
    for (let x = (w % step) / 2; x < w; x += step) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
    }
    for (let y = (h % step) / 2; y < h; y += step) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.stroke()
    ctx.restore()

    // Decorative controller silhouette, centred and very faint.
    this.drawControllerGlyph(w / 2, h / 2, Math.min(w, h) * 0.32, PALETTE.xboxNeon, 0.05)

    this.drawScanlines(isReducedMotion() ? 0.04 : 0.07)
    this.drawVignette(PALETTE.vignette)
  }

  /**
   * A stylised gamepad silhouette (rounded body, two grips, two sticks, a
   * d-pad cross and four face dots). Decorative only.
   */
  drawControllerGlyph(cx: number, cy: number, size: number, color: string, alpha = 0.06): void {
    const ctx = this.ctx
    const w = size
    const h = size * 0.62
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = Math.max(2, size * 0.02)

    // Body: a wide rounded capsule with lobed grips.
    ctx.beginPath()
    const r = h * 0.5
    ctx.moveTo(cx - w * 0.32, cy - r * 0.55)
    ctx.quadraticCurveTo(cx, cy - r * 0.95, cx + w * 0.32, cy - r * 0.55)
    ctx.quadraticCurveTo(cx + w * 0.55, cy - r * 0.2, cx + w * 0.5, cy + r * 0.6)
    ctx.quadraticCurveTo(cx + w * 0.42, cy + r * 1.05, cx + w * 0.22, cy + r * 0.55)
    ctx.quadraticCurveTo(cx, cy + r * 0.35, cx - w * 0.22, cy + r * 0.55)
    ctx.quadraticCurveTo(cx - w * 0.42, cy + r * 1.05, cx - w * 0.5, cy + r * 0.6)
    ctx.quadraticCurveTo(cx - w * 0.55, cy - r * 0.2, cx - w * 0.32, cy - r * 0.55)
    ctx.closePath()
    ctx.stroke()

    // Left stick + right stick.
    const stickR = w * 0.075
    ctx.beginPath()
    ctx.arc(cx - w * 0.24, cy - r * 0.02, stickR, 0, Math.PI * 2)
    ctx.arc(cx + w * 0.24, cy + r * 0.2, stickR, 0, Math.PI * 2)
    ctx.stroke()

    // D-pad cross (left).
    const d = w * 0.05
    const dx = cx - w * 0.07
    const dy = cy + r * 0.24
    ctx.beginPath()
    ctx.rect(dx - d / 2, dy - d * 1.5, d, d * 3)
    ctx.rect(dx - d * 1.5, dy - d / 2, d * 3, d)
    ctx.stroke()

    // Four face dots (right).
    const fx = cx + w * 0.1
    const fy = cy - r * 0.18
    const fr = w * 0.032
    const off = w * 0.065
    ctx.beginPath()
    ctx.arc(fx, fy - off, fr, 0, Math.PI * 2)
    ctx.arc(fx, fy + off, fr, 0, Math.PI * 2)
    ctx.arc(fx - off, fy, fr, 0, Math.PI * 2)
    ctx.arc(fx + off, fy, fr, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }

  // Arcade drawing primitives

  drawCenteredText(
    text: string,
    x: number,
    y: number,
    options: {
      font?: string
      color?: string
      maxWidth?: number
      align?: CanvasTextAlign
      baseline?: CanvasTextBaseline
    } & GlowOptions = {}
  ): void {
    const {
      font = '24px "JetBrains Mono", monospace',
      color = PALETTE.xboxNeon,
      maxWidth,
      align = 'center',
      baseline = 'middle',
      glow,
      glowColor,
    } = options

    this.ctx.save()
    this.ctx.font = font
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.setGlow(glow, glowColor ?? color)
    if (maxWidth) {
      this.ctx.fillText(text, x, y, maxWidth)
    } else {
      this.ctx.fillText(text, x, y)
    }
    this.ctx.restore()
  }

  drawStrokeText(
    text: string,
    x: number,
    y: number,
    options: {
      font?: string
      fillColor?: string
      strokeColor?: string
      lineWidth?: number
      align?: CanvasTextAlign
      baseline?: CanvasTextBaseline
    } & GlowOptions = {}
  ): void {
    const {
      font = '24px "JetBrains Mono", monospace',
      fillColor = PALETTE.xboxNeon,
      strokeColor = '#000000',
      lineWidth = 4,
      align = 'center',
      baseline = 'middle',
      glow,
      glowColor,
    } = options

    this.ctx.save()
    this.ctx.font = font
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.lineWidth = lineWidth
    this.ctx.strokeStyle = strokeColor
    this.ctx.fillStyle = fillColor
    this.ctx.strokeText(text, x, y)
    this.setGlow(glow, glowColor ?? fillColor)
    this.ctx.fillText(text, x, y)
    this.ctx.restore()
  }

  drawCircle(
    x: number,
    y: number,
    radius: number,
    options: {
      fillColor?: string
      strokeColor?: string
      lineWidth?: number
    } & GlowOptions = {}
  ): void {
    const { fillColor, strokeColor, lineWidth = 2, glow, glowColor } = options
    this.ctx.save()
    this.setGlow(glow, glowColor ?? strokeColor ?? fillColor)
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.fill()
    }
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
    this.ctx.restore()
  }

  drawArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    options: {
      strokeColor?: string
      lineWidth?: number
      lineCap?: CanvasLineCap
      counterclockwise?: boolean
    } & GlowOptions = {}
  ): void {
    const {
      strokeColor = PALETTE.xboxNeon,
      lineWidth = 4,
      lineCap = 'round',
      counterclockwise = false,
      glow,
      glowColor,
    } = options
    this.ctx.save()
    this.setGlow(glow, glowColor ?? strokeColor)
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise)
    this.ctx.strokeStyle = strokeColor
    this.ctx.lineWidth = lineWidth
    this.ctx.lineCap = lineCap
    this.ctx.stroke()
    this.ctx.restore()
  }

  drawRing(
    x: number,
    y: number,
    radius: number,
    progress: number,
    options: {
      bgColor?: string
      fgColor?: string
      lineWidth?: number
      startAngle?: number
    } & GlowOptions = {}
  ): void {
    const {
      bgColor = PALETTE.ringTrack,
      fgColor = PALETTE.xboxNeon,
      lineWidth = 8,
      startAngle = -Math.PI / 2,
      glow,
      glowColor,
    } = options

    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.strokeStyle = bgColor
    this.ctx.lineWidth = lineWidth
    this.ctx.stroke()

    if (progress > 0) {
      this.ctx.save()
      this.setGlow(glow, glowColor ?? fgColor)
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, startAngle, startAngle + Math.PI * 2 * progress)
      this.ctx.strokeStyle = fgColor
      this.ctx.lineWidth = lineWidth
      this.ctx.lineCap = 'round'
      this.ctx.stroke()
      this.ctx.restore()
    }
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      fillColor?: string
      strokeColor?: string
      lineWidth?: number
      radius?: number
    } & GlowOptions = {}
  ): void {
    const { fillColor, strokeColor, lineWidth = 2, radius = 0, glow, glowColor } = options
    this.ctx.save()
    this.setGlow(glow, glowColor ?? strokeColor ?? fillColor)
    this.ctx.beginPath()
    if (radius > 0) {
      this.roundRect(x, y, width, height, radius)
    } else {
      this.ctx.rect(x, y, width, height)
    }
    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.fill()
    }
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
    this.ctx.restore()
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.moveTo(x + r, y)
    this.ctx.lineTo(x + w - r, y)
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    this.ctx.lineTo(x + w, y + h - r)
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    this.ctx.lineTo(x + r, y + h)
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    this.ctx.lineTo(x, y + r)
    this.ctx.quadraticCurveTo(x, y, x + r, y)
    this.ctx.closePath()
  }

  drawProgressBar(
    x: number,
    y: number,
    width: number,
    height: number,
    progress: number,
    options: {
      bgColor?: string
      fgColor?: string
      borderColor?: string
      radius?: number
    } & GlowOptions = {}
  ): void {
    const {
      bgColor = PALETTE.ringTrack,
      fgColor = PALETTE.xboxNeon,
      borderColor = PALETTE.stroke,
      radius = 4,
      glow,
      glowColor,
    } = options

    this.drawRect(x, y, width, height, { fillColor: bgColor, radius })

    if (progress > 0) {
      this.drawRect(x, y, width * progress, height, { fillColor: fgColor, radius, glow, glowColor: glowColor ?? fgColor })
    }

    this.drawRect(x, y, width, height, { strokeColor: borderColor, lineWidth: 2, radius })
  }

  drawStickVisualizer(
    x: number,
    y: number,
    radius: number,
    stickX: number,
    stickY: number,
    options: {
      baseColor?: string
      stickColor?: string
      deadzone?: number
    } = {}
  ): void {
    const { baseColor = PALETTE.stroke, stickColor = PALETTE.xboxNeon, deadzone = 0.15 } = options

    this.drawCircle(x, y, radius, { strokeColor: baseColor, lineWidth: 2 })

    if (deadzone > 0) {
      this.drawCircle(x, y, radius * deadzone, {
        strokeColor: PALETTE.red,
        lineWidth: 1,
      })
    }

    const stickRadius = radius * 0.85
    const px = x + stickX * stickRadius
    const py = y - stickY * stickRadius

    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(px, py)
    this.ctx.strokeStyle = stickColor
    this.ctx.lineWidth = 2
    this.ctx.stroke()

    this.drawCircle(px, py, radius * 0.15, { fillColor: stickColor, strokeColor: '#fff', lineWidth: 2 })
  }

  drawScanlines(intensity = 0.1): void {
    this.ctx.save()
    this.ctx.globalAlpha = intensity
    this.ctx.strokeStyle = '#000'
    this.ctx.lineWidth = 1
    for (let y = 0; y < this.height; y += 4) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.width, y)
      this.ctx.stroke()
    }
    this.ctx.restore()
  }

  drawVignette(color = 'rgba(0,0,0,0.5)'): void {
    const gradient = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      0,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) / 1.5
    )
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, color)
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  destroy(): void {
    this.resizeObserver?.disconnect()
    window.removeEventListener('resize', this.resize)
    if (this.ownsCanvas) {
      this.canvas.remove()
    }
  }
}
