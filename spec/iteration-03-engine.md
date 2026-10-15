# Iteration 3: Core Engine

## Date: 2026-10-15

## Summary
Implemented fixed-timestep game loop and Canvas 2D renderer with arcade primitives.

## Files Created

### src/engine/gameLoop.ts
**GameLoop class** - Fixed timestep (60Hz) game loop with interpolation

- **State Machine**: `idle` | `countdown` | `running` | `paused` | `result`
- **Fixed Timestep**: 1/60s (16.67ms) with max 5 substeps
- **Interpolation**: Alpha value for smooth rendering between updates
- **Visibility Handling**: Auto-pauses on tab blur, resumes on focus
- **Challenge Integration**:
  - `startChallenge(duration)` - Begins countdown + challenge
  - `pause()` / `resume()` / `reset()` - State control
  - `getProgress()` / `getTimeRemaining()` - Progress tracking
  - `getCountdownValue()` - 3-2-1-GO countdown

### src/engine/renderer.ts
**Renderer class** - High-DPI Canvas 2D renderer with arcade drawing primitives

- **High-DPI Support**: Automatically handles devicePixelRatio
- **Auto-resize**: ResizeObserver + window resize listener
- **Core Methods**:
  - `clear(color)` - Clear canvas
  - `getContext()` - Returns `{ ctx, width, height, dpr }`
  - `canvasContext` getter - Direct access to CanvasRenderingContext2D

- **Arcade Primitives**:
  - `drawCenteredText()` - Centered text with options
  - `drawStrokeText()` - Outlined text for arcade look
  - `drawCircle()` - Filled/stroked circles
  - `drawArc()` - Arc segments
  - `drawRing()` - Progress rings with configurable start angle
  - `drawRect()` - Rounded rectangles
  - `drawProgressBar()` - Horizontal progress bars
  - `drawStickVisualizer()` - Stick position with deadzone indicator
  - `drawScanlines()` - CRT scanline effect
  - `drawVignette()` - Radial vignette

### src/styles/index.css (moved to src/index.css)
**Arcade Visual Theme** - Complete CSS design system

- **Color Palette**:
  - Backgrounds: `#0a0a12`, `#12121a`, `#1a1a2e`
  - Accents: Cyan `#00ffff`, Magenta `#ff0066`, Yellow `#ffff00`, Green `#00ff88`, Gold `#ffd700`

- **Typography**:
  - Mono: JetBrains Mono, Fira Code
  - UI: Orbitron, Rajdhani

- **Components**:
  - `.screen` - Modal-style screens with animation
  - `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger`
  - `.gamepad-status` - Connection indicator
  - `.challenge-card` - Challenge selector cards
  - `.result-screen` - Grade, score, stats display
  - `.settings-group` - Settings controls (slider, toggle)
  - `.countdown-overlay` - 3-2-1-GO animation
  - `.debug-overlay` - Dev diagnostics

- **Accessibility**:
  - Reduced motion support
  - High contrast support
  - Focus visible outlines
  - ARIA labels

## Integration
- GameLoop drives Renderer via `setDrawFn()` callback
- App.tsx initializes both on mount
- Gamepad input fed via `setInput()` each frame
- Challenge updates via `update(dt, input)` during running state

## Verification
- ✅ TypeScript compilation successful
- ✅ Production build succeeds (245KB JS, 9KB CSS gzipped)

## Next Steps
- Phase 3: Button Blitz Challenge (first playable challenge)
- Phase 4: Dual Orbit Challenge
