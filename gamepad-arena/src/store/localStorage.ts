/**
 * Local storage persistence for personal bests and settings
 */

import type { PersonalBest, Settings } from '../types'

const STORAGE_PREFIX = 'gamepad-arena:'

const DEFAULT_SETTINGS: Settings = {
  deadzone: 0.15,
  vibration: true,
  highContrast: false,
  reducedMotion: false,
  audioEnabled: true,
}

function getKey(challengeId: string): string {
  return `${STORAGE_PREFIX}pb:${challengeId}`
}

function getSettingsKey(): string {
  return `${STORAGE_PREFIX}settings`
}

export function loadPersonalBest(challengeId: string): PersonalBest | null {
  try {
    const data = localStorage.getItem(getKey(challengeId))
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function savePersonalBest(pb: PersonalBest): void {
  try {
    localStorage.setItem(getKey(pb.challengeId), JSON.stringify(pb))
  } catch (e) {
    console.warn('Failed to save personal best:', e)
  }
}

export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(getSettingsKey())
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(getSettingsKey(), JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save settings:', e)
  }
}

export function clearAllData(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX))
    keys.forEach((k) => localStorage.removeItem(k))
  } catch (e) {
    console.warn('Failed to clear data:', e)
  }
}

export function getAllPersonalBests(): Record<string, PersonalBest> {
  const results: Record<string, PersonalBest> = {}
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`${STORAGE_PREFIX}pb:`)) {
        const challengeId = key.replace(`${STORAGE_PREFIX}pb:`, '')
        const data = localStorage.getItem(key)
        if (data) {
          results[challengeId] = JSON.parse(data)
        }
      }
    })
  } catch {
    // Ignore
  }
  return results
}