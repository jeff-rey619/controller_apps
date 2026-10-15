# Iteration 12: Twin Target (Dual Stick Rush) — Theme & Convention Reconciliation

## Date: 2026-10-16

## Context
A parallel branch added a third challenge, **Twin Target / "Dual Stick Rush"**
(`src/challenges/twin-target/`), and gamepad-UI navigation (iterations 10–11).
After merging it with the neon-UI/accessibility (iteration 9) and central-timing
(iteration "10-timing-config-tests") work, the new challenge still followed its
own conventions. This iteration reconciles it with the established ones —
without changing its gameplay, scoring, or round logic.

## Changes

### 1. Central timing (`src/config/timing.ts`, `TwinTargetChallenge.ts`)
- Added `'twin-target': 60` to `TIMING.challengeDurations` and
  `TIMING.twinTargetRoundSeconds` (4) for the per-round limit.
- The challenge now reads `duration` and the round time from `TIMING` instead of
  local `SESSION_DURATION` / `ROUND_TIME` literals. Values are unchanged.

### 2. Single deadzone (bugfix)
- The challenge re-applied a hardcoded `applyDeadzone(..., 0.15)` on top of input
  that App had **already** normalized with the user's deadzone setting — a double
  deadzone that also ignored the Settings slider. It now uses the normalized
  stick vectors directly (matching Dual Orbit), so the user's deadzone is honoured
  once.

### 3. Neon theme + never-colour-alone (`TwinTargetChallenge.ts`)
- Replaced the hardcoded cyan/purple/navy hex with the shared `PALETTE`: left
  cursor = Xbox green, right cursor = PlayStation blue (consistent with Dual
  Orbit's L/R), rounded zone panels, `drawBackdrop()` neon background, and glow
  on cursors/targets.
- Added **L / R labels** above each zone so the two sides are not distinguished
  by colour alone. Grade colour on the HUD now comes from `gradeColor()`.

### 4. Result screen labels (`src/App.tsx`)
- Added `DETAIL_LABELS` and `formatDetail` handling for the challenge's stats:
  `completed` → Rounds, `clean` → Clean, `bestStreak` → Best Streak (×N),
  `avgTime` → Avg Time (s), `accuracy` → Accuracy (%).

## Files Modified
- `src/config/timing.ts`, `src/challenges/twin-target/TwinTargetChallenge.ts`,
  `src/App.tsx`.

## Not changed
- Gameplay, movement, round completion, and scoring for Twin Target are
  untouched; its 5 unit tests still pass as-is.

## Verification
- ✅ `npm run build` — succeeds.
- ✅ `npm run test:run` — **48/48 pass** (6 suites).
- ✅ `npm run lint` — exit 0.
- ✅ Real browser (headless Chromium, synthetic dual-stick gamepad): Twin Target
  renders in the neon theme — green "L" zone/cursor, blue "R" zone/cursor with
  glowing target rings, neon backdrop, and both cursors driven simultaneously.
