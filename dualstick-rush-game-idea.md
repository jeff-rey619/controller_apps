# DualStick Rush — Fast-Paced Dual-Analog Puzzle Game

> **Working title:** DualStick Rush  
> **Genre:** Arcade puzzle / reflex / coordination  
> **Platform:** Browser game using a gamepad  
> **Core input:** Both analog sticks, simultaneously  
> **Session length:** About 60 seconds  
> **Status:** Concept and MVP plan

## 1. The idea

**Control two independent cursors with the two analog sticks and solve short spatial puzzles before the timer runs out.**

The left stick controls a cyan cursor; the right stick controls a purple cursor. Each round presents two goals, a rule, or a small obstacle puzzle. Players must understand the board quickly, coordinate both thumbs, and complete the task under pressure.

The intended feeling is: *“I know what I need to do—can I coordinate both hands quickly enough?”*

This should feel like a real arcade puzzle, not a controller diagnostic tool.

## 2. Core gameplay loop

1. Show a compact puzzle with two cursors and clear goals.
2. Give the player a brief preview, around 1 second.
3. Start a short timer.
4. Move both cursors with the analog sticks.
5. Complete the puzzle for points and a streak.
6. Immediately show the next puzzle, gradually increasing difficulty.
7. End the run after 60 seconds and show the score, accuracy, and best streak.

Each puzzle should take roughly 2–5 seconds. Keep downtime and reading to a minimum.

## 3. First mode: Twin Target

### Objective
Move the left cursor to its target and the right cursor to its target. Both must reach their goals before the round timer expires.

### Board
- Two distinct play zones, left and right.
- Cyan cursor and target on the left.
- Purple cursor and target on the right.
- The left stick controls only the left cursor; the right stick controls only the right cursor.
- The player may move one cursor first or both at the same time.
- Once both targets are reached, the next pair appears.

### Example
The left target appears in the upper-right of its zone. The right target appears in the lower-left of its zone. The player has 3–4 seconds to reach both.

### Why start here?
It proves that controlling two cursors feels responsive and satisfying, and it is easy to prototype. However, it is only the foundation. Additional rules make the experience a puzzle rather than merely a reflex test.

## 4. Puzzle mechanics to add over time

Introduce one mechanic at a time, after the basic mode feels good.

### A. Match symbols
Each cursor must reach a target with the correct symbol. Distractor targets force quick recognition.

### B. Paired switches
A door opens only when both cursors stand on their switches at the same time. The player must coordinate both positions and timing.

### C. Mirror rule
The two cursors must move in mirrored directions—for example, left cursor up while right cursor moves down. Show the rule with a clear icon.

### D. Ordered route
Touch two or three nodes in the displayed order. The player may need to set up one cursor while moving the other.

### E. Gates and hazards
A switch on one side opens a route on the other. Hazards cross lanes; touching one costs time or a life. Keep the board uncluttered.

### F. Sequence puzzle
Show a short visual sequence, such as left cursor to blue node, right cursor to yellow node, then both to the centre. The player must execute the sequence before time expires.

**Design rule:** Never introduce several unfamiliar mechanics in the same round. The puzzle must be readable at a glance.

## 5. Fast-paced session design

| Element | Initial target |
|---|---:|
| Preview | 1 second |
| Easy round | 4 seconds |
| Medium round | 3 seconds |
| Hard round | 2–2.5 seconds |
| Transition | 0.2–0.4 seconds |
| Run duration | 60 seconds |

These are initial values for playtesting, not final balance.

### Difficulty ramp
- **Warm-up:** large targets, no hazards, generous time.
- **Coordination:** targets appear in opposite corners.
- **Recognition:** matching symbols and distractors.
- **Planning:** switches, gates, and ordered routes.
- **Pressure:** shorter timers and occasional rule changes.

Increase one difficulty dimension at a time. Do not make the game difficult only by making everything faster.

## 6. Scoring

Keep the scoring understandable.

### Example per-round score
- 100 points for completion.
- Up to 50 speed-bonus points.
- 25 clean-solve bonus points for avoiding hazards and wrong targets.
- A streak multiplier for consecutive clean solves.
- A small penalty or time loss for mistakes.

Example: `(100 completion + 35 speed + 25 clean) × 1.5 streak multiplier = 240 points`.

This is an illustrative formula to test and tune. The game should explain why points were gained or lost.

### End-of-run result
Display:
- Total score.
- Puzzles completed.
- Longest clean streak.
- Average solve time.
- Accuracy.
- Personal best.
- Retry button.

Save personal bests locally for the first version. Add global leaderboards later.

## 7. Controls and movement

| Input | Action |
|---|---|
| Left analog stick | Move cyan / left cursor |
| Right analog stick | Move purple / right cursor |
| A / primary button | Start or confirm, if needed |
| B / secondary button | Pause or back, if needed |

The main gameplay should be possible using just the two sticks.

### Movement feel
- Stick direction controls cursor direction.
- Cursor speed scales with stick tilt.
- A small dead zone prevents drift.
- Releasing the stick stops movement promptly.
- Use consistent acceleration and speed limits.
- Keep each cursor inside its play zone.

Start with direct, predictable movement rather than heavy inertia. The player should feel in control, especially when the timer is short.

## 8. Visual direction

Use a minimal arcade style: deep navy backgrounds, clean outlines, geometric targets, and a small number of accent colours.

Suggested palette:
- Background: `#0B1020`
- Panels: `#121C2C`
- Left cursor: cyan `#28D7E5`
- Right cursor: purple `#B46BFF`
- Success: mint `#35D7A0`
- Warning: gold `#F6C453`
- Danger: coral `#FF5C7A`
- Main text: `#E8F1FF`
- Secondary text: `#8CA4C2`

Use two clearly separated play zones, simple path lines, circular cursors, readable targets, short success flashes, and subtle countdown pulses. Avoid excessive glow, clutter, and long instructions.

### Accessibility
- Never communicate only through colour; pair colours with symbols or shapes.
- Provide sound controls and a reduced-motion option.
- Include a no-timer practice mode.
- Keep menus keyboard-accessible and text readable.

## 9. MVP specification

The first release should prove that dual-stick coordination is fun.

### Must have
- Browser game using the Gamepad API.
- Controller connection/disconnection handling.
- Two play zones and independently controlled cursors.
- Twin Target mode.
- Random but solvable target placement.
- A 60-second run with round timers.
- Score, streak, result screen, and retry.
- Locally saved personal best.
- Basic tests for movement and scoring.

### Nice to have
- Short tutorial.
- Practice mode.
- Sound effects and simple animations.
- Difficulty settings.
- Controller status indicator.
- Pause/restart support.

### Explicitly out of scope for MVP
- Online multiplayer.
- Global leaderboard.
- Accounts.
- User-created puzzles.
- Complex physics.
- Monetization.

Do not build a backend before validating the core game loop.

## 10. Recommended technical stack

- **React + TypeScript + Vite:** app structure and UI.
- **Canvas 2D:** board, cursors, paths, obstacles, and animations.
- **Browser Gamepad API:** controller input.
- **CSS:** menus and responsive layout.
- **Vitest:** tests for movement, puzzle generation, and scoring.
- **localStorage:** personal best and preferences.

Keep game logic separate from rendering: the puzzle engine decides whether a puzzle is solved; the renderer draws the current state.

Suggested starting structure:

```text
src/
  gamepad/
    readGamepad.ts
    normalizeAxes.ts
  game/
    gameState.ts
    gameLoop.ts
    movement.ts
    scoring.ts
    puzzleGenerator.ts
  modes/
    twinTarget.ts
  components/
    ControllerStatus.tsx
    GameCanvas.tsx
    ScorePanel.tsx
    ResultsScreen.tsx
  persistence/
    records.ts
  tests/
    movement.test.ts
    scoring.test.ts
    puzzleGenerator.test.ts
```

Treat this as a starting point, not a requirement to create every file upfront.

## 11. Puzzle generation rules

Random puzzles must never feel impossible.

1. Choose targets from known reachable positions.
2. Ensure both targets can be reached within the time limit.
3. Avoid unfair placements near boundaries or hazards.
4. Vary target pairs to avoid repetition.
5. Increase difficulty based on round count or successful streak.
6. Use seeded randomness in tests so a puzzle can be reproduced.

For advanced modes, represent puzzles as structured data: starting positions, goals, obstacles, required order, time limit, and active rules. Validate a generated puzzle before displaying it.

## 12. Browser and controller details

Use the browser **Gamepad API** to read axes. Normalize stick values and use a configurable dead zone. Do not assume every controller uses identical axis indices or trigger/button mappings.

Handle:
- Controller connected before or after page load.
- Disconnection during a run.
- Reconnection.
- Browser tab losing and regaining focus.
- Stick drift and input noise.
- Different standard gamepad mappings.

Use a monotonic clock such as `performance.now()` for elapsed time and an animation loop for responsive rendering. Test on the target browsers and controllers rather than assuming all devices behave identically.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API

## 13. Development roadmap

### Phase 0 — Input prototype
- Detect the controller.
- Move two on-screen dots independently.
- Tune dead zones and speed.
- Confirm that both cursors feel responsive.

**Exit condition:** simultaneous two-stick control feels reliable and fun.

### Phase 1 — First playable build
- Implement Twin Target.
- Add countdown, round timer, score, and streak.
- Add result and retry screens.
- Save personal best locally.
- Test edge cases and ensure targets are solvable.

**Exit condition:** a new player can understand and replay a full run without help.

### Phase 2 — Make it a real puzzle game
- Add symbol matching.
- Add paired switches and gates.
- Add ordered routes and mirror rules.
- Introduce practice mode and gradual difficulty.

**Exit condition:** players make meaningful decisions, not just chase dots.

### Phase 3 — Replayability
- Add daily seeded puzzles.
- Add achievements and challenge variants.
- Add shareable result summaries.

**Exit condition:** players have a reason to return and improve.

### Phase 4 — Competition
- Add online score submission and server validation.
- Add daily/weekly leaderboards.
- Add friend challenges.
- Consider live duels only after asynchronous competition works.

**Exit condition:** scores use consistent rules and suspicious submissions can be handled.

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Feels like a test instead of a game | Add meaningful rules, streaks, satisfying feedback, and varied puzzles |
| Too difficult for beginners | Start with large targets, a short tutorial, and practice mode |
| Fast rounds become confusing | Introduce one mechanic at a time and maintain visual clarity |
| Random puzzles are unfair | Validate reachability and timing before showing them |
| Stick drift moves cursors | Use dead zones and optional calibration |
| Different controllers affect results | Normalize input and test representative devices |
| Scope grows too large | Ship one strong mode before adding online features |

## 15. First build: exact scope

Build only these features:

1. Dark arcade screen with two outlined play zones.
2. Cyan cursor controlled by the left stick.
3. Purple cursor controlled by the right stick.
4. One target in each zone.
5. Both cursors must touch their targets to clear a round.
6. A four-second round timer.
7. Each successful round awards points and spawns a valid target pair.
8. A 60-second session ends with score and best streak.
9. The player can immediately retry.
10. Personal best is saved locally.

After this feels good, add the first real puzzle modifier: **paired switches that must be activated within a short time window**.

## 16. Playtest questions

Ask players to try it without coaching:
- Did you understand what each stick controls?
- Could you identify both targets quickly?
- Did the timer feel exciting or unfair?
- Did moving both sticks at once feel satisfying?
- Did you want to retry?
- Did later rounds require thought, or only faster movement?

If players say it feels like “two cursors chasing dots,” prioritize paired switches, route order, and mirror rules before adding visual effects.

## Final recommendation

Start with **Twin Target** as the foundation, not the entire game. The long-term hook is the interaction between both hands: one stick can set up a move while the other completes it, or both can be required to solve a rule-based puzzle at the same time.

**The key test:** Can a player understand a puzzle in one second, feel clever when solving it, and immediately want another round?

If yes, expand the puzzle mechanics, then add competitive scoring.
