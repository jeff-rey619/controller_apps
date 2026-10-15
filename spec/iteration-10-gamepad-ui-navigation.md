# Iteration 10: Full Gamepad UI Navigation

## Date: 2026-10-15

## Summary
The whole app can now be driven by the controller itself — no mouse or keyboard
required. D-pad / left stick move DOM focus, **A** confirms, **B** goes back, and
**Start** plays / pauses. Navigation is automatically disabled while a challenge
is actually running so the stick stays dedicated to gameplay.

## Control scheme
| Input | Action |
|---|---|
| D-pad / left stick | Move focus between controls (spatial navigation) |
| **A** | Activate the focused control (select card, press button, toggle checkbox) |
| **B** / Back | Back — close Settings, or leave Pause/Result back to the menu |
| **Start** | On the menu: play the selected challenge. In a run: pause / resume |
| Left/Right on a slider or dropdown | Adjust the value in place (no native popup) |

Hold-to-repeat: after ~380 ms a held direction auto-repeats every ~120 ms.

## Files Created
- `src/utils/focusNavigation.ts` — pure spatial-navigation helpers
  (`getFocusableElements`, `findNextFocus`, `NavDirection`).
- `src/utils/controlAdjust.ts` — steps a focused range/select with left/right and
  dispatches the events React listens for (native dropdowns/sliders can't be
  driven by a gamepad).
- `src/hooks/useFocusNavigation.ts` — the small hook that moves DOM focus within
  a scope (`move`, `focusFirst`, `hasFocusables`).
- `src/hooks/useGamepadNavigation.ts` — polls the gamepad once per frame, turns
  D-pad/stick into directions and A/B/Back/Start into callbacks, with edge
  detection + hold-repeat. Input-only: it knows nothing about React state.
- `src/utils/focusNavigation.test.ts` (7 tests), `src/utils/controlAdjust.test.ts` (3 tests).

## Files Modified
- `src/App.tsx` — wires the two hooks: nav scope (current screen, or the Settings
  panel when open), confirm/back/start handlers, an auto-focus effect so each
  screen lands focus on a sensible control, a `gamepad-nav` container flag, and a
  controller hint legend.
- `src/index.css` — `gamepad-nav` focus ring styling and the `.action-hints`
  legend.

## How it works
1. `useGamepadNavigation` normalizes the pad each frame and derives a small
   state (four directions + a/b/back/start). Directions fire on the rising edge;
   a held direction repeats after a delay.
2. `App.handleNavigate` first lets the focused control consume left/right
   (slider/select via `adjustControl`); otherwise it calls `moveFocus`.
3. `useFocusNavigation` reads the focusable elements in the current scope and
   picks the nearest neighbour in the requested direction using element geometry
   (primary-axis distance + weighted perpendicular penalty), so grids and button
   rows behave predictably.
4. `enabled` is false during `running`/`countdown`, so the stick is never stolen
   from the challenge. Edge state is still tracked so no stale press fires when
   navigation resumes.

## Accessibility
- Focus **is** the accessibility model here: moving the gamepad highlight moves
  real DOM focus, so screen readers follow the selection and the existing roles
  (`listbox`/`option`, `dialog`, `alert`) apply unchanged.
- The Settings dialog keeps its focus trap and restore-focus behaviour; gamepad
  navigation is scoped to the open panel so it cannot escape the modal.
- A visible ring is painted while the gamepad is in use via the container-level
  `.gamepad-nav` class (programmatic focus doesn't always match
  `:focus-visible`). The ring is dropped as soon as the mouse is moved.
- The button-hint legend is `aria-hidden` — it's a visual affordance, not content.

## Design notes / decisions
- **Spatial, not linear, navigation**: down from a challenge card focuses the
  nearest control below it, which can be SETTINGS rather than START depending on
  horizontal position. This is intentional nearest-neighbour behaviour.
- **A on a card selects it; A on START starts.** This mirrors the existing mouse
  behaviour exactly, so no control needs special-casing.
- **Sliders/selects adjust in place** rather than moving focus, giving a
  console-style settings screen.

## Verification
- ✅ `npm run build` succeeds
- ✅ `npm run test:run` — 30 tests pass (10 new)
- ✅ `npm run lint` — exit 0
- ✅ Browser (synthetic standard gamepad):
  - menu auto-focuses the selected card; D-pad/stick moves focus; A selects;
    physical Start starts the selected challenge
  - Settings: opens, focuses the deadzone slider, left/right steps it
    (0.15 → 0.16), down moves to a checkbox, A toggles it, B closes
  - Result screen auto-focuses RETRY; A retries; B returns to the menu
  - navigation is disabled during the countdown/run
  - `gamepad-nav` focus styling is applied on gamepad use and cleared on mousemove
  - hint legend renders ("A Select · B Back · ☰ Pause / Resume")
