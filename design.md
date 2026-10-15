# Design Prompt — Neon UI, Controller Art & Accessibility

> Hand this to a capable agent. Repo root: `/home/ffx/Documents/vibe/controller`.

You are working in the repository at `/home/ffx/Documents/vibe/controller`.
The app lives in `gamepad-arena/` — a React 19 + TypeScript + Vite + Canvas 2D
browser game called "Gamepad Arena". It has two playable challenges (Button
Blitz, Dual Orbit), a controller-connection screen, a challenge menu, a settings
dialog, a countdown overlay, and a result screen.

**GOAL:** Make the UI feel premium arcade-neon instead of the current flat/blunt
dark theme, add subtle gamepad artwork to the background, bake in Xbox-forward
branding (with a little PlayStation), and raise accessibility to WCAG 2.1 AA —
without breaking gameplay. Then document everything in the `spec/` folder.

---

## 1. Visual redesign (neon, colorful, Xbox-first)

**Theme system (`src/index.css`):**
- Rework the `:root` design tokens into a proper neon palette, keeping the
  arcade feel but adding depth: layered background (radial + linear gradients,
  subtle grid/scanline overlay), glassy panels, glow/box-shadow accents,
  gradient borders, and tasteful transitions.
- **Xbox-forward palette (primary):** Xbox brand green (`#107C10`) plus a neon
  variant (`#9BF00B`), and the Xbox face-button colors — A green, B red, X blue
  (`#0078D7`), Y yellow (`#FFB900`). Xbox green should be the dominant accent.
- **PlayStation secondary accents (used sparingly):** PS blue (`#0070D1`) and the
  DualSense shape colors (triangle green, circle red, cross blue, square pink).
- Replace the current `--accent-cyan`/`--accent-magenta`-driven look with named,
  semantic tokens (e.g. `--brand-xbox`, `--brand-ps`, `--face-a`, `--face-b`,
  `--face-x`, `--face-y`, `--glow-*`) so colors are consistent across CSS and
  canvas.
- Keep the app readable on both large and small screens; ensure responsive
  behavior still works (existing `@media` rules).

**Canvas visuals (`src/engine/renderer.ts` + challenge `draw()` code):**
- The game scenes currently hardcode hex colors (e.g. `'#00ffff'`, `'#ff0066'`).
  Centralize a shared canvas palette (a small TS theme/palette module) and use it
  from the `Renderer` and from `ButtonBlitzChallenge` and `DualOrbitChallenge` so
  CSS and canvas stay in sync.
- Add neon glow to rings/arcs/text (`shadowBlur` + `shadowColor`), soft radial
  background washes, and slightly richer motion on press/complete events.
- Do NOT change gameplay logic, scoring, timers, or input handling.

**Background controller artwork:**
- Add subtle, low-opacity gamepad icons/silhouettes behind the UI (both behind
  the menu and behind gameplay). Prefer inline SVG glyphs (Xbox controller,
  PlayStation controller, face buttons, sticks) rather than raster images, so
  they scale and can be themed/tinted. Include a few Xbox and a couple of
  PlayStation glyphs, Xbox-dominant.
- Keep them clearly decorative: low opacity, behind content,
  `pointer-events: none`, and not competing with text contrast.

---

## 2. Accessibility (WCAG 2.1 AA)

- **Contrast:** all body text ≥ 4.5:1 and large text/UI ≥ 3:1 against its actual
  background. Verify the neon-on-dark choices meet this — neon text on near-black
  usually passes, but check muted/secondary text (`--fg-secondary`) and disabled
  states, and fix failures.
- **Never rely on color alone:** face buttons and success/failure states must also
  carry a glyph/letter/label/pattern (important because Xbox A=green and B=red is
  a classic red-green color-blindness trap). Verify with a color-vision-deficiency
  simulation if possible.
- **Reduced motion:** extend the existing
  `@media (prefers-reduced-motion: reduce)` handling to disable the new background
  animation/parallax and any decorative motion.
- **Contrast preference:** honor `prefers-contrast: more` / `forced-colors` where
  reasonable (solid borders, no reliance on glows for meaning).
- **Focus management:** visible focus ring everywhere (already partially present),
  correct tab order, and for the Settings dialog act as a proper modal — move
  focus in on open, trap focus, close on Escape, and restore focus to the trigger
  on close.
- **Screen readers:** keep/expand `aria-live` announcements for countdown and
  results (score, grade, personal best); ensure decorative SVG/background art is
  `aria-hidden`; keep semantic roles on the challenge list.
- **Targets:** interactive controls ≥ 44x44 CSS px.
- Do not communicate info solely via canvas pixels for assistive tech — keep the
  DOM result/HUD text in sync.

---

## 3. Guardrails

- Existing challenges must keep working end-to-end: menu → START → countdown →
  running → result → retry/menu, plus pause/resume (Start) and Escape-to-menu.
- Keep the single-canvas architecture and the existing `GameLoop`/`Renderer`
  contracts; don't reintroduce duplicate canvases.
- Keep `npm run build`, `npm run test:run` (currently 20 passing), and
  `npm run lint` (currently exit 0, `--max-warnings 0`) all green.
- Verify in a real browser. The machine has `/usr/bin/chromium-browser`; you can
  install the `agent-browser` CLI into a writable prefix
  (`npm i -g agent-browser --prefix ~/.local/npm-global`) and drive it, injecting
  a synthetic gamepad by overriding `navigator.getGamepads` (axes/buttons objects)
  to test Button Blitz and Dual Orbit and to screenshot every screen. Clean up any
  process you start (dev server, browser) when done.
- Keep changes focused; don't rewrite gameplay or add new game modes.

---

## 4. Spec documentation (required)

This project documents every change in
`/home/ffx/Documents/vibe/controller/spec/`.

- Create `spec/iteration-09-neon-ui-accessibility.md`, matching the style of the
  existing `iteration-*.md` files (Date, Summary, per-area detail, Files
  Created/Modified, Verification). Cover the palette/tokens, background art,
  canvas palette plumbing, accessibility changes, and the accessibility audit
  results (contrast values, color-blind handling, focus/modal behavior, reduced
  motion).
- Update `spec/EXECUTABLE_PLAN.md`: tick the relevant Phase 5.1/5.3 (UI/UX and
  Accessibility) items and add the new iteration file to the iteration index.
- Update `spec/known-issues.md` if anything relevant changes (e.g. remaining
  accessibility gaps or known contrast exceptions).
- Record the exact files touched and the verification commands/results.

Deliver a polished, cohesive neon arcade look that is Xbox-first with light
PlayStation accents, decorative gamepad art in the background, stronger
accessibility, and a complete `spec/` write-up — with build/tests/lint all green.
