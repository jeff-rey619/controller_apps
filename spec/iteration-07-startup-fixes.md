# Iteration 7: Startup, Rendering & Layout Fixes

## Date: 2026-10-15

## Summary
The game was unplayable: the on-screen START button did nothing, and several
other screens were broken or janky. This iteration fixes the engine
initialization bug that caused the dead START button, a duplicate off-screen
canvas, per-frame re-render churn, a leaked animation loop, an over-eager Start
button heuristic, the overflowing settings dialog, and a broken personal-best
banner.

## Root Causes & Fixes

### 1. START button did nothing — canvas ref was never attached (`src/App.tsx`)
**Problem:** Clicking START (or pressing Start) did nothing at all. No challenge
ever launched.

**Root Cause:** `canvasContainerRef` was created and read in the mount effect,
but was **never attached** to the `.canvas-container` div. So
`canvasContainerRef.current` was always `null`, the effect returned early, and
the `Renderer` + `GameLoop` were never created. `startChallenge()` then bailed
on its `!gameLoopRef.current || !rendererRef.current` guard every time.

**Fix:** Attach the ref: `<div className="canvas-container" ref={canvasContainerRef}>`.

### 2. Gameplay rendered off-screen — duplicate canvas (`src/engine/renderer.ts`, `src/challenges/button-blitz/ButtonBlitzChallenge.ts`)
**Problem:** After fix #1 the challenge ran but was invisible; the arcade visuals
were never seen.

**Root Cause:** `ButtonBlitzChallenge.setup()` did
`new Renderer(ctx.canvas.parentElement!)`, which **created and appended a second
full-size canvas** into the same container. It was laid out *below* the primary
canvas (off-screen), and the challenge drew into that off-screen canvas.

**Fix:** `Renderer` now accepts either a container element (creates + owns a
canvas) or an existing `HTMLCanvasElement` (wraps it, does not own it). A new
`ownsCanvas` flag means `destroy()` only removes a canvas it created.
`ButtonBlitzChallenge.setup()` now calls `new Renderer(ctx.canvas)`, reusing the
single primary canvas.

### 3. Whole app re-rendered every animation frame (`src/hooks/useGamepad.ts`)
**Problem:** Heavy jank; React re-rendered the entire app ~60 times/second even
when nothing changed.

**Root Cause:** The `useGamepad` polling loop called `setStatus({...})` and
`setGamepads(array)` with brand-new object/array identities on every `rAF` tick.

**Fix:** Use functional state updates that return the previous value when the
connected device set is unchanged, so React bails out and no re-render occurs.

### 4. Countdown effect leaked an infinite animation loop (`src/App.tsx`)
**Problem:** Each `gameState` change spawned another endless
`requestAnimationFrame` loop that was never cancelled.

**Root Cause:** The countdown-watching effect returned no cleanup.

**Fix:** Track the frame id and cancel it in the effect cleanup.

### 5. Start button heuristic over-triggered (`src/utils/input.ts`)
**Problem:** Pressing D-pad, stick clicks, or Back would toggle pause, and the
detection logged to the console on every frame.

**Root Cause:** `getStartBtn()` returned `true` if *any* button in
`[9, 11, 8, 10, 12…19]` was pressed, not just the mapped Start button.

**Fix:** Removed the heuristic; Start now uses the mapped index
(`getBtn('start')`), which already supports per-controller remapping.

### 6. Settings dialog overflowed the window (`src/index.css`)
**Problem:** Opening Settings pushed content out of the viewport; the mapping
grid and DONE button were unreachable.

**Root Cause:** `.screen` had no height constraint, and `html/body/#root` are
`overflow: hidden`. A tall dialog centered in a flex container overflowed both
edges.

**Fix:** `.screen` now has `max-height: 100%`, `overflow-y: auto`, and
`overscroll-behavior: contain`, so any tall screen scrolls internally.

### 7. "NEW PERSONAL BEST!" banner never appeared (`src/App.tsx`)
**Problem:** Finishing with a new best never showed the PB banner.

**Root Cause:** The result effect depended on `personalBests`, so it re-ran after
saving a PB, calling `getScore()` again — which generated a **new
`timestamp`**. The `lastResult.timestamp === pb.timestamp` comparison then
failed.

**Fix:** Guard the effect with `resultHandledRef` so the result is captured
exactly once per run. The ref is reset in `startChallenge()`.

### 8. Result screen was Button-Blitz-specific (`src/App.tsx`)
**Problem:** The result stats were hardcoded to `presses` / `maxCombo` /
`pressesPerSecond`, so any other challenge would render blanks (and
`undefined.toFixed()` would throw).

**Fix:** The result screen now renders all entries of `ScoreResult.details`
generically via a `DETAIL_LABELS` map and a `formatDetail()` helper. Added
labels/formatting for `avgInterval`, `rotations`, `simultaneousPct`,
`smoothnessPct`.

### 9. Lint made green (pre-existing failures)
- Wrapped the `case 'result':` body in braces to resolve three
  `no-case-declarations` errors.
- Replaced `(e as any).gamepad` with a typed `gamepadFromEvent()` helper and
  removed `null as any` in test setup (`@typescript-eslint/no-explicit-any`).

`npm run lint` now exits 0.

## Files Modified
- `src/App.tsx` — ref attachment, countdown cleanup, PB guard, generic result stats, detail labels/formatter
- `src/engine/renderer.ts` — wrap-existing-canvas support + `ownsCanvas`
- `src/challenges/button-blitz/ButtonBlitzChallenge.ts` — reuse primary canvas
- `src/hooks/useGamepad.ts` — change-only state updates, typed event helper
- `src/utils/input.ts` — removed over-eager Start heuristic
- `src/index.css` — scrollable `.screen`
- `src/test/setup.ts`, `src/utils/input.test.ts` — remove `any`

## Verification
- ✅ `npm run build` succeeds
- ✅ `npm run test:run` — 20 tests pass
- ✅ `npm run lint` — exit 0
- ✅ Browser (synthetic standard gamepad): START launches the countdown, game renders centered, a single `<canvas>` exists, physical Start pauses/resumes, Escape returns to menu
- ✅ Settings dialog fits the viewport and scrolls to DONE (`scrollHeight 1077 > clientHeight 403`, `overflowsViewport: false`)
- ✅ New PB shows the banner; a lower score does not
