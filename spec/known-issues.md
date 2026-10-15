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
- Only Button Blitz implemented
- Dual Orbit not yet implemented
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
- No CRT shader (just scanline overlay)
- No particle effects
- Font loading: JetBrains Mono/Orbitron may not load on all systems

### Testing
- No E2E tests (Playwright not configured)
- No visual regression tests
- Limited unit test coverage (only input utils)

## Workarounds

### For Testing Without Controller
- Use `?debug=1` query parameter for debug overlay
- Keyboard fallback not yet implemented (planned for Phase 5)

### For Safari Users
- Must interact with page first (click) before Gamepad API activates
- May need to enable "Gamepad API" in Experimental Features

## Future Fixes
1. Add controller selection UI when multiple connected
2. Implement vibration using GamepadHapticActuator
3. Add keyboard fallback for testing
4. Implement Dual Orbit challenge
5. Add Web Audio sound effects
6. Configure Playwright for E2E testing
7. Add font loading with fallbacks
8. Implement daily challenge system
9. Add replay recording/playback
10. Consider IndexedDB for larger data storage
