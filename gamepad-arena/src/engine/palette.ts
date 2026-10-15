/**
 * Shared canvas palette for Gamepad Arena.
 *
 * Keeps canvas colours in sync with the CSS design tokens in `index.css`.
 * Xbox-forward neon arcade look (green dominant) with light PlayStation-blue
 * and face-button accents. Import this from the Renderer and every challenge so
 * CSS and canvas never drift apart.
 */

export const PALETTE = {
  // Surfaces
  bg: '#07090e',
  bgWashXbox: 'rgba(16, 124, 16, 0.20)', // Xbox green radial wash
  bgWashPs: 'rgba(0, 112, 209, 0.15)', // PlayStation blue radial wash
  grid: 'rgba(155, 240, 11, 0.045)',
  ringTrack: '#16202a',
  stroke: '#243041',
  vignette: 'rgba(0, 0, 0, 0.62)',

  // Ink
  ink: '#eef7ec',
  inkDim: '#a7bcae',

  // Brand
  xbox: '#107C10', // Xbox brand green
  xboxNeon: '#9BF00B', // neon green variant (primary accent)
  ps: '#1E8FFF', // PlayStation-ish blue, lightened for contrast on near-black

  // Xbox face buttons (also carry a glyph/letter in the UI — never colour alone)
  faceA: '#2FD40E', // A = green
  faceB: '#FF3B45', // B = red
  faceX: '#2A95F0', // X = blue (lightened #0078D7 for AA on dark)
  faceY: '#FFC21E', // Y = yellow

  // Semantic
  gold: '#FFD23F',
  orange: '#FF9A2E',
  red: '#FF3B45',
  green: '#2FD40E',
  success: '#39D353',
} as const

export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

/** Grade → canvas colour. Mirrors the grade colours used on the DOM result screen. */
export function gradeColor(grade: ScoreGrade): string {
  switch (grade) {
    case 'S':
      return PALETTE.gold
    case 'A':
      return PALETTE.ps
    case 'B':
      return PALETTE.xboxNeon
    case 'C':
      return PALETTE.success
    case 'D':
      return PALETTE.orange
    default:
      return PALETTE.red
  }
}

/**
 * Reduced-motion flag for canvas-side decoration. Set from React once the user's
 * OS preference and the in-app "Reduced Motion" setting are known. Default false.
 * Only gates decorative animation — never gameplay, scoring, timing, or input.
 */
let reducedMotion = false

export function setReducedMotion(value: boolean): void {
  reducedMotion = value
}

export function isReducedMotion(): boolean {
  return reducedMotion
}
