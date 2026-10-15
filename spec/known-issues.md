# Known Issues & Limitations

## Browser Compatibility

### Gamepad API Support
- **Chrome/Edge**: Full support, standard mapping
- **Firefox**: Full support, standard mapping
- **Safari**: Partial support (requires user gesture, limited mapping)
- **Mobile browsers**: Limited - iOS Safari requires special handling

### Controller Mapping Variations
- **Xbox (XInput)**: Standard mapping works perfectly
- **PlayStation (DualShock/DualSense)**: Standard mapping in Chrome, may need adjustment in Firefox
- **Switch Pro**: Standard mapping when paired via Bluetooth
- **Generic/Third-party**: May use non-standard mappings
- **Trigger axes**: Some browsers report LT/RT on axes[4]/[5], others only on buttons[6]/[7]

## Current Limitations

### Input
- Only first connected gamepad (index 0) used
- No gamepad switching UI yet
- No haptic/vibration support implemented (API stubbed)
- Deadzone applies to both sticks equally

### Challenges
- Button Blitz and Dual Orbit implemented
- Precision Run, Combo Master, Trigger Control, Rhythm Combo not yet implemented
- No daily challenges or leaderboards
- No replay/ghost system

### Persistence
- localStorage only (no cloud sync)
- No export/import of data
- No account system

### Audio
- No sound effects or music implemented
- Web Audio API not yet integrated
- `audioEnabled` setting is a placeholder

### Visuals
- Neon Xbox-first theme with layered gradients, glassy panels, canvas glow and
  decorative gamepad artwork (iteration 9)
- No CRT shader (just a scanline overlay)
- No particle system yet (press feedback is a single expanding glow ring)
- Font loading: JetBrains Mono/Orbitron may not load on all systems

### Accessibility
- WCAG 2.1 AA pass in iteration 9: all text/UI contrast ≥ AA (lowest 5.7:1),
  face buttons / rings / grades carry letters or labels (never colour alone),
  Settings is a focus-trapped modal (Escape closes, focus restored), reduced
  motion and high-contrast honoured (OS media queries + in-app toggles),
  interactive targets ≥ 44x44 px, result announced via an `aria-live` region.
- High-contrast mode keeps the neon glow on primary buttons (cosmetic only;
  borders + text already satisfy contrast) — could be flattened further.
- Colour-vision-deficiency check was reasoned from the palette + mandatory
  letters/labels, not run through an automated CVD simulator.
- Gameplay HUD is drawn as canvas pixels; the DOM result screen mirrors the
  score/grade for assistive tech, but live in-challenge values are not exposed.

### Testing
- No E2E tests (Playwright not configured for the project)
- No visual regression tests
- Limited unit test coverage (only input utils)

## Workarounds

### For Testing Without Controller
- Use `?debug=1` query parameter for debug overlay
- Keyboard fallback: **Space** = A, **Enter** = Start (pause/resume), **Escape** = back to menu
- Note: the on-screen START button stays disabled until a gamepad is detected

### For Safari Users
- Must interact with page first (click) before Gamepad API activates
- May need to enable "Gamepad API" in Experimental Features

## Future Fixes
1. Add controller selection UI when multiple connected
2. Implement vibration using GamepadHapticActuator
3. Implement remaining challenges (Precision Run, Combo Master, Trigger Control, Rhythm Combo)
4. Add Web Audio sound effects (the `audioEnabled` toggle is still a placeholder)
5. Configure Playwright for E2E testing (a throwaway headless-Chromium harness
   with a synthetic gamepad was used to verify iteration 9 manually)
6. Add font loading with fallbacks
7. Implement daily challenge system
8. Add replay recording/playback
9. Consider IndexedDB for larger data storage

## Recently Fixed
- START button did nothing — the canvas container ref was never attached, so the
  engine never initialised (iteration 7)
- Gameplay rendered to a duplicate off-screen canvas (iteration 7)
- Settings dialog overflowed the viewport (iteration 7)
- "NEW PERSONAL BEST!" banner never appeared (iteration 7)
- Dual Orbit challenge implemented (iteration 8)
- Lint is green: `no-case-declarations` and `no-explicit-any` issues resolved (iteration 7)
- Neon UI redesign, background controller art and WCAG 2.1 AA accessibility (iteration 9)
