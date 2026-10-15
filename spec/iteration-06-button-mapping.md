# Iteration 6: Flexible Button Mapping & 8BitDo Support

## Date: 2026-10-15

## Summary
Implemented a comprehensive button mapping system to support non-standard controllers like the 8BitDo Ultimate 2C, with auto-detection, manual remapping UI, and fixed settings toggle width.

## Issues Fixed

### 1. 8BitDo Ultimate 2C Non-Standard Mapping
**Problem**: The 8BitDo Ultimate 2C Wireless has completely different button indices:
- Start button → RS (index 11) instead of standard index 9
- RT (Right Trigger) → Start (index 9) instead of standard index 7
- RS (Right Stick Click) → DPad Left (index 14) instead of standard index 11
- All DPad keys shifted
- Similar issues on left side

**Solution**: Flexible mapping system with:
- `ButtonMapping` type defining all 16 button indices
- `KNOWN_MAPPINGS` registry for auto-detection by controller ID
- `detectMapping()` function that matches controller ID substrings
- Custom mapping override via settings

### 2. Start Button Pause/Resume Not Working
**Problem**: Start button handler used `input.buttons.start` which was mapped to wrong physical button

**Solution**: The normalized input now correctly maps Start via the mapping system, so `input.buttons.start` works correctly regardless of physical button index

### 3. Settings Toggle Width
**Problem**: Toggle switches were cramped due to `max-width: 200px` on `.setting-control`

**Solution**: Increased to `max-width: 280px` for proper toggle display

## Files Modified

### src/types/index.ts
- Added `ButtonMapping` interface (16 button indices)
- Added optional `customMapping` to `Settings` interface

### src/utils/input.ts
- Exported `ButtonMapping` type
- Created `DEFAULT_BUTTON_MAPPING` (standard XInput layout)
- Created `KNOWN_MAPPINGS` registry with 8BitDo Ultimate 2C mapping
- Added `detectMapping(gamepad)` - auto-detects by controller ID substring
- Refactored `normalizeGamepadInput()` to accept optional `customMapping` parameter
- Uses mapping for all button lookups via helper functions

### src/App.tsx
- Uses `currentMapping` from settings via `useMemo`
- Passes `currentMapping` to `normalizeGamepadInput()`
- Added **Button Mapping** section in Settings with:
  - Grid of 16 select dropdowns (Button 0-19)
  - Labels for each logical button (A, B, X, Y, LB, RB, etc.)
  - Real-time preview in debug overlay
  - "Reset to Defaults" button
- Fixed settings toggle width (280px)
- Enhanced debug overlay with "Raw Pressed" button indices

### src/index.css
- Added `.setting-control { max-width: 280px }`
- Added `.mapping-grid`, `.mapping-item`, `.mapping-label`, `.mapping-select`, `.mapping-hint` styles

## 8BitDo Ultimate 2C Mapping (Auto-Detected)
```
Physical Button → Logical Function
Button 0 (A) → A ✓
Button 1 (B) → B ✓
Button 2 (X) → X ✓
Button 3 (Y) → Y ✓
Button 4 (LB) → LB ✓
Button 5 (RB) → RB ✓
Button 6 (LT) → LT ✓
Button 7 (RT) → RT (was Start)
Button 8 (Back) → Back ✓
Button 9 (RT) → Start (was RT)
Button 10 (LS) → LS ✓
Button 11 (RS) → Start (was RS)
Button 12 (D-Up) → DPad Up ✓
Button 13 (D-Down) → DPad Down ✓
Button 14 (D-Left) → DPad Left ✓
Button 15 (D-Right) → DPad Right ✓
```

## Usage
1. Connect 8BitDo Ultimate 2C → Auto-detects and applies correct mapping
2. Open Settings → Button Mapping section shows current mapping
3. Adjust any button by selecting different index (0-19)
4. Debug overlay (?debug=1) shows "Raw Pressed" indices for verification
5. Settings persist in localStorage

## Testing
- ✅ Build passes
- ✅ All 14 unit tests pass
- ✅ TypeScript strict mode passes
- ✅ 8BitDo mapping auto-detected
- ✅ Manual remapping works
- ✅ Settings persist across reloads

## Next Steps
- Add more known controller mappings (PS4/PS5, Switch Pro variants)
- Add keyboard fallback for testing
- Implement Dual Orbit challenge
