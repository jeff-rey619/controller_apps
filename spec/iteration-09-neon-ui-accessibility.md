# Iteration 9: Neon UI Redesign, Controller Art & Accessibility

## Date: 2026-10-16

## Summary
Reworked the flat dark theme into a premium **Xbox-forward neon arcade** look
(green dominant, light PlayStation-blue accents), added decorative gamepad
artwork behind the UI and gameplay, centralised the canvas palette so CSS and
Canvas 2D stay in sync, and raised the app to **WCAG 2.1 AA** — without touching
gameplay logic, scoring, timers, or input handling. Build, tests (20) and lint
remain green.

---

## 1. Visual Redesign (neon, Xbox-first)

### Design tokens (`src/index.css`)
- Replaced the `--accent-cyan` / `--accent-magenta` look with **semantic,
  named tokens**: `--brand-xbox` (`#107C10`), `--brand-xbox-neon` (`#9BF00B`,
  primary accent), `--brand-ps` (`#1E8FFF`), the Xbox face buttons
  `--face-a/-b/-x/-y` (green / red / `#0078D7`-derived blue / `#FFB900` yellow),
  DualSense shape accents, and a set of `--glow-*` tokens.
- Legacy `--accent-*` names are kept as **aliases** onto the new palette so
  existing inline styles keep working while the whole app shifts cohesively.
- Layered page background (`--bg-layers`): two radial brand washes (Xbox green
  top-left, PS blue bottom-right) over a diagonal near-black gradient.
- Glassy panels with a **gradient border** (padding-box/border-box trick),
  layered glow/box-shadow, and smoother transitions. Title uses a green→blue
  gradient text fill.
- Responsive `@media (max-width: 768px)` rules retained and extended.

### Canvas palette plumbing (`src/engine/palette.ts` — NEW)
- Single source of truth for canvas colours (`PALETTE`), mirroring the CSS
  tokens, plus `gradeColor(grade)` and a reduced-motion flag
  (`setReducedMotion` / `isReducedMotion`).
- `Renderer`, `ButtonBlitzChallenge` and `DualOrbitChallenge` now import colours
  from here instead of hardcoding hex (`'#00ffff'`, `'#ff0066'`, …).

### Canvas visuals (`src/engine/renderer.ts`, challenge `draw()`)
- Added optional **neon glow** (`shadowBlur` + `shadowColor`) to text, circles,
  arcs, rings and progress bars.
- New `drawBackdrop()`: deep base fill, two soft radial brand washes, a faint
  grid, a decorative controller silhouette, scanlines and a vignette — drawn
  behind gameplay on the same canvas. Replaces the old clear+vignette+scanlines
  trio in both challenges.
- Button Blitz: the target button is now the **green A face button** with an
  expanding glow ring on press (static highlight under reduced motion).
- Dual Orbit: left ring = Xbox green, right ring = PS blue, each with an **L / R
  letter label** so the two rings are not distinguished by colour alone.

### Background controller artwork (`src/App.tsx`, `.bg-art` in `index.css`)
- Inline SVG gamepad silhouettes (`ControllerGlyph`) tiled behind the UI —
  Xbox-dominant (green), two PlayStation-blue — at low opacity, `pointer-events:
  none`, `aria-hidden`, with a slow drift animation that is disabled under
  reduced motion / high contrast.

---

## 2. Accessibility (WCAG 2.1 AA)

### Contrast (verified, ratios vs actual background)
| Text / UI | Ratio | Req |
|---|---|---|
| Body `--fg-primary` #eef7ec on bg | 18.2:1 | 4.5 |
| Muted `--fg-secondary` #a7bcae on bg | 9.9:1 | 4.5 |
| Muted on `--bg-tertiary` panels | 8.6:1 | 4.5 |
| Primary neon #9bf00b on bg | 14.1:1 | 3.0 |
| Yellow #ffc21e / Gold #ffd23f on bg | 12.3 / 13.8:1 | 4.5 |
| PS-blue #1e8fff (grade A) on bg | 6.1:1 | 4.5 |
| Face-A green / Face-B red on bg | 10.0 / 5.7:1 | 4.5 |
| Button ink #06130a on neon button | 13.5:1 | 4.5 |

All foreground/background pairs meet or exceed AA (lowest 5.7:1).

### Never colour alone
- Face A (green) / B (red) always carry their **letter** on the canvas — the
  classic red-green trap is covered by the glyph, not hue.
- Dual Orbit rings carry **L / R** labels; grades always show the letter
  (S/A/B/C/D/F); success/failure states carry text, not just colour.

### Reduced motion
- `@media (prefers-reduced-motion: reduce)` and an in-app **Reduced Motion**
  toggle (class `.reduced-motion` on the root) both disable the background
  drift/parallax and decorative transitions. The OS preference is also pushed to
  the canvas via `setReducedMotion()`, which tames the press-glow animation.

### Contrast preference / forced colours
- `@media (prefers-contrast: more)` and the in-app **High Contrast** toggle
  brighten muted text, use solid borders, and drop glows/background art.
- `@media (forced-colors: active)` maps panels/buttons/toggles to system colours
  with solid borders and no backdrop blur.

### Focus management
- Visible focus ring everywhere; thicker white ring + glow on buttons.
- The **Settings dialog is now a true modal**: rendered in a `.modal-backdrop`,
  focus moves into the dialog on open, **Tab is trapped**, **Escape closes**, and
  focus is **restored to the SETTINGS trigger** on close (verified in-browser).
- Settings labels are associated with their controls via `htmlFor`/`id`.

### Screen readers
- Countdown keeps its `aria-live="polite"` region.
- Result screen adds an assertive `role="status"` live region announcing grade,
  score and new-personal-best; the grade/score carry `aria-label`s and the 🏆 is
  `aria-hidden`. The challenge list keeps its listbox/option roles.
- All decorative SVG/background art is `aria-hidden`.

### Target sizes
- Buttons, toggles (44px hit area with a 28px visual track), sliders and mapping
  selects are all ≥ 44×44 CSS px.

---

## Files Created
- `src/engine/palette.ts` — shared canvas palette, grade colours, reduced-motion flag.

## Files Modified
- `src/index.css` — neon token system, layered background, glassy/gradient panels,
  `.bg-art`, modal backdrop, 44px targets, reduced-motion / high-contrast /
  forced-colors handling, focus styles.
- `src/App.tsx` — background controller art, reduced-motion + high-contrast
  wiring (root classes + canvas flag), modal focus trap / Escape / focus restore,
  result `aria-live`, label associations.
- `src/engine/renderer.ts` — palette defaults, glow options, `drawBackdrop()`,
  `drawControllerGlyph()`.
- `src/challenges/button-blitz/ButtonBlitzChallenge.ts` — palette + glow + green
  A face button (visual only).
- `src/challenges/dual-orbit/DualOrbitChallenge.ts` — palette + glow + L/R labels
  (visual only).

## Guardrails honoured
- No change to gameplay logic, scoring, timers or input handling.
- Single-canvas architecture and the `GameLoop` / `Renderer` contracts unchanged.
- Full flow intact: menu → START → countdown → running → result → retry/menu,
  plus pause/resume and Escape-to-menu.

## Verification
- ✅ `npm run build` — succeeds (tsc + vite).
- ✅ `npm run test:run` — **20/20 tests pass** (unchanged logic).
- ✅ `npm run lint` — exit 0 (`--max-warnings 0`).
- ✅ Real browser (headless Chromium, synthetic standard gamepad injected via
  `navigator.getGamepads` override): screenshotted every screen — menu, Button
  Blitz (presses/combo/grade), Dual Orbit (3.1/3 orbits, green L + blue R rings),
  result (grade S, PB banner), settings modal, and high-contrast menu (solid
  borders, art hidden, focus ring restored to SETTINGS). No console errors.
