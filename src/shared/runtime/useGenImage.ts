import { useCallback, useRef, useState } from 'react'
import { getGameUuid } from './game-id'
import { createMediaRequestId, generateImageMedia, MediaServiceError } from './media'

export interface GenImageRequest {
  requestId?: string
  prompt: string
  ref_url?: string
  requestedSize?: { width: number; height: number }
  profile?: 'fast-small' | 'standard'
  referenceMode?: 'edit' | 'avatar'
  timeoutMs?: number
}

export function useGenImage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const pendingRequestIds = useRef(new Map<string, string>())
  const generate = useCallback(async ({ requestId: suppliedRequestId, prompt, ref_url, requestedSize, profile, referenceMode = 'edit', timeoutMs }: GenImageRequest) => {
    setLoading(true); setError(null)
    try {
      const sessionId = getGameUuid()
      if (!sessionId) throw new Error('draw-me-out media: game UUID is unavailable')
      {
        const target = requestedSize ?? (/inventory artifact plate|still life|object only|square composition/i.test(prompt)
          ? { width: 640, height: 640 }
          : { width: 768, height: 576 })
        const requestKey = JSON.stringify({ prompt, ref_url, requestedSize: target, profile, referenceMode })
        const requestId = suppliedRequestId ?? pendingRequestIds.current.get(requestKey) ?? createMediaRequestId()
        pendingRequestIds.current.set(requestKey, requestId)
        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), Math.max(1, timeoutMs ?? 60_000))
        try {
          const task = await generateImageMedia({
            sessionId,
            requestId,
            // Output composition belongs to `size`; the original avatar is
            // identity evidence only. Edit mode preserves the requested
            // action and staging more reliably than avatar-output mode.
            mode: ref_url ? referenceMode : 'text',
            prompt,
            referenceUrls: ref_url ? [ref_url] : [],
            size: target,
          }, { timeoutMs, signal: controller.signal })
          pendingRequestIds.current.delete(requestKey)
          return task.media.url
        } catch (cause) {
          // A structured response means the service saw the request; a later
          // gameplay retry needs a fresh ID. Network ambiguity keeps the ID so
          // the next attempt can recover the same task without double billing.
          // A client-side timeout is ambiguous: the service may still finish
          // the task. Keep its id so the next attempt recovers that same task
          // instead of creating duplicate work. Terminal structured failures
          // may start a fresh request on an explicit retry.
          if (cause instanceof MediaServiceError && cause.code !== 'TIMEOUT') pendingRequestIds.current.delete(requestKey)
          if (cause instanceof DOMException && cause.name === 'AbortError') {
            throw new MediaServiceError('TIMEOUT', 'Image generation timed out', 0, true)
          }
          throw cause
        } finally {
          window.clearTimeout(timeout)
        }
      }
    } catch (cause) {
      const next = cause instanceof Error ? cause : new Error(String(cause)); setError(next); throw next
    } finally { setLoading(false) }
  }, [])
  const beginNewIntent = useCallback(() => { pendingRequestIds.current.clear(); setError(null) }, [])
  return { generate, beginNewIntent, loading, error }
}
