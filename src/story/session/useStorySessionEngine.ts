import { useCallback, useEffect, useRef, useState } from 'react'
import type { StoryEngineView } from '../StoryShell'
import type { StoryCartridge, StorySave } from '../types'
import { createInitialSave } from '../engine/reducer'
import { buildEndingSnapshot } from '../engine/endingDirector'
import { t } from '../i18n'
import { StorySessionRequestError, type StorySessionHead } from './storySessionClient'
import { StorySessionJournal } from './storySessionJournal'
import { useStorySessionMedia } from './useStorySessionMedia'

/** Isolated local cinematic UI canary. It never calls the legacy cloud writer, live model or media service. */
export function useStorySessionEngine(options: { cartridge: StoryCartridge; journal: StorySessionJournal; scope: string; initialSave: StorySave; imageIdentity?: { ready: boolean; refUrl?: string } }): StoryEngineView & { sessionId?: string; version?: number; cursor?: number } {
  const { cartridge, journal, scope, initialSave, imageIdentity = { ready: true } } = options
  const [head, setHead] = useState<StorySessionHead>()
  const headRef = useRef<StorySessionHead>()
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(true)
  const [pendingAction, setPendingAction] = useState('')
  const [presentCommittedResultVersion, setPresentCommittedResultVersion] = useState<number>()
  const [epilogueActive, setEpilogueActive] = useState(false)
  const running = useRef(false); const mounted = useRef(false)
  const adopt = useCallback((next: StorySessionHead) => { headRef.current = next; setHead(next) }, [])
  const run = useCallback(async (kind: 'open' | 'enter' | 'act' | 'restart', action = '') => {
    if (running.current) return
    running.current = true; setBusy(true); setError(''); setPendingAction(action)
    try {
      if (!navigator.locks) throw new Error('SESSION_LOCK_UNAVAILABLE')
      await navigator.locks.request(`story-session:${scope}`, { ifAvailable: true }, async lock => {
        if (!lock) throw new Error('SESSION_BUSY')
        const pendingBeforeOpen = kind === 'open' ? journal.peek().pending?.action_id : undefined
        const next = kind === 'restart'
          ? await journal.restart(createInitialSave(cartridge))
          : kind === 'enter' || kind === 'act'
            ? await journal.act(action, headRef.current)
            : await journal.open(initialSave)
        if (mounted.current) {
          adopt(next); setBlocked(false); setEpilogueActive(false)
          if (kind === 'enter') setPresentCommittedResultVersion(next.version)
          if (pendingBeforeOpen && next.events.some(event => event.action_id === pendingBeforeOpen)) setPresentCommittedResultVersion(next.version)
        }
      })
    } catch (cause) {
      if (mounted.current) {
        const code = cause instanceof StorySessionRequestError ? cause.code : cause instanceof Error ? cause.message : ''
        setError(t(cartridge.locale, code === 'VERSION_CONFLICT' ? 'sessionConflict' : code === 'SESSION_BUSY' ? 'sessionBusy' : code === 'SESSION_LOCK_UNAVAILABLE' ? 'sessionLockUnavailable' : code === 'MODEL_UNAVAILABLE' ? 'sessionModelUnavailable' : 'sessionRecoveryNeeded'))
        setBlocked(true)
        try { const cached = journal.peek().head; if (cached) adopt(cached) } catch { /* fail closed */ }
      }
    } finally { running.current = false; if (mounted.current) { setBusy(false); setPendingAction('') } }
  }, [adopt, cartridge, initialSave, journal, scope])
  useEffect(() => { mounted.current = true; void run('open'); return () => { mounted.current = false } }, [run])
  const media = useStorySessionMedia({ cartridge, head, journal, identity: imageIdentity, adopt })

  const finishEnding = useCallback(async () => {
    if (running.current || blocked || !headRef.current || !['ready', 'failed'].includes(headRef.current.snapshot.finale.status)) return
    running.current = true; setBusy(true); setError('')
    try {
      if (!navigator.locks) throw new Error('SESSION_LOCK_UNAVAILABLE')
      await navigator.locks.request(`story-session:${scope}`, { ifAvailable: true }, async lock => {
        if (!lock) throw new Error('SESSION_BUSY')
        const snapshot = buildEndingSnapshot(headRef.current!.snapshot, cartridge)
        const next = await journal.finishEnding(snapshot.id, headRef.current)
        if (mounted.current) { adopt(next); setBlocked(false) }
      })
    } catch {
      if (mounted.current) {
        setError(t(cartridge.locale, 'sessionRecoveryNeeded')); setBlocked(true)
        try { const cached = journal.peek().head; if (cached) adopt(cached) } catch { /* fail closed */ }
      }
    } finally { running.current = false; if (mounted.current) setBusy(false) }
  }, [adopt, blocked, cartridge, journal, scope])

  const snapshot = media.save ?? head?.snapshot ?? initialSave
  const save: StorySave = {
    ...snapshot,
    finale: epilogueActive && snapshot.finale.status === 'complete' ? { ...snapshot.finale, epilogueActive: true } : snapshot.finale,
    blocks: snapshot.blocks.map(block => block.kind === 'image' && block.data?.status !== 'ready' ? { ...block, data: { ...block.data, status: 'idle' } } : block),
  }
  const listSessions = useCallback(() => journal.listSessions(), [journal])
  const switchSession = useCallback(async (sessionId: string) => {
    if (running.current || blocked) throw new Error('SESSION_BUSY')
    running.current = true; setBusy(true); setError('')
    try {
      if (!navigator.locks) throw new Error('SESSION_LOCK_UNAVAILABLE')
      await navigator.locks.request(`story-session:${scope}`, { ifAvailable: true }, async lock => {
        if (!lock) throw new Error('SESSION_BUSY')
        const next = await journal.switchSession(sessionId)
        if (mounted.current) { adopt(next); setEpilogueActive(false); setPresentCommittedResultVersion(undefined) }
      })
    } catch (cause) {
      if (mounted.current) setError(t(cartridge.locale, cause instanceof Error && cause.message === 'SESSION_BUSY' ? 'sessionBusy' : 'sessionRecoveryNeeded'))
      throw cause
    } finally { running.current = false; if (mounted.current) setBusy(false) }
  }, [adopt, blocked, cartridge.locale, journal, scope])

  return {
    save, mode: 'aigram', setMode: () => {}, fixedSource: true, fixedLocale: true, preservesSessionOnRestart: true,
    busy, actionBlocked: blocked, loaded: Boolean(head), error, pendingAction,
    progress: busy ? { label: t(cartridge.locale, save.finale.status === 'ready' ? 'endingGenerating' : 'restoring'), percent: 20 } : null,
    canRetry: blocked && !busy,
    enter: () => { if (!blocked && !running.current && cartridge.opening.entryAction) void run('enter', cartridge.opening.entryAction) },
    act: async action => { if (!blocked && !running.current && save.entered) await run('act', action) },
    generateEnding: async () => { await finishEnding() },
    continueEpilogue: () => { if (!blocked && save.finale.status === 'complete') setEpilogueActive(true) },
    retryAction: () => { void run('open') }, useAigramFallback: () => {}, retryImage: media.retry, prepareInventoryImages: media.prepareInventory,
    restartWorld: () => { if (!blocked && !running.current) void run('restart') }, clear: async () => {},
    listSessions, switchSession, sessionId: head?.session_id, version: head?.version, cursor: head?.cursor, presentCommittedResultVersion,
  }
}
