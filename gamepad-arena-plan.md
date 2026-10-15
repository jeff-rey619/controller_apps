# Gamepad Arena — Product Plan

> **Working title:** Gamepad Arena  
> **Document type:** Product vision, MVP specification, technical plan, and phased roadmap  
> **Status:** Concept / pre-MVP  
> **Primary platform:** Browser  
> **Initial audience:** Gamepad owners who enjoy skill challenges, score chasing, and friendly competition

---

## 1. Executive Summary

Gamepad Arena is a browser-based arcade game where the controller itself is the gameplay.

Instead of testing whether a controller works, players perform deliberate input challenges: rotating both analog sticks in different directions, rapidly pressing a button, guiding a stick through precision targets, coordinating triggers and buttons, and completing timed input sequences.

Each challenge has clear rules, a scoring system, and a result screen. Players can chase personal bests, replay challenges, compare scores, and eventually compete in daily events or live duels.

The browser is a practical starting point because modern browsers expose controller state through the **Gamepad API**. A web MVP can be built without a game engine, accounts, or a backend. Competitive features can be added after the core gameplay proves fun.

### Product thesis

**Make mastering a gamepad feel like playing an arcade game.**

The product should feel playful and competitive, not like a hardware diagnostic utility.

### Core loop

1. Connect a controller.
2. Choose a challenge.
3. Learn the trick and its rules.
4. Perform the trick before time runs out.
5. Receive a score, accuracy feedback, and a medal or grade.
6. Save the result and try again—or compare with other players.

---

## 2. Product Vision and Principles

### Vision

Create a platform where gamepad skills are fun to practise, easy to measure, and exciting to compete over.

### Product principles

- **Game first, tester second:** inputs should drive playful mechanics, not just diagnostic graphs.
- **Clear rules:** players should know exactly what counts as success.
- **Skill over randomness:** rewards should come from speed, accuracy, coordination, timing, and consistency.
- **Replayability:** challenges should encourage “one more attempt.”
- **Accessible entry:** players should be able to start in a browser without installing software or creating an account.
- **Controller-agnostic:** support common standard gamepads, while clearly communicating device/browser differences.
- **Fair competition:** competitive challenges need consistent rules, timing, input normalization, and reasonable anti-cheat protections.
- **Incremental scope:** prove one fun challenge before building accounts, multiplayer, or a large content library.

---

## 3. Target Audience and Positioning

### Primary audiences

1. **Arcade score chasers** — people who enjoy improving personal bests and chasing leaderboard ranks.
2. **Gamepad enthusiasts** — people curious about analog control, rapid inputs, and coordination.
3. **Casual competitors** — friends who want short, shareable challenges.
4. **Gamers looking for practice** — players who want better stick precision or input coordination, without promising direct improvement in every game.

### Positioning

Gamepad Arena is **not** primarily:
- A controller tester or hardware diagnostics page.
- A conventional console game.
- A guarantee of better performance in a particular commercial game.
- A Nintendo feature or a Nintendo product.

It is a standalone game concept built around controller inputs as the central mechanic.

### Initial platform decision

Start with a responsive browser app for desktop/laptop browsers and USB or Bluetooth controllers. Prioritize a common Xbox-style controller mapping first, then test other standard gamepads.

Mobile browser support can be evaluated later because controller pairing, browser behavior, and screen layout vary by device.

---

## 4. Core Gameplay Pillars

### A. Speed

How quickly can the player perform a valid action?
- Rapid button presses.
- Fast target sequences.
- Quick transitions between directions.

### B. Precision

How accurately can the player hit a target or follow a path?
- Stick-controlled cursor movement.
- Target tracking.
- Avoiding overshoot.

### C. Coordination

Can the player control multiple inputs at once?
- Two sticks moving in opposite directions.
- Stick movement while pressing a face button.
- Stick + trigger combinations.

### D. Rhythm and consistency

Can the player follow a timing pattern repeatedly?
- Timed button sequences.
- Repeated input windows.
- Maintaining a smooth circular path.

### E. Adaptability

Can the player react to changing instructions?
- Direction changes.
- Randomized sequences.
- Unexpected target positions.

---

## 5. Challenge Catalogue

The following are proposed game modes, not claims that these exact combined experiences already exist in an established product.

### 5.1 Dual Orbit

**Goal:** Rotate the left stick clockwise and the right stick counterclockwise simultaneously.

Possible rules:
- Complete three full rotations within five seconds.
- Both sticks must move continuously enough to count.
- A rotation counts only after the stick has completed a full angular cycle in the required direction.
- Both rotations must overlap for a minimum duration.
- Points depend on completion, smoothness, timing, and directional correctness.

Design note: analog stick values are noisy and may not reach their physical extremes. Use normalized values, a configurable dead zone, and robust angle-unwrapping. Avoid awarding a rotation simply because the stick jitters around a boundary.

### 5.2 Button Blitz

**Goal:** Press a specified button as many times as possible within a time window.

Possible rules:
- Press A for 10 seconds.
- Count distinct transitions from released to pressed.
- Show presses per second and total valid presses.
- Add optional alternating-button variants, such as A/B/A/B.

Fairness note: browser polling cannot guarantee detection of every very short physical press. The game should explain this limitation, use requestAnimationFrame or an appropriate polling loop, and test across browsers and controllers. Avoid advertising millisecond-perfect measurement.

### 5.3 Precision Run

**Goal:** Use an analog stick to guide a cursor through targets or a path.

Scoring:
- Targets reached.
- Time taken.
- Distance from the intended path.
- Overshoot penalties, if used.
- Completion bonus.

### 5.4 Combo Master

**Goal:** Perform a prescribed sequence before the timer expires.

Example:
1. Move left stick up.
2. Press A.
3. Pull RT beyond a threshold.
4. Rotate the right stick.
5. Return the left stick to center.

Scoring should reward correct order, timing, and completion. The game should make the sequence visible and provide accessible visual cues.

### 5.5 Mirror Madness

**Goal:** Move both sticks in a required relationship, then switch when prompted.

Variations:
- Both sticks in the same direction.
- Opposite directions.
- One clockwise, one counterclockwise.
- Mirror one stick's movement with the other.

### 5.6 Trigger Control

**Goal:** Hold LT or RT near a target pressure, or pass through a sequence of pressure zones.

Use the analog trigger value where supported. Some controllers expose triggers differently; calibrate and normalize the available representation.

### 5.7 Rhythm Combo

**Goal:** Press inputs in time with a beat or timing window.

Scoring:
- Perfect / good / late / missed.
- Combo multiplier.
- Timing consistency.
- Difficulty progression.

### 5.8 Future challenge types

- Randomized input sequences.
- Moving-target tracking.
- Alternating left/right hand tasks.
- Hold one input while pulsing another.
- Direction-memory sequences.
- Cooperative challenges.
- User-created challenges, after a safe and validated challenge-definition system exists.

---

## 6. Challenge Definition System

Challenges should be data-driven rather than implemented as unrelated one-off screens. This makes it easier to create variations and add content.

A challenge definition may contain:
- Stable ID and version.
- Name, description, and instructions.
- Supported controller inputs.
- Duration and start countdown.
- Input rules and thresholds.
- Completion conditions.
- Scoring configuration.
- Difficulty and category.
- Accessibility options.
- Rules version or scoring version.
- Whether the challenge is eligible for competitive leaderboards.

Illustrative TypeScript shape (conceptual; implementation may differ):

```ts
type ChallengeDefinition = {
  id: string;
  version: number;
  title: string;
  instructions: string;
  durationMs: number;
  category: "speed" | "precision" | "coordination" | "rhythm";
  rules: Record<string, unknown>;
  scoringVersion: string;
};
```

Do not execute arbitrary JavaScript from challenge definitions. Use a constrained schema of known rule types and validate definitions before use.

### Challenge engine responsibilities

1. Receive normalized controller state.
2. Track time and challenge lifecycle.
3. Detect the required input pattern.
4. Emit progress and feedback events.
5. Calculate a score using a versioned scoring function.
6. Return a result summary.
7. Make results reproducible enough for comparison.

---

## 7. Scoring and Progression

### Score dimensions

Depending on the challenge, score can combine:
- **Completion:** did the player finish?
- **Speed:** how quickly was it completed?
- **Accuracy:** how closely did the player follow the target?
- **Consistency:** did the player maintain the required movement?
- **Combo:** how many correct actions occurred consecutively?
- **Penalty:** missed inputs or rule violations.

Do not use one universal formula for every challenge. Each challenge should have a clear, documented scoring function and a visible maximum or understandable score range.

### Example: Dual Orbit score

A possible 1,000-point scoring model:
- 400 points: complete all required rotations.
- 250 points: satisfy simultaneous-motion requirement.
- 200 points: smoothness / direction consistency.
- 150 points: completion speed.

This is an initial balancing example, not a final formula. Test it with real players and different controllers.

### Progression

- Bronze / Silver / Gold medals.
- Personal bests.
- Challenge streaks.
- Skill tiers.
- Unlockable cosmetic themes or badges.
- Daily challenge.
- Weekly tournament.

Avoid progression systems that reward endless grinding over skill. Consider normalizing scores where hardware differences could otherwise dominate.

### Result screen

Show:
- Final score and grade.
- Completion time.
- Accuracy or consistency metric.
- Key errors or missed steps.
- Personal best comparison.
- Retry button.
- Shareable result summary.
- Leaderboard position, when online leaderboards exist.

---

## 8. Competitive Modes

Build competition in stages.

### Stage 1: Local records

- Save personal bests locally.
- Track attempts and recent results.
- Work without sign-in or network access after the page loads.
- Let players reset their own data.

### Stage 2: Daily / weekly challenge

- Everyone gets the same challenge definition and scoring version.
- Use a defined time window and reset schedule.
- Display global and friends leaderboards if a backend is available.
- Show the challenge rules and version alongside the score.

### Stage 3: Asynchronous competition

Players submit results independently. The server stores submissions and ranks scores.

Recommended submission fields:
- User ID or anonymous player ID.
- Challenge ID and rules version.
- Score and component metrics.
- Completion time.
- Client version.
- Submission timestamp.
- Optional compact input summary for validation, where useful and privacy-appropriate.

Do not trust the client score blindly. Recalculate scores server-side from validated event summaries where possible. Raw input traces may help review suspicious results but increase storage and privacy considerations.

### Stage 4: Live duels

Two players attempt the same challenge under matched rules.

Possible formats:
- Highest score wins.
- First valid completion wins.
- Best of three.
- Alternating turns.

Live play requires networking, session management, synchronization, disconnect handling, and stronger anti-cheat work. Do not make it part of the initial MVP.

### Competitive fairness and anti-cheat

A browser client can be modified, so perfect anti-cheat is not realistic. Start with:
- Server-side validation of challenge IDs and scoring versions.
- Plausibility limits on input rates and completion times.
- Duplicate submission protection.
- Rate limiting.
- Server timestamps for submission windows.
- Clear rules for invalid or suspicious runs.
- Review tools for leaderboard moderation.

For serious competition, consider replayable input summaries, deterministic scoring, and stronger validation. Do not claim that client-side checks make cheating impossible.

---

## 9. Browser and Controller Technical Notes

### Gamepad API

Use the browser's Gamepad API:
- `navigator.getGamepads()` reads connected gamepad state.
- `gamepad.axes` exposes analog axes.
- `gamepad.buttons` exposes button state and, where supported, analog values.
- `gamepad.connected`, `id`, and `mapping` help identify the device.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API

### Connection flow

1. Ask the player to connect the controller.
2. Provide a “Detect controller” prompt.
3. Listen for `gamepadconnected` and `gamepaddisconnected`.
4. Poll current input state during gameplay.
5. Show a controller diagram and live input feedback in setup/calibration, separate from the actual game.
6. Handle disconnection, tab visibility changes, and reconnecting safely.

Browsers may only expose a gamepad after the user has interacted with the page. Secure contexts such as HTTPS and localhost are the expected deployment environments for modern web APIs.

### Input normalization

Controllers vary in:
- Axis range and center drift.
- Dead zones.
- Stick response curves.
- Trigger representation.
- Button layout and mapping.
- Polling behavior and latency.

Implement:
- A configurable dead zone.
- Axis clamping and normalization.
- Optional calibration.
- A normalized internal input format.
- Clear handling for standard and non-standard mappings.
- Device/browser compatibility testing.

Do not assume every controller uses exactly the same axis index or trigger representation. The browser's standard mapping is helpful but not universal.

### Timing and polling

- Use `requestAnimationFrame` for visual/gameplay loops where appropriate.
- Use a monotonic clock such as `performance.now()` for elapsed durations.
- Do not base scoring on wall-clock time.
- Detect button rising edges (released → pressed) for press-count challenges.
- Document that browser polling can miss extremely short presses.
- Test at different refresh rates and with different controllers.
- Separate input sampling from rendering/scoring where needed to improve consistency.

### Accessibility and usability

- Keyboard navigation for menus.
- Clear visual countdowns and progress cues.
- Color should not be the only way to communicate success/failure.
- Adjustable input thresholds where competitive integrity allows.
- Practice mode with no time pressure.
- Reduced-motion option.
- Audio cues with mute control.
- Avoid requiring simultaneous complex inputs in the first tutorial.
- Provide understandable errors when a controller cannot be detected.

---

## 10. Recommended MVP Stack

### Frontend

- **React + TypeScript** for UI and application structure.
- **Vite** for development/build tooling.
- **Canvas 2D** for animated challenge scenes; use ordinary React elements for menus, cards, settings, and results.
- **Gamepad API** for input.
- **CSS** for a responsive arcade visual style.
- **Vitest** for unit tests of input and scoring logic.
- **Playwright** for browser/UI flows where appropriate.

This stack is a practical starting point, not the only valid one. A game engine is unnecessary for the first few 2D challenges.

### Persistence

MVP:
- `localStorage` for simple preferences and personal-best summaries, or IndexedDB if structured result history grows.
- Version stored records so future changes can migrate or reset data safely.

Online phase:
- A backend API.
- PostgreSQL for accounts, challenge definitions, submissions, and leaderboard queries.
- Authentication only when online features require it.
- Server-side scoring/validation for submitted results.

Keep the first version backend-free unless online competition is essential to validating the concept.

### Suggested frontend modules

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    ControllerConnection.tsx
    ChallengeCard.tsx
    Countdown.tsx
    ScorePanel.tsx
    ResultScreen.tsx
  gamepad/
    pollGamepad.ts
    normalizeInput.ts
    calibration.ts
    types.ts
  challenges/
    registry.ts
    dualOrbit/
      definition.ts
      engine.ts
      scoring.ts
    buttonBlitz/
      definition.ts
      engine.ts
      scoring.ts
    precisionRun/
      definition.ts
      engine.ts
      scoring.ts
  persistence/
    records.ts
    preferences.ts
  pages/
    HomePage.tsx
    ChallengePage.tsx
    ResultsPage.tsx
    LeaderboardPage.tsx
  styles/
  tests/
```

This is a suggested structure, not a required final folder layout. Avoid creating every file before the first challenge works.

---

## 11. MVP Scope

### Must have

- Browser app that detects a connected standard gamepad.
- Controller connection status and reconnect handling.
- One complete challenge: **Dual Orbit** or **Button Blitz**.
- A clear tutorial/instructions screen.
- Countdown, active gameplay, timer, progress, and result screen.
- A defensible score calculation.
- Local personal bests.
- Retry flow.
- Keyboard/mouse fallback for menus.
- Responsive, polished UI.
- Basic unit tests for input normalization and scoring.

### Should have

- Three launch challenges: Dual Orbit, Button Blitz, and Precision Run.
- Challenge selection screen.
- Personal-best history.
- Calibration/dead-zone settings.
- Medals or grades.
- A practice mode.
- Clear controller compatibility guidance.

### Could have later

- Accounts and cloud saves.
- Daily challenges.
- Global/friends leaderboards.
- Shareable results.
- Achievements.
- Community challenge creation.
- Live duels.
- Cosmetic unlocks.
- Mobile support.
- Native desktop wrapper.

### Explicitly out of scope for MVP

- Real-time multiplayer.
- A large backend.
- Complex 3D graphics.
- Payments or monetization.
- User-uploaded executable challenge logic.
- Claims of tournament-grade anti-cheat.
- Guaranteed compatibility with every controller/browser.

---

## 12. Development Roadmap

### Phase 0 — Validate the concept

**Goal:** Confirm that reading controller input in the target browsers works and that one challenge is fun.

Tasks:
- Create a minimal Vite + React + TypeScript app.
- Add a controller connection prompt.
- Display live axis and button values in a temporary developer view.
- Test with an Xbox-style controller via USB and Bluetooth if available.
- Implement a basic playable Dual Orbit prototype.
- Ask a few people to try it and observe whether the rules are understandable.

**Exit criteria:**
- Controller input is consistently detected in target browsers.
- Stick direction and button transitions are normalized correctly enough for the chosen challenge.
- Players understand the objective without developer help.
- The challenge invites replay.

### Phase 1 — Playable MVP

Tasks:
- Build a polished home/challenge-selection screen.
- Implement the challenge lifecycle: ready → countdown → active → complete/failed.
- Add score and feedback.
- Add results screen and retry.
- Save personal bests locally.
- Add error, disconnect, and unsupported-controller states.
- Test scoring and timing logic.

**Exit criteria:**
- A new player can connect, play, understand the result, and retry without instructions from the developer.
- Results are stable across repeated runs on the same setup.
- No critical input or navigation bugs remain.

### Phase 2 — Content and replayability

Tasks:
- Add Button Blitz and Precision Run.
- Add medals, personal records, practice mode, and difficulty variants.
- Add accessibility and calibration options.
- Improve onboarding and controller compatibility messaging.
- Measure which challenges are replayed most often.

**Exit criteria:**
- Multiple challenge types feel meaningfully different.
- Players have a reason to return and improve their score.

### Phase 3 — Online competition

Tasks:
- Choose a backend and database.
- Add anonymous or registered profiles.
- Add server-defined challenge versions.
- Add result submission and server-side validation.
- Add daily/weekly challenges and leaderboard pages.
- Add rate limiting, moderation, and privacy controls.

**Exit criteria:**
- Scores are consistently calculated and ranked under the same rules.
- Invalid submissions can be rejected.
- Players understand what data is stored.

### Phase 4 — Live competition and community

Tasks:
- Implement matchmaking or invite links.
- Synchronize duel start and challenge configuration.
- Handle disconnects and incomplete attempts.
- Add friend challenges and tournament formats.
- Consider user-created challenges using a strict declarative schema.
- Add replay/verification tools if necessary.

**Exit criteria:**
- Live sessions remain understandable and fair under ordinary network issues.
- Moderation and abuse controls are ready before community-generated content expands.

---

## 13. User Experience Flow

1. **Home:** “Connect a controller and enter the arena.”
2. **Connection:** controller detected; show name/mapping where available.
3. **Challenge selection:** cards show objective, difficulty, and personal best.
4. **Briefing:** demonstrate the trick and state the rules clearly.
5. **Countdown:** give the player time to prepare.
6. **Gameplay:** show only useful HUD elements—timer, progress, score/combo, and current instruction.
7. **Result:** score, grade, performance breakdown, personal best, retry, and next challenge.
8. **Competition:** leaderboard or share action when supported.

The UI should feel like an arcade, with high-contrast feedback and polished motion, but should avoid visual effects that obscure input instructions.

---

## 14. Challenge Scoring Design Guidelines

Scoring must be designed alongside the mechanic, not added as an afterthought.

For every challenge, document:
- What counts as a valid input.
- How a successful action is detected.
- Which mistakes reset progress or incur penalties.
- How time is measured.
- How score is calculated.
- How hardware variance affects results.
- Whether scores are comparable across different devices.
- How a run can be invalidated.
- Which values are shown to the player.

### Example: Button Blitz

- Start after a countdown.
- Count only released-to-pressed transitions for the chosen button.
- Ignore a button that remains held.
- End at the defined duration.
- Report total presses and average presses per second.
- Avoid overprecision in timing claims.
- If polling misses short taps on some setups, disclose that and test the minimum practical input duration.

### Example: Dual Orbit

A robust implementation should track stick angle over time and accumulate angular movement rather than counting every crossing of a fixed line. It should:
- Apply a dead zone to avoid center noise.
- Ignore movement too close to the center, where angle is unstable.
- Unwrap angle changes across the -π / +π boundary.
- Confirm rotation direction.
- Reject abrupt jumps that would imply implausible angular speed.
- Track each stick independently and measure their overlap.
- Tune thresholds through tests on real hardware.

---

## 15. Data Model Sketch

For a local-only MVP, keep data simple.

### Challenge record

```ts
type ChallengeRecord = {
  challengeId: string;
  rulesVersion: number;
  bestScore: number;
  bestTimeMs?: number;
  attempts: number;
  lastPlayedAt: string;
};
```

### Attempt result

```ts
type AttemptResult = {
  challengeId: string;
  rulesVersion: number;
  score: number;
  durationMs: number;
  completed: boolean;
  metrics: Record<string, number>;
  createdAt: string;
};
```

### Later online entities

- `users`
- `challenge_definitions`
- `challenge_versions`
- `attempt_submissions`
- `leaderboard_entries` (or a query/view derived from submissions)
- `daily_events`
- `duel_sessions`

Online data models should be designed only when the online feature scope is clear. Store only what the product needs, and provide a way to delete user data.

---

## 16. Testing Strategy

### Input tests

- Controller connected before page load.
- Controller connected after page load.
- Controller disconnected during play.
- Controller reconnects.
- Stick center drift.
- Stick movement into all quadrants.
- Stick circular movement in both directions.
- Simultaneous movement of both sticks.
- Button held down.
- Rapid button press/release.
- Trigger partial and full press.
- Different controller mappings.
- Browser tab loses focus and returns.

### Scoring tests

- Exact successful completion.
- Timeout.
- Wrong direction.
- Incomplete rotation.
- Stick inside dead zone.
- Input at a threshold boundary.
- Repeated event or duplicate submission.
- Challenge rules version changes.
- Score maximum and minimum bounds.

### Browser/device tests

Test a representative set of supported desktop browsers and controller connection types. Do not assume that one successful browser/controller combination proves universal compatibility.

### Manual playtests

Observe:
- Does the player understand the trick?
- Does the game detect the expected movement?
- Does the score feel fair?
- Does the player want another attempt?
- Is failure understandable rather than frustrating?
- Can the challenge be completed by a beginner, and can skilled players improve?

---

## 17. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Browser polling misses very fast taps | Button speed scores may be inconsistent | Test polling behavior, use sensible rules, avoid false precision, communicate limitations |
| Different controllers report input differently | Scores may not be comparable | Normalize input, support calibration, test multiple devices, version scoring rules |
| Analog noise and drift | False rotations or inaccurate targets | Dead zones, center calibration, noise filtering, robust angle tracking |
| Cheating in browser leaderboards | Client code can be modified | Server validation, plausibility checks, rate limits, moderation; avoid claiming perfect anti-cheat |
| Challenges become repetitive | Retention falls | Multiple skill pillars, variants, progression, daily challenges |
| Scope grows too quickly | MVP never ships | Prove one challenge first; defer accounts and multiplayer |
| Accessibility issues | Some players cannot perform certain combinations | Practice modes, alternate challenges, adjustable settings where fair |
| Input latency varies | Competitive results can be affected | Keep scoring rules transparent, test across setups, avoid overly tight windows |

---

## 18. Privacy and Security

- The app should not require an account for local play.
- Controller input should be processed locally for the MVP.
- Do not collect raw input traces unless there is a clear feature need.
- Explain what is stored before adding online accounts or leaderboards.
- Protect leaderboard endpoints with validation and rate limits.
- Do not run arbitrary code supplied in challenge definitions.
- Provide data deletion for online profiles.
- Avoid unnecessary analytics and third-party tracking in the initial version.

---

## 19. Success Metrics

### MVP usability
- Percentage of users who connect a controller successfully.
- Percentage who complete their first challenge.
- Time from landing page to first completed run.
- Controller disconnection/error rate.

### Engagement
- Attempts per challenge.
- Retry rate after a failed run.
- Percentage of users who beat their personal best.
- Return rate for daily challenges once implemented.

### Competition
- Number of valid submissions per event.
- Leaderboard participation.
- Suspicious/invalid submission rate.
- Duel completion rate and disconnect rate.

Use metrics to improve the game, not to encourage unhealthy compulsive play. Keep sessions short and let players stop at any time.

---

## 20. Open Decisions

These decisions can be made after the first prototype, rather than blocking it:

1. Final name and visual identity.
2. Whether the core positioning is gamer training, arcade entertainment, or both.
3. Which challenge should be the first polished experience.
4. Whether leaderboards require accounts or allow anonymous identities.
5. Backend choice for online features.
6. Daily challenge reset time and event format.
7. Which controllers and browsers are officially supported.
8. Whether user-created challenges belong in the long-term product.
9. Whether a desktop wrapper is useful after the browser version works.

### Recommended default decisions

- Working name: Gamepad Arena.
- First platform: browser.
- First stack: React + TypeScript + Vite + Canvas 2D.
- First challenge: Dual Orbit if coordination is the differentiator; Button Blitz if the fastest route to a working prototype is the priority.
- Persistence: local first.
- Competition: daily asynchronous challenges before live duels.
- Monetization: none during MVP; validate the fun first.

---

## 21. First Implementation Checklist

Use this as the initial work queue.

### Setup
- [ ] Create the React + TypeScript + Vite project.
- [ ] Add linting, formatting, and unit-test tooling.
- [ ] Create a minimal responsive page and arcade visual theme.
- [ ] Add a controller detection and connection-status component.

### Input foundation
- [ ] Read `navigator.getGamepads()` safely.
- [ ] Handle connection and disconnection.
- [ ] Normalize axes, buttons, and triggers.
- [ ] Implement dead-zone handling.
- [ ] Add temporary developer diagnostics.
- [ ] Test an Xbox-style controller in the target browser.

### First challenge
- [ ] Define Dual Orbit rules and completion conditions.
- [ ] Implement the countdown and timer.
- [ ] Detect stick angle and direction robustly.
- [ ] Track simultaneous movement.
- [ ] Implement a transparent scoring function.
- [ ] Add success/failure feedback.
- [ ] Add result and retry screens.
- [ ] Save the personal best locally.
- [ ] Add unit tests for edge cases.

### Playtest
- [ ] Test repeated runs on the same hardware.
- [ ] Test a second controller if available.
- [ ] Test disconnect/reconnect and browser tab focus changes.
- [ ] Ask another person to play without verbal instructions.
- [ ] Tune thresholds based on observed behavior.
- [ ] Write down known compatibility limitations.

---

## 22. References

- MDN — Gamepad API: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
- MDN — `Navigator.getGamepads()`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getGamepads
- MDN — `Gamepad` interface: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Vite: https://vite.dev/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/

---

## Final Recommendation

Build the smallest version that proves the core loop:

**Connect controller → perform a satisfying trick → receive a fair score → retry to beat the score.**

Do not begin with multiplayer, a large backend, or dozens of challenges. If the first challenge feels good and players voluntarily replay it, expand to three challenge types, then local records, then daily online competition.

The long-term differentiator is not merely reading controller inputs. It is turning those inputs into a flexible, fair, replayable arcade competition.
