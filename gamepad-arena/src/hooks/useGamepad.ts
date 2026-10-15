/**
 * Gamepad detection and connection management hook
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { GamepadStatus } from '../types'


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

  const updateGamepads = useCallback(() => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : []
    const connectedPads = Array.from(pads).filter((p): p is Gamepad => p !== null)

    setGamepads(connectedPads)

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

    setStatus({
      connected: selectedPad !== null,
      gamepad: selectedPad,
      index: selectedIndex,
    })

    // Fire connection/disconnection events
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
      const pad = (e as CustomEvent<Gamepad>).detail
      console.log('[Gamepad] Connected:', pad.id, 'index:', pad.index)
      updateGamepads()
    }
    const onDisconnect = (e: Event) => {
      const pad = (e as CustomEvent<Gamepad>).detail
      console.log('[Gamepad] Disconnected:', pad.id, 'index:', pad.index)
      updateGamepads()
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
      const pad = (e as CustomEvent<Gamepad>).detail
      onConnect?.(pad)
    }
    const handleDisconnect = (e: Event) => {
      const pad = (e as CustomEvent<Gamepad>).detail
      onDisconnect?.(pad)
    }

    window.addEventListener('gamepadconnected', handleConnect as EventListener)
    window.addEventListener('gamepaddisconnected', handleDisconnect as EventListener)

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect as EventListener)
      window.removeEventListener('gamepaddisconnected', handleDisconnect as EventListener)
    }
  }, [onConnect, onDisconnect])
}