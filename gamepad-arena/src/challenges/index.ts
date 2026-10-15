/**
 * Challenge registry
 */

import { ButtonBlitzChallenge } from './button-blitz/ButtonBlitzChallenge'
import { DualOrbitChallenge } from './dual-orbit/DualOrbitChallenge'
import { TwinTargetChallenge } from './twin-target/TwinTargetChallenge'
import type { Challenge } from '../types'

export const challenges: Challenge[] = [
  new ButtonBlitzChallenge(),
  new DualOrbitChallenge(),
  new TwinTargetChallenge(),
]

export function getChallenge(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id)
}

export { ButtonBlitzChallenge, DualOrbitChallenge, TwinTargetChallenge }
