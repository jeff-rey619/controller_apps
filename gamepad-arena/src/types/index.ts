/**
 * Core type definitions for Gamepad Arena
 */

export type GameState = 'idle' | 'countdown' | 'running' | 'paused' | 'result'

export interface NormalizedInput {
  axes: {
    leftStick: { x: number; y: number }
    rightStick: { x: number; y: number }
    leftTrigger: number
    rightTrigger: number
  }
  buttons: {
    a: boolean
    b: boolean
    x: boolean
    y: boolean
    lb: boolean
    rb: boolean
    back: boolean
    start: boolean
    ls: boolean
    rs: boolean
    dpadUp: boolean
    dpadDown: boolean
    dpadLeft: boolean
    dpadRight: boolean
  }
  rawAxes: number[]
  rawButtons: GamepadButton[]
}

export interface ChallengeState {
  progress: number // 0-1
  score: number
  metadata: Record<string, unknown>
}

export interface ScoreResult {
  score: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  details: Record<string, number>
  timestamp: number
}

export interface PersonalBest {
  score: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  details: Record<string, number>
  timestamp: number
  challengeId: string
}

export interface Challenge {
  id: string
  name: string
  description: string
  duration: number // seconds
  setup(ctx: CanvasRenderingContext2D, gamepad: Gamepad): void
  update(dt: number, input: NormalizedInput): ChallengeState
  draw(ctx: CanvasRenderingContext2D): void
  getScore(): ScoreResult
  reset(): void
}

export interface GamepadStatus {
  connected: boolean
  gamepad: Gamepad | null
  index: number
}

export interface Settings {
  deadzone: number
  vibration: boolean
  highContrast: boolean
  reducedMotion: boolean
  audioEnabled: boolean
}