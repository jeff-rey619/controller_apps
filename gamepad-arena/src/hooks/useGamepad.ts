/**
 * Gamepad detection and connection management hook
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { GamepadStatus } from '../types'

/**
 * Read the gamepad from a connection event. Native events expose `e.gamepad`,
 * while the custom events dispatched by this hook carry it on `e.detail`.
 */
function gamepadFromEvent(e: Event): Gamepad | null {
  const custom = e as CustomEvent<Gamepad>
  if (custom.detail) return custom.detail
  const native = e as Event & { gamepad?: Gamepad }
  return native.gamepad ?? null
}


export function useGamepad(preferredIndex: number = 0): GamepadStatus & {
  gamepads: Gamepad[]
  setPreferredIndex: (index: number) => void
} {
  const [status, setStatus] = useState<GamepadStatus>({
    connected: false,
    gamepad: null,
    index: preferredIndex,
  })
  const [gamepads, setGamepads] = useState<Gamepad[]>([])
  const prevGamepadsRef = useRef<Gamepad[]>([])
  const preferredIndexRef = useRef(preferredIndex)
  const isUpdatingRef = useRef(false)

  const updateGamepads = useCallback(() => {
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true

    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : []
      const connectedPads = Array.from(pads).filter((p): p is Gamepad => p !== null)

      // Find preferred gamepad
      let selectedPad: Gamepad | null = null
      let selectedIndex = preferredIndexRef.current

      if (connectedPads[preferredIndexRef.current]) {
        selectedPad = connectedPads[preferredIndexRef.current]
        selectedIndex = preferredIndexRef.current
      } else if (connectedPads.length > 0) {
        // Fall back to first connected
        selectedPad = connectedPads[0]
        selectedIndex = 0
      }

      // Only update state when the connected device set actually changes to
      // avoid re-rendering the app on every animation frame.
      setGamepads((prev) =>
        prev.length === connectedPads.length && prev.every((p, i) => p === connectedPads[i])
          ? prev
          : connectedPads
      )

      setStatus((prev) =>
        prev.connected === (selectedPad !== null) &&
        prev.gamepad === selectedPad &&
        prev.index === selectedIndex
          ? prev
          : {
              connected: selectedPad !== null,
              gamepad: selectedPad,
              index: selectedIndex,
            }
      )

      // Fire connection/disconnection events (only for actual changes, not on every poll)
      const prev = prevGamepadsRef.current
      const curr = connectedPads

      // Check for new connections
      curr.forEach((pad) => {
        if (!prev.find((p) => p.index === pad.index)) {
          window.dispatchEvent(new CustomEvent('gamepadconnected', { detail: pad }))
        }
      })

      // Check for disconnections
      prev.forEach((pad) => {
        if (!curr.find((p) => p.index === pad.index)) {
          window.dispatchEvent(new CustomEvent('gamepaddisconnected', { detail: pad }))
        }
      })

      prevGamepadsRef.current = connectedPads
    } finally {
      isUpdatingRef.current = false
    }
  }, [])

  const setPreferredIndex = useCallback((index: number) => {
    preferredIndexRef.current = index
    updateGamepads()
  }, [updateGamepads])

  useEffect(() => {
    // Initial poll
    updateGamepads()

    // Set up polling loop
    let frameId: number
    const loop = () => {
      updateGamepads()
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)

    // Listen for gamepad events (some browsers fire these)
    const onConnect = (e: Event) => {
      // Native event has e.gamepad, custom events have e.detail
      const pad = gamepadFromEvent(e)
      if (pad) {
        console.log('[Gamepad] Connected:', pad.id, 'index:', pad.index)
        // Don't call updateGamepads here to avoid recursion - the poll loop will pick it up
      }
    }
    const onDisconnect = (e: Event) => {
      const pad = gamepadFromEvent(e)
      if (pad) {
        console.log('[Gamepad] Disconnected:', pad.id, 'index:', pad.index)
      }
    }

    window.addEventListener('gamepadconnected', onConnect as EventListener)
    window.addEventListener('gamepaddisconnected', onDisconnect as EventListener)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('gamepadconnected', onConnect as EventListener)
      window.removeEventListener('gamepaddisconnected', onDisconnect as EventListener)
    }
  }, [updateGamepads])

  return {
    ...status,
    gamepads,
    setPreferredIndex,
  }
}

/**
 * Hook for listening to gamepad connection events
 */
export function useGamepadEvents(
  onConnect?: (gamepad: Gamepad) => void,
  onDisconnect?: (gamepad: Gamepad) => void
): void {
  useEffect(() => {
    const handleConnect = (e: Event) => {
      const pad = gamepadFromEvent(e)
      if (pad) onConnect?.(pad)
    }
    const handleDisconnect = (e: Event) => {
      const pad = gamepadFromEvent(e)
      if (pad) onDisconnect?.(pad)
    }

    window.addEventListener('gamepadconnected', handleConnect as EventListener)
    window.addEventListener('gamepaddisconnected', handleDisconnect as EventListener)

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect as EventListener)
      window.removeEventListener('gamepaddisconnected', handleDisconnect as EventListener)
    }
  }, [onConnect, onDisconnect])
}
