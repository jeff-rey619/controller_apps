# Rewamp 2 — Prompt (UI, Routing, Game Engine & Input Fixes)

> Hand this to a capable agent. Repo root: `/home/ffx/Documents/vibe/controller`.
> The app is `gamepad-arena/` — React 19 + TypeScript + Vite + Canvas 2D. It has
> three games (Button Blitz, Dual Orbit, Dual Stick Rush / Twin Target), a neon
> Xbox-first theme, full gamepad UI navigation, and a `spec/` folder that
> documents every change.

You are working in `/home/ffx/Documents/vibe/controller`. Deliver a modern,
glassy arcade shell with real routes, smoother animation, and fixed controller
behaviour — without breaking gameplay or the project's checks.

---

## 1. Glass UI: remove modal borders, fix overlapping modals

**Remove borders on modals/panels.** The current `.screen`, `.modal-backdrop`
and card surfaces use solid neon borders. Replace them with a modern frosted-glass
look:
- Blurred, layered **gradient** surfaces (`backdrop-filter: blur(...)`,
  semi-transparent gradients, soft inner highlight, subtle drop shadow) instead of
  hard 2px borders.
- Use a border only as a faint 1px hairline highlight (top-left light catch), not
  a full neon outline.
- Keep the Xbox-first neon accents as **glow** and gradient tint, not as outlines.

**Fix overlapping modals (there are several today).** Audit every overlay and
ensure only one modal is interactive at a time and they never visually collide:
- Settings (`renderSettings` / `.modal-backdrop`), the result/pause screens
  (`.screen`), the countdown overlay (`.countdown-overlay`), the debug overlay
  (`.debug-overlay`), the gamepad status pill and the controller hint legend all
  currently share the same stacking context.
- Give each layer an explicit, documented `z-index` scale (e.g. tokens like
  `--z-canvas`, `--z-hud`, `--z-modal`, `--z-toast`) and remove ad-hoc values.
- Guarantee that opening Settings cannot stack on top of a result/pause screen in
  a broken way (e.g. suppress the other screen's focusable content while a modal
  is open, and make the modal backdrop cover everything below it).
- Ensure the challenge canvas never paints over modal content.

**Accessibility must survive the redesign** (this project targets WCAG 2.1 AA):
- Glass surfaces must keep text contrast ≥ 4.5:1 (≥ 3:1 for large text). If
  blur/gradient lowers contrast, darken the surface behind text.
- Provide a solid fallback: when `backdrop-filter` is unsupported, or under
  `@media (forced-colors: active)` / `prefers-contrast: more`, drop blur/gradient
  and use an opaque surface with visible boundaries.
- Respect `prefers-reduced-motion` (no animated gradient movement, no
  transition-heavy surfaces).

---

## 2. Routing: React Router, a route per game, glass "games library" home

**Add `react-router-dom`** and give the app real, deep-linkable routes:
- `/` — home / games library
- `/play/:challengeId` — an individual game (e.g. `/play/button-blitz`)
- `/settings` — settings
- Keep `/results` (or a `state`-driven result view) reachable per game.
- Use browser history so **back/forward work**; if the dev/preview server can't
  serve SPA fallbacks, configure it (Vite is fine) and/or provide a fallback.
- Wire **gamepad B = back** to real navigation (`navigate(-1)` or `/`), and make
  Start/select route into the chosen game instead of mutating local state.
- The routing layer must not fight the existing gamepad focus navigation: routes
  change → the nav scope/auto-focus must re-resolve (see the existing
  `useFocusNavigation` / `useGamepadNavigation` hooks and the auto-focus effect).

**Redesign the home into a modern games library:**
- A responsive grid/rail of game cards as glass tiles with cover art, short
  description, difficulty, and personal best — replacing the current plain
  `.challenge-card` list.
- Full keyboard + gamepad navigation (D-pad/stick move, A opens the game, B
  backs out), with a visible focus/hover treatment.
- The home is the "dashboard"; it should feel like a game launcher, not a form.

---

## 3. Game engine / animation library — evaluate and adopt

Evaluate the options and **pick one** with a short written rationale (add the
evaluation to the spec):
- **Animation/UI:** `motion` (the modern `motion/react`, i.e. Framer Motion) for
  route transitions, card hover, modal enter/exit, and HUD animation.
- **Game rendering:** consider a 2D engine such as **Phaser** (or a lighter
  alternative) for the in-game canvas scenes.

Constraints:
- If you adopt a game engine, wrap it behind the existing `Challenge` interface
  (`setup` / `update` / `draw` / `getScore` / `reset`) so the app, routing, and
  scoring are unaffected, and keep the single-canvas model.
- Do **not** rewrite gameplay logic, scoring, or the existing games' rules as part
  of this. Prefer the lightest change that delivers the polish.
- If a full engine is too heavy for this scope, say so and use `motion` + the
  existing Canvas 2D renderer — but justify the decision.
- Any new dependency must not break SSR-free Vite build, and must be pinned in
  `package.json`.

---

## 4. Input & polish fixes (exact bugs to fix)

### 4a. Result screen auto-closes on a held button — must not
Right now, when a game finishes, a button that is still held (or the same press)
can immediately activate the focused control and dismiss the result screen.
Fix this properly:
- Add a **short input lock-out / release latch** after any screen transition
  (entering `result`, opening/closing a modal, changing route): ignore
  confirm/back until every relevant button has been **released at least once**,
  plus a small cooldown (e.g. ~400 ms).
- On the result screen, **A must not dismiss it**. Only **B** should leave the
  result screen (back to the library), and even that must respect the lock-out.
- Confirm this is fixed for Button Blitz (lots of A presses), Dual Orbit and Dual
  Stick Rush (stick-driven, ends on timer).

### 4b. Button Blitz has no timer — add one
Button Blitz is a timed 10-second game but shows no countdown/timer. Add a
**visible timer** (seconds remaining and/or a progress bar) to the HUD, driven by
the game loop's remaining time, styled consistently with the other games. Verify
it counts down and that the run ends exactly at 0.

### 4c. Controller hint legend is misplaced — make it a bottom chip
The `A Select · B Back · ☰ Play` hint currently hangs at the top instead of a
chip at the bottom. Fix it so it:
- Renders as a proper **glass chip/pill pinned to the bottom-center** of the
  viewport (not top, not inline in the flex layout).
- Does not overlap the debug overlay, the gamepad status pill, or in-game HUD.
- Is hidden or repositioned during active gameplay and on small screens.
- Stays `aria-hidden` (it's a visual affordance; the real controls are the DOM).

---

## 5. Guardrails

- All three games must still play end-to-end via the controller: library →
  select game → countdown → running → result → retry / back to library.
- Gamepad navigation must keep working (D-pad/stick move focus, A confirms,
  B backs), including across route changes.
- Keep `npm run build`, `npm run test:run`, and `npm run lint`
  (`--max-warnings 0`) all green. Add tests for any new pure logic (routing
  helpers, input lock-out timing, timer formatting).
- Keep accessibility at WCAG 2.1 AA after the glass/route changes.
- Verify in a real browser. `/usr/bin/chromium-browser` is available; the
  `agent-browser` CLI can be installed into a writable prefix
  (`npm i -g agent-browser --prefix ~/.local/npm-global`). Inject a synthetic
  gamepad by overriding `navigator.getGamepads` (axes/buttons objects) to test
  navigation, the result-screen lock-out, the Button Blitz timer, and route
  transitions. Screenshot every screen. Clean up any process you start.

---

## 6. Spec documentation (required)

This project documents every change in
`/home/ffx/Documents/vibe/controller/spec/`. Following the existing
`iteration-NN-*.md` style (Date, Summary, per-area detail, Files Created/Modified,
Verification):

- Add a new iteration file covering: the glass redesign, the modal stacking
  fixes, the React Router setup and routes, the games-library redesign, the
  engine/animation library decision (with rationale), and each input/polish fix
  (4a/4b/4c).
- Update `spec/EXECUTABLE_PLAN.md` (iteration index + any relevant checkboxes).
- Update `spec/known-issues.md` (mark the result-auto-close bug and the missing
  Button Blitz timer as fixed; note any remaining limitations, e.g. new
  dependency caveats).
- Record the exact files touched and the verification commands/results.

Deliver a cohesive, modern glass dashboard with real routes, tasteful animation,
correct controller behaviour, and a complete `spec/` write-up — build, tests and
lint all green.
