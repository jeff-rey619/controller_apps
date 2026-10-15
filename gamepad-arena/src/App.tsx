/**
 * Gamepad Arena - Main App Component
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useGamepad } from './hooks/useGamepad'
import { normalizeGamepadInput } from './utils/input'
import { GameLoop } from './engine/gameLoop'
import { Renderer } from './engine/renderer'
import { challenges, getChallenge } from './challenges'
import { loadPersonalBest, savePersonalBest, loadSettings, saveSettings } from './store/localStorage'
import type { GameState, ScoreResult, PersonalBest, Settings, Challenge } from './types'
import './index.css'

function App() {
  const { connected, gamepad, gamepads } = useGamepad(0)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('button-blitz')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [personalBests, setPersonalBests] = useState<Record<string, PersonalBest>>({})
  const [lastResult, setLastResult] = useState<ScoreResult | null>(null)
  const [countdownValue, setCountdownValue] = useState<number | null>(null)

  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<GameLoop | null>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const currentChallengeRef = useRef<Challenge | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasContainerRef.current) return
    const renderer = new Renderer(canvasContainerRef.current)
    rendererRef.current = renderer
    const loop = new GameLoop()
    loop.setOnStateChange(setGameState)
    loop.setDrawFn((_alpha) => {
      if (currentChallengeRef.current && rendererRef.current) {
        currentChallengeRef.current.draw(rendererRef.current.getContext().ctx)
      }
    })
    gameLoopRef.current = loop
    loop.start()
    const pbs: Record<string, PersonalBest> = {}
    challenges.forEach((c) => {
      const pb = loadPersonalBest(c.id)
      if (pb) pbs[c.id] = pb
    })
    setPersonalBests(pbs)
    return () => {
      loop.destroy()
      renderer.destroy()
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  useEffect(() => {
    if (!gameLoopRef.current || !gamepad) return
    const updateInput = () => {
      if (!gameLoopRef.current || !gamepad) return
      const input = normalizeGamepadInput(gamepad, settings.deadzone)
      gameLoopRef.current.setInput(input)
      if (currentChallengeRef.current && gameLoopRef.current.getState() === 'running') {
        currentChallengeRef.current.update(1/60, input)
      }
      animationFrameRef.current = requestAnimationFrame(updateInput)
    }
    animationFrameRef.current = requestAnimationFrame(updateInput)
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current) }
  }, [gamepad, settings.deadzone])

  const startChallenge = useCallback((challengeId: string) => {
    const challenge = getChallenge(challengeId)
    if (!challenge || !gameLoopRef.current || !rendererRef.current || !gamepad) return
    setSelectedChallengeId(challengeId)
    setGameState('idle')
    setLastResult(null)
    setCountdownValue(null)
    currentChallengeRef.current = challenge
    challenge.setup(rendererRef.current.getContext().ctx, gamepad)
    challenge.reset()
    gameLoopRef.current.startChallenge(challenge.duration)
  }, [gamepad])

  useEffect(() => {
    if (gameState === 'result' && currentChallengeRef.current) {
      const score = currentChallengeRef.current.getScore()
      setLastResult(score)
      const existingPb = personalBests[selectedChallengeId]
      if (!existingPb || score.score > existingPb.score) {
        const pb: PersonalBest = { ...score, challengeId: selectedChallengeId }
        savePersonalBest(pb)
        setPersonalBests((prev) => ({ ...prev, [selectedChallengeId]: pb }))
      }
    }
  }, [gameState, selectedChallengeId, personalBests])

  useEffect(() => {
    if (!gameLoopRef.current) return
    const checkCountdown = () => {
      const loop = gameLoopRef.current!
      if (loop.getState() === 'countdown') setCountdownValue(loop.getCountdownValue())
      else setCountdownValue(null)
      requestAnimationFrame(checkCountdown)
    }
    checkCountdown()
  }, [gameState])

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => { const next = { ...prev, [key]: value }; saveSettings(next); return next })
  }, [])

  const renderScreen = () => {
    if (!connected) {
      return (
        <div className="screen" role="alert">
          <h2 className="screen-title">CONNECT CONTROLLER</h2>
          <p className="screen-subtitle">Connect a gamepad via USB or Bluetooth, then press any button to begin.</p>
          <div style={{"marginTop": "var(--space-xl)", "padding": "var(--space-lg)", "background": "var(--bg-tertiary)", "borderRadius": "var(--radius-md)", "border": "1px solid var(--border-color)"}}>
            <p style={{"fontFamily": "var(--font-mono)", "fontSize": "0.9rem", "color": "var(--fg-secondary)"}}>Supported: Xbox, PlayStation, Switch Pro, and standard Gamepad API controllers</p>
            {gamepads.length > 0 && (
              <div style={{"marginTop": "var(--space-md)"}}>
                <p style={{"fontSize": "0.8rem", "color": "var(--accent-yellow)"}}>Detected gamepads:</p>
                <ul style={{"textAlign": "left", "marginTop": "var(--space-xs)", "paddingLeft": "var(--space-lg)"}}>
                  {gamepads.map((gp) => (
                    <li key={gp.index} style={{"fontSize": "0.8rem", "color": "var(--fg-secondary)"}}>
                      [{gp.index}] {gp.id} {gp.mapping !== 'standard' && ` (mapping: ${gp.mapping})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )
    }

    switch (gameState) {
      case 'idle':
        return (
          <div className="screen">
            <h2 className="screen-title">GAMEPAD ARENA</h2>
            <p className="screen-subtitle">Select a challenge to begin</p>
            <div className="challenge-grid" role="listbox" aria-label="Select challenge">
              {challenges.map((challenge) => {
                const pb = personalBests[challenge.id]
                const isSelected = selectedChallengeId === challenge.id
                return (
                  <div key={challenge.id} className={"challenge-card " + (isSelected ? 'selected' : '')} role="option" aria-selected={isSelected} onClick={() => setSelectedChallengeId(challenge.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedChallengeId(challenge.id); }}} tabIndex={0}>
                    <div className="challenge-card-name">{challenge.name}</div>
                    <div className="challenge-card-desc">{challenge.description}</div>
                    <div className="challenge-card-duration">{challenge.duration}s challenge</div>
                    {pb && <div style={{"marginTop": "var(--space-sm)", "fontSize": "0.75rem", "color": "var(--accent-gold)"}}>PB: {pb.score} ({pb.grade})</div>}
                  </div>
                )
              })}
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => startChallenge(selectedChallengeId)} disabled={!connected}>START</button>
              <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>SETTINGS</button>
            </div>
          </div>
        )
      case 'countdown':
      case 'running':
        return null
      case 'paused':
        return (
          <div className="screen" style={{"maxWidth": "400px"}}>
            <h2 className="screen-title">PAUSED</h2>
            <p className="screen-subtitle">Press Start or click Resume to continue</p>
            <div className="btn-group"><button className="btn btn-primary" onClick={() => gameLoopRef.current?.resume()}>RESUME</button><button className="btn btn-secondary" onClick={() => gameLoopRef.current?.reset()}>QUIT</button></div>
          </div>
        )
      case 'result':
        if (!lastResult) return null
        const pb = personalBests[selectedChallengeId]
        const isNewPB = pb && pb.timestamp === lastResult.timestamp
        const gradeColor = { S: 'var(--accent-gold)', A: 'var(--accent-magenta)', B: 'var(--accent-cyan)', C: 'var(--accent-green)', D: 'var(--accent-orange)', F: 'var(--accent-red)' }[lastResult.grade]
        return (
          <div className="screen result-screen">
            <h2 className="screen-title">CHALLENGE COMPLETE</h2>
            <div className="result-grade" style={{"color": gradeColor}}>{lastResult.grade}</div>
            <div className="result-score">{lastResult.score.toLocaleString()}</div>
            <div className="result-stats">
              <div className="result-stat"><span className="result-stat-label">Presses</span><span className="result-stat-value">{lastResult.details.presses}</span></div>
              <div className="result-stat"><span className="result-stat-label">Max Combo</span><span className="result-stat-value">x{lastResult.details.maxCombo}</span></div>
              <div className="result-stat"><span className="result-stat-label">Presses/s</span><span className="result-stat-value">{lastResult.details.pressesPerSecond.toFixed(1)}</span></div>
            </div>
            {isNewPB && <div className="result-pb">🏆 NEW PERSONAL BEST!</div>}
            <div className="btn-group"><button className="btn btn-primary" onClick={() => startChallenge(selectedChallengeId)}>RETRY</button><button className="btn btn-secondary" onClick={() => gameLoopRef.current?.reset()}>MENU</button></div>
          </div>
        )
      default:
        return null
    }
  }

  const renderSettings = () => {
    if (!showSettings) return null
    return (
      <div className="screen" style={{"maxWidth": "500px"}} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <h2 id="settings-title" className="screen-title">SETTINGS</h2>
        <div className="settings-group">
          <div className="setting-row"><label className="setting-label">Deadzone</label><div className="setting-control"><input type="range" className="setting-slider" min="0" max="0.5" step="0.01" value={settings.deadzone} onChange={(e) => updateSetting('deadzone', parseFloat(e.target.value))} aria-label="Deadzone" /><span style={{"fontSize": "0.75rem", "color": "var(--fg-secondary)"}}>{Math.round(settings.deadzone * 100)}%</span></div></div>
          <div className="setting-row"><label className="setting-label">Vibration</label><div className="setting-control"><label className="setting-toggle"><input type="checkbox" checked={settings.vibration} onChange={(e) => updateSetting('vibration', e.target.checked)} aria-label="Vibration" /><span className="setting-toggle-slider" /></label></div></div>
          <div className="setting-row"><label className="setting-label">High Contrast</label><div className="setting-control"><label className="setting-toggle"><input type="checkbox" checked={settings.highContrast} onChange={(e) => updateSetting('highContrast', e.target.checked)} aria-label="High Contrast" /><span className="setting-toggle-slider" /></label></div></div>
          <div className="setting-row"><label className="setting-label">Reduced Motion</label><div className="setting-control"><label className="setting-toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSetting('reducedMotion', e.target.checked)} aria-label="Reduced Motion" /><span className="setting-toggle-slider" /></label></div></div>
          <div className="setting-row"><label className="setting-label">Audio</label><div className="setting-control"><label className="setting-toggle"><input type="checkbox" checked={settings.audioEnabled} onChange={(e) => updateSetting('audioEnabled', e.target.checked)} aria-label="Audio" /><span className="setting-toggle-slider" /></label></div></div>
        </div>
        <div className="btn-group"><button className="btn btn-primary" onClick={() => setShowSettings(false)}>DONE</button><button className="btn btn-danger" onClick={() => { if (confirm('Clear all personal bests and settings?')) { localStorage.clear(); setPersonalBests({}); setSettings(loadSettings()) }}}>CLEAR DATA</button></div>
      </div>
    )
  }

  const renderDebug = () => {
    if (!import.meta.env.DEV && !new URLSearchParams(window.location.search).has('debug')) return null
    if (!gamepad) return null
    const input = normalizeGamepadInput(gamepad, settings.deadzone)
    return (
      <div className="debug-overlay">
        <h4>DEBUG: {gamepad.id} [#{gamepad.index}]</h4>
        <div className="debug-row"><span className="debug-label">Mapping:</span><span className="debug-value">{gamepad.mapping}</span></div>
        <div className="debug-row"><span className="debug-label">L-Stick:</span><span className="debug-value">{input.axes.leftStick.x.toFixed(2)}, {input.axes.leftStick.y.toFixed(2)}</span></div>
        <div className="debug-row"><span className="debug-label">R-Stick:</span><span className="debug-value">{input.axes.rightStick.x.toFixed(2)}, {input.axes.rightStick.y.toFixed(2)}</span></div>
        <div className="debug-row"><span className="debug-label">LT/RT:</span><span className="debug-value">{input.axes.leftTrigger.toFixed(2)} / {input.axes.rightTrigger.toFixed(2)}</span></div>
        <div className="debug-row"><span className="debug-label">Buttons:</span><span className="debug-value">{Object.entries(input.buttons).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'none'}</span></div>
      </div>
    )
  }

  return (
    <div className="canvas-container">
      <div className="ui-overlay">{renderScreen()}{renderSettings()}</div>
      {gameState === 'countdown' && countdownValue !== null && (
        <div className="countdown-overlay" aria-live="polite" aria-atomic="true"><span className={"countdown-number " + (countdownValue === 0 ? 'countdown-go' : '')}>{countdownValue === 0 ? 'GO!' : countdownValue}</span></div>
      )}
      <div className="gamepad-status" aria-live="polite"><span className={"gamepad-indicator " + (connected ? 'connected' : 'disconnected')} aria-hidden="true" /><span className="gamepad-name">{connected ? gamepad?.id : 'No controller'}</span></div>
      {renderDebug()}
    </div>
  )
}
export default App
