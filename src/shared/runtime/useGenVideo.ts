import { useCallback, useState } from 'react'
import { getGameUuid } from './game-id'
import { generateVideoMedia, MediaServiceError, waitForMediaTask } from './media'

export interface GenVideoRequest {
  firstFrameUrl: string
  lastFrameUrl: string
  prompt: string
  duration?: 5 | 10
  taskId?: string
  soundPrompt?: string
}

export interface GenVideoResult { url: string; taskId: string }

export function useGenVideo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const generate = useCallback(async ({ firstFrameUrl, lastFrameUrl, prompt, duration = 5, taskId, soundPrompt }: GenVideoRequest): Promise<GenVideoResult> => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = getGameUuid()
      if (!sessionId) throw new MediaServiceError('INVALID_REQUEST', 'Permanent game UUID is required for video generation', 0, false)
      if (duration !== 5) throw new MediaServiceError('INVALID_REQUEST', 'The public media service currently supports five-second video only', 0, false)
      const completed = taskId
        ? await waitForMediaTask(taskId, { pollIntervalMs: 10_000, timeoutMs: 30 * 60_000 })
        : await generateVideoMedia({
          sessionId,
          prompt,
          soundPrompt: soundPrompt ?? 'subtle environmental ambience matching the visible action, no spoken dialogue',
          startUrl: firstFrameUrl,
          endUrl: lastFrameUrl,
          ratio: '9:16',
          durationSeconds: 5,
        }, { pollIntervalMs: 10_000, timeoutMs: 30 * 60_000 })
      if (completed.media?.type !== 'video') throw new MediaServiceError('INVALID_RESPONSE', 'Video task completed without video media', 200, false)
      return { url: completed.media.url, taskId: completed.task_id }
    } catch (cause) {
      const next = cause instanceof Error ? cause : new Error(String(cause))
      setError(next)
      throw next
    } finally {
      setLoading(false)
    }
  }, [])
  return { generate, loading, error }
}
