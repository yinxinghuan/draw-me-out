import type { StoryAdapter } from '../types'
import { aigramAdapter } from './aigram'

/**
 * Compatibility mode for old entry links that still contain `chat_id`.
 *
 * The game state carried by the current save remains authoritative. Narration is
 * generated through the same stable AlterU game-chat gateway as normal Aigram
 * mode, so public source and Remix builds never depend on a provider host or a
 * private test deployment.
 */
export const remoteAdapter: StoryAdapter = {
  id: 'remote',
  send(action, context, onProgress) {
    return aigramAdapter.send(action, context, onProgress)
  },
}
