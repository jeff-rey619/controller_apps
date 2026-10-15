/**
 * Canvas 2D renderer with high-DPI support and arcade primitives
 */

export interface CanvasContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
}

export class Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dpr: number
  private width = 0
  private height = 0
  private resizeObserver: ResizeObserver | null = null

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.display = 'block'
    container.appendChild(this.canvas)

    const context = this.canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context not supported')
    this.ctx = context

    this.dpr = window.devicePixelRatio || 1
    this.resize()

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)

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

  clear(color = '#0a0a12'): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.width, this.height)
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
    } = {}
  ): void {
    const {
      font = '24px "JetBrains Mono", monospace',
      color = '#00ffff',
      maxWidth,
      align = 'center',
      baseline = 'middle',
    } = options

    this.ctx.save()
    this.ctx.font = font
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
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
    } = {}
  ): void {
    const {
      font = '24px "JetBrains Mono", monospace',
      fillColor = '#00ffff',
      strokeColor = '#000000',
      lineWidth = 4,
      align = 'center',
      baseline = 'middle',
    } = options

    this.ctx.save()
    this.ctx.font = font
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.lineWidth = lineWidth
    this.ctx.strokeStyle = strokeColor
    this.ctx.fillStyle = fillColor
    this.ctx.strokeText(text, x, y)
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
    } = {}
  ): void {
    const { fillColor, strokeColor, lineWidth = 2 } = options
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
    } = {}
  ): void {
    const { strokeColor = '#00ffff', lineWidth = 4, lineCap = 'round', counterclockwise = false } = options
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise)
    this.ctx.strokeStyle = strokeColor
    this.ctx.lineWidth = lineWidth
    this.ctx.lineCap = lineCap
    this.ctx.stroke()
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
    } = {}
  ): void {
    const { bgColor = '#1a1a2e', fgColor = '#00ffff', lineWidth = 8, startAngle = -Math.PI / 2 } = options

    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.strokeStyle = bgColor
    this.ctx.lineWidth = lineWidth
    this.ctx.stroke()

    if (progress > 0) {
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, startAngle, startAngle + Math.PI * 2 * progress)
      this.ctx.strokeStyle = fgColor
      this.ctx.lineWidth = lineWidth
      this.ctx.lineCap = 'round'
      this.ctx.stroke()
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
    } = {}
  ): void {
    const { fillColor, strokeColor, lineWidth = 2, radius = 0 } = options
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
    } = {}
  ): void {
    const { bgColor = '#1a1a2e', fgColor = '#00ffff', borderColor = '#00ffff', radius = 4 } = options

    this.drawRect(x, y, width, height, { fillColor: bgColor, radius })

    if (progress > 0) {
      this.drawRect(x, y, width * progress, height, { fillColor: fgColor, radius })
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
    const { baseColor = '#1a1a2e', stickColor = '#00ffff', deadzone = 0.15 } = options

    this.drawCircle(x, y, radius, { strokeColor: baseColor, lineWidth: 2 })

    if (deadzone > 0) {
      this.drawCircle(x, y, radius * deadzone, {
        strokeColor: '#ff0066',
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
    this.canvas.remove()
  }
}
