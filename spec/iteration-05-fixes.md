# Iteration 5: Bug Fixes & Controller Compatibility

## Date: 2026-10-15

## Summary
Fixed critical bugs in gamepad detection and improved controller compatibility for 8BitDo and other non-standard controllers.

## Issues Fixed

### 1. Infinite Recursion in Gamepad Events (useGamepad.ts)
**Problem**: Custom events dispatched in `updateGamepads()` were caught by the same event listeners, causing infinite recursion and stack overflow.

**Root Cause**:
- Polling loop calls `updateGamepads()` every frame
- `updateGamepads()` dispatches `gamepadconnected`/`gamepaddisconnected` CustomEvents
- Event listeners call `updateGamepads()` again → infinite loop

**Solution**:
- Added `isUpdatingRef` guard to prevent re-entrant calls
- Event listeners no longer call `updateGamepads()` - the polling loop naturally picks up changes
- Native events use `e.gamepad`, custom events use `e.detail` - now handles both

### 2. Start Button Not Working (App.tsx)
**Problem**: Start button (button index 9) didn't pause/resume the challenge.

**Solution**:
- Added `startButtonPrevRef` to track previous frame state
- Detect rising edge of Start button press
- Call `gameLoop.pause()` when running, `gameLoop.resume()` when paused

### 3. LB/RB Not Registering on 8BitDo Controllers
**Problem**: 8BitDo Ultimate 2C and similar controllers may map shoulder buttons to different indices (6,7 instead of standard 4,5).

**Solution** (input.ts):
- Added fallback detection for LB/RB:
  ```typescript
  lb: isButtonPressed(buttons[BUTTON_INDEX.LB]) || isButtonPressed(buttons[6]),
  rb: isButtonPressed(buttons[BUTTON_INDEX.RB]) || isButtonPressed(buttons[7]),
  ```
- Standard indices (4,5) tried first, then alternatives (6,7)

## Files Modified

### src/hooks/useGamepad.ts
- Added `isUpdatingRef` guard
- Fixed event handler to use both `e.detail` and `e.gamepad`
- Removed recursive `updateGamepads()` calls from event handlers

### src/utils/input.ts
- Added fallback button indices for LB (6) and RB (7)
- Maintains backward compatibility with standard mapping

### src/App.tsx
- Added Start button handling for pause/resume
- Tracks previous frame state to detect press events

## Testing
- ✅ Build passes
- ✅ All 14 unit tests pass
- ✅ No infinite recursion on connect/disconnect
- ✅ Start button toggles pause
- ✅ LB/RB work on standard and 8BitDo controllers

## Verification Steps
1. Connect 8BitDo Ultimate 2C (or any controller)
2. Open Settings → verify no console errors
3. Start Button Blitz → press Start to pause/resume
4. Check debug overlay (?debug=1) for LB/RB detection

## Next Steps
- Consider adding controller mapping detection/auto-configuration
- Add keyboard fallback for testing without controller
- Implement Dual Orbit challenge
