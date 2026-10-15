# Iteration 8: Dual Orbit Challenge

## Date: 2026-10-15

## Summary
Implemented the second playable challenge: **Dual Orbit** — rotate the left
stick clockwise while rotating the right stick counter-clockwise
simultaneously.

## Challenge Config
- ID: `dual-orbit`
- Name: `Dual Orbit`
- Duration: 15 seconds
- Description: `Spin L-stick CW and R-stick CCW together`
- Goal: complete **3 full orbits** on each stick in opposite directions

## Files Created
- `src/challenges/dual-orbit/DualOrbitChallenge.ts`
- `src/challenges/dual-orbit/DualOrbitChallenge.test.ts`

## Files Modified
- `src/challenges/index.ts` — registered `DualOrbitChallenge`

## Detection Algorithm
Robust angular tracking (per stick, per frame):

1. Read the normalized stick vector from `NormalizedInput` (deadzone already
   applied upstream by `normalizeGamepadInput`).
2. Ignore the stick while its magnitude is below `MIN_MAGNITUDE` (0.35), where
   the angle is unstable.
3. Compute the shortest angular delta with `angleDiff()` so movement **across
   the ±π boundary unwraps** instead of jumping the wrong way.
4. Reject deltas larger than `MAX_FRAME_DELTA` (0.8 rad) as implausible.
5. Accumulate progress **only in the required direction** — left counts
   positive (CW), right counts negative (CCW). Movement against the required
   direction increments a reversal counter (costs smoothness).

Constants:
```
REQUIRED_ROTATIONS = 3
MIN_MAGNITUDE      = 0.35   // stick pushed out enough for a stable angle
MAX_FRAME_DELTA    = 0.8    // radians; rejects implausible jumps
MIN_MOVE           = 0.01   // ignore sub-noise deltas
MAX_REVERSALS      = 20     // smoothness reaches 0 at this many reversals
```

Progress = `min(leftRadians, rightRadians) / (2π)`, so **both** sticks must
rotate; a single-stick spin earns nothing.

## Scoring (0–1,000) — transparent and componentised
| Component | Weight | Basis |
|---|---|---|
| Completion | 400 | `min(1, orbits / 3)` |
| Simultaneity | 250 | fraction of the run where **both** sticks moved correctly |
| Smoothness | 200 | `(1 − reversals / 20) × completion` |
| Speed | 150 | `1 − completionTime / duration` once 3 orbits are reached |

Grades: S ≥ 900, A ≥ 750, B ≥ 600, C ≥ 450, D ≥ 250, F < 250.

Design notes:
- Smoothness is multiplied by completion so doing nothing does **not** award
  free points (caught by unit test).
- Speed only applies after full completion; earlier completion scores higher.

## HUD / Visuals (via `Renderer`)
- Title **DUAL ORBIT** and a colour-coded instruction line (L CW ↻ / R CCW ↺).
- Two orbit rings (cyan = left, magenta = right) with a marker dot showing the
  live stick direction, plus a progress arc per stick.
- Central ring showing accumulated orbits (`x.x / 3`), turning green on
  completion.
- Timer progress bar with remaining seconds; live `SCORE` and `GRADE`.

## Result Screen
Emits `details: { rotations, simultaneousPct, smoothnessPct }`, rendered by the
now-generic result screen (see iteration 7) with labels Rotations /
Simultaneous / Smoothness.

## Tests (`DualOrbitChallenge.test.ts`)
- Accumulates full orbits for correct counter-rotation.
- A completed run scores > 700 and is not grade F.
- Sub-magnitude stick movement is ignored (no orbits).
- Wrong-direction rotation earns no orbits.
- Single-stick rotation earns no orbits (both sticks required).
- No input ⇒ score 0, grade F.

## Verification
- ✅ `npm run build` succeeds
- ✅ `npm run test:run` — 20 tests pass (6 new Dual Orbit tests)
- ✅ `npm run lint` — exit 0
- ✅ Browser (synthetic standard gamepad): Dual Orbit appears in the menu,
  launches, tracks simultaneous counter-rotation, and reports e.g.
  `A / 840 / Rotations 8.2 / Simultaneous 51% / Smoothness 100%`
