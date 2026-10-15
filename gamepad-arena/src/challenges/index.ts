/**
 * Challenge registry
 */

import { ButtonBlitzChallenge } from './button-blitz/ButtonBlitzChallenge'
import type { Challenge } from '../types'

export const challenges: Challenge[] = [
  new ButtonBlitzChallenge(),
]

export function getChallenge(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id)
}

export { ButtonBlitzChallenge }