# Iteration 11: Dual Stick Rush (Twin Target)

## Date: 2026-10-15

## Summary
Implemented **Dual Stick Rush** — a fast-paced dual-analog puzzle game where
players control two cursors (cyan left, purple right) with both analog sticks to
reach targets before the round timer expires. 60-second sessions with scoring,
streaks, and personal bests.

## Game Concept (from `dualstick-rush-game-idea.md`)
- **Genre:** Arcade puzzle / reflex / coordination
- **Core input:** Both analog sticks simultaneously
- **Session length:** ~60 seconds
- **First mode:** Twin Target (move both cursors to their targets)
- **Puzzle mechanics to add later:** symbol matching, paired switches, mirror
  rule, ordered routes, gates/hazards, sequence puzzles

## Files Created
- `src/challenges/twin-target/TwinTargetChallenge.ts` — full challenge
  implementation (movement, scoring, HUD, round management)
- `src/challenges/twin-target/TwinTargetChallenge.test.ts` — 5 unit tests

## Files Modified
- `src/challenges/index.ts` — registered `TwinTargetChallenge`

## Gameplay Mechanics
- **Two play zones:** left (cyan) and right (purple), each with a cursor and target
- **Movement:** stick direction controls cursor direction; speed scales with stick tilt
- **Deadzone:** 0.15 applied to both sticks (configurable via settings)
- **Zone bounds:** cursors stay within their half of the screen
- **Round timer:** 4 seconds per round
- **Session timer:** 60 seconds total
- **Completion:** both cursors must reach their targets within the round timer

## Scoring
| Component | Formula |
|---|---|
| Base | 100 points per completed round |
| Speed bonus | Up to 50 per round (faster = more points) |
| Clean bonus | 25 points per round with no mistakes |
| Streak multiplier | `1 + min(bestStreak * 0.1, 2)` |

Grades: S ≥ 5000, A ≥ 3500, B ≥ 2500, C ≥ 1500, D ≥ 800, F < 800.

## HUD (via `Renderer`)
- Dark navy background (`#0B1020`) with two outlined play zones (`#121C2C`)
- Cyan cursor (`#28D7E5`) controlled by left stick
- Purple cursor (`#B46BFF`) controlled by right stick
- Circular targets with color-coded outlines
- Session timer (top center)
- Round timer (below session)
- Score + streak (bottom center)

## Result Screen
Emits `details: { completed, clean, bestStreak, avgTime, accuracy }`, rendered by
the generic result screen (see iteration 7) with labels: Completed / Clean /
Best Streak / Avg Time / Accuracy.

## Tests (`TwinTargetChallenge.test.ts`)
- Initializes state correctly (sessionTime=0, streak=0, score=0)
- Moves cursors based on stick input (when renderer exists)
- Tracks streak and best streak
- Resets all state
- Calculates grade based on score

## Verification
- ✅ `npm run build` succeeds
- ✅ `npm run test:run` — 35 tests pass (5 new)
- ✅ `npm run lint` — exit 0
- ✅ Challenge registered in menu alongside Button Blitz and Dual Orbit

## Design Notes
- Movement is direct and predictable (no heavy inertia) — feels responsive under
  pressure
- Targets are randomly placed within each zone, ensuring solvability
- Round timeout forces action if cursors don't reach targets in time
- Streak multiplier rewards consecutive clean solves

## Future Extensions (from game idea)
- Symbol matching (distractor targets)
- Paired switches (both cursors on switches simultaneously)
- Mirror rule (cursors move in mirrored directions)
- Ordered routes (touch nodes in sequence)
- Gates and hazards
- Practice mode (no timer)
