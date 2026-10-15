# Iteration 10: Central Timing Config, Testable Game Loop & Lifecycle Tests

## Date: 2026-10-16

## Context
Worked from an external spec ("Improve Game UI, Routing, Game Timing, and Game
Mechanics"). That spec was written for a larger multi-game dashboard app; most
of it does **not** apply to Gamepad Arena. This iteration implements the subset
that genuinely applies and documents the mapping, rather than rewriting working
code or adding net-new features.

### Spec → reality mapping
| Spec section | Status in this app |
|---|---|
| §4 Dashboard/game lifecycle bug ("Complete/Close Game hides dashboard") | **Not present.** `MENU` → `GameLoop.reset()` → `idle`; `App` never unmounts, the canvas container persists. No dashboard to hide. |
| §5 Timing | **Mostly already correct;** this iteration centralizes the values and makes the loop testable (below). |
| §2 UI / modal polish | **Done in iteration 9** (focus-trapped modal, Escape/backdrop/restore, no title text-shadows, no accidental underlying triggers). |
| §6 Game engine (Phaser/Matter/…) | **Not justified** for a single-canvas 2-challenge app; the existing custom fixed-timestep loop is the right tool (spec agrees). |
| §7 Gamepad | Dual-stick, deadzone, clamp, connect/disconnect, loop-synced input **already implemented**. |
| §3 Routing, §8 Collision | **Net-new features** (no router exists; the targets/obstacles game doesn't exist yet). Deferred by agreement — out of scope for a "fix, don't rewrite" pass. |

## Changes

### 1. Central timing configuration (`src/config/timing.ts` — NEW)
- `TIMING.countdownSeconds` (3) and `TIMING.challengeDurations` (`button-blitz`
  10s, `dual-orbit` 15s) in one place, plus a `challengeDuration(id)` helper.
- `GameLoop` now reads the countdown from `TIMING.countdownSeconds` (was a
  hardcoded `3` in three spots). Each challenge's `duration` now comes from
  `TIMING.challengeDurations` instead of an inline literal.
- **No durations changed** — values are identical, just centralized.

### 2. Deterministic, frame-rate-independent stepping (`src/engine/gameLoop.ts`)
- Extracted the accumulator + fixed-update + render into a public
  `step(frameTime)`. `tick()` now computes `frameTime` from `performance.now()`
  and delegates to `step()`.
- `step()` clamps `frameTime` to `[0, 0.25]s`, absorbing negative clocks and
  preventing a spiral-of-death after a tab-blur/long pause.
- This is the single integration point for the render loop **and** tests, so
  gameplay never advances off the raw frame count. Behaviour is unchanged.

### 3. Tests (`src/engine/gameLoop.test.ts` — NEW, `src/utils/input.test.ts` — extended)
Game loop (10 tests), driven deterministically through `step()`:
- `idle → countdown → running → result` happens in order.
- **Game-over (result) fires exactly once**, even when ticking long past the end.
- The update fn runs **only while running**, always with the fixed `dt`.
- **Pause freezes** the timer; resume continues it.
- `reset` returns to `idle` and clears the timer (no updates from idle).
- **Restart** (`startChallenge` again) resets the timer and re-runs the countdown.
- A huge frame delta (e.g. 10-minute tab-blur) is clamped and cannot skip the run.
- `destroy()` removes the `visibilitychange` listener (no leaks).
- A null update fn is ignored; the latest input snapshot reaches the update fn.

Input (3 new tests):
- **Both sticks read simultaneously**, each independent (mirror-image check, no
  cross-talk).
- Deadzone applied to each stick independently.
- A malformed/partial gamepad (mid-disconnect, empty axes) does **not** throw.

## Files
- Created: `src/config/timing.ts`, `src/engine/gameLoop.test.ts`.
- Modified: `src/engine/gameLoop.ts` (TIMING + `step()` seam), challenge
  `duration`s (`button-blitz`, `dual-orbit`), `src/utils/input.test.ts`.

## Deliberately NOT done (would be net-new / rewrites)
- React Router and `/play`, `/results` routes — the state-machine navigation
  works; adding routing restructures the working shell.
- A collision-based puzzle challenge and physics library — the game it targets
  doesn't exist yet.
- App-component render tests — would need a jsdom canvas-context stub; the pure
  loop/input logic (where the real risk is) is covered instead.

## Verification
- ✅ `npm run build` — succeeds.
- ✅ `npm run test:run` — **33/33 pass** (13 new: 10 game loop, 3 input).
- ✅ `npm run lint` — exit 0 (`--max-warnings 0`).
