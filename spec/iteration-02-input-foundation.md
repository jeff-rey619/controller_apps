# Iteration 2: Input Foundation

## Date: 2026-10-15

## Summary
Implemented gamepad detection, connection management, and input normalization utilities.

## Files Created/Modified

### src/hooks/useGamepad.ts
- **useGamepad(preferredIndex)** - Main hook for gamepad detection
  - Polls `navigator.getGamepads()` at 60Hz via requestAnimationFrame
  - Handles connection/disconnection events
  - Supports multiple gamepads with preferred index selection
  - Returns: `{ connected, gamepad, index, gamepads[], setPreferredIndex }`

- **useGamepadEvents(onConnect, onDisconnect)** - Event listener hook
  - Listens for gamepadconnected/gamepaddisconnected events

### src/utils/input.ts
Input normalization utilities for standard gamepad layout:

- **Button Mapping** (standard layout):
  - A=0, B=1, X=2, Y=3, LB=4, RB=5, LT=6, RT=7
  - Back=8, Start=9, LS=10, RS=11
  - DPad: Up=12, Down=13, Left=14, Right=15

- **Axis Mapping**:
  - Left Stick: X=0, Y=1
  - Right Stick: X=2, Y=3
  - Triggers on axes 4/5 (fallback to buttons 6/7)

- **Deadzone Handling**:
  - `applyDeadzone(value, deadzone)` - Rescales input outside deadzone
  - Default deadzone: 0.15 (15%)
  - Configurable via settings

- **Trigger Normalization**:
  - `normalizeTrigger(value)` - Threshold at 0.1

- **Button Press Detection**:
  - `isButtonPressed(button)` - Handles digital + analog buttons

- **Stick Utilities**:
  - `getStickAngle(x, y)` - Returns radians (-π to π)
  - `getStickMagnitude(x, y)` - Returns 0-1 magnitude
  - `getRotationDirection(prev, curr)` - CW/CCW detection
  - `angleDiff(a, b)` - Shortest angle difference
  - `lerpAngle(a, b, t)` - Angle interpolation

### src/utils/input.test.ts
14 unit tests covering all utility functions:
- applyDeadzone (3 tests)
- normalizeTrigger (2 tests)
- isButtonPressed (3 tests)
- normalizeGamepadInput (1 test)
- getStickAngle (1 test)
- getStickMagnitude (1 test)
- getRotationDirection (3 tests)

### src/test/setup.ts
Test environment with mocked Gamepad API and requestAnimationFrame

## Verification
- ✅ All 14 unit tests pass
- ✅ TypeScript compilation successful
- ✅ ESLint passes

## Next Steps
- Phase 2: Core Engine (GameLoop, Renderer)
- Phase 3: Button Blitz Challenge
