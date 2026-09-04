import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/game-id'
import '../src/story/story.less'
import { StoryGameView } from '../src/story/StoryShell'
import { resolveCartridge } from '../src/story/cartridges'
import { createInitialSave } from '../src/story/engine/reducer'
import { getGameApiBase } from '../src/shared/runtime/game-id'
import { StorySessionClient, createStorySessionHttpTransport } from '../src/story/session/storySessionClient'
import { StorySessionJournal } from '../src/story/session/storySessionJournal'
import { useStorySessionEngine } from '../src/story/session/useStorySessionEngine'
import { createDrawMeOutReadySave } from './support/draw-me-out-ready-save'

if (!import.meta.env.DEV || !['127.0.0.1', 'localhost'].includes(location.hostname)) throw new Error('LOCAL_SESSION_TEST_ONLY')
const params = new URLSearchParams(location.search)
const style = document.createElement('style'); style.textContent = '#alteru-guest-banner{display:none!important}'; document.head.appendChild(style)
const locale = params.get('lang') === 'en' ? 'en' : 'zh'; document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
document.documentElement.dataset.uiVariant = 'civic'
const actor = params.get('actor') === 'qa-b' ? 'qa-b' : 'qa-a'; const runId = params.get('run') ?? 'manual'; const endingFixture = params.get('finale') === 'ready'
const scope = `${getGameApiBase()}:local-cinematic-ui:${runId}:${actor}:${locale}${endingFixture ? ':ending' : ''}`
const cartridge = resolveCartridge(null, locale); const journalKey = `story-session-journal:${scope}`
const journal = new StorySessionJournal(new StorySessionClient(createStorySessionHttpTransport({ headers: () => ({ 'X-Story-Lab-Actor': actor, 'X-Story-Lab-Locale': locale }), timeoutMs: 8_000 })), {
  read: () => alteruLocalStorage.getItem(journalKey), write: value => alteruLocalStorage.setItem(journalKey, value),
}, scope)

function fixtureSave() {
  const save = createInitialSave(cartridge)
  if (!endingFixture) return save
  return createDrawMeOutReadySave()
}

function LabGame() {
  const initialSave = useMemo(fixtureSave, [])
  const engine = useStorySessionEngine({ cartridge, journal, scope, initialSave })
  let pendingId = ''; let pendingEndingId = ''
  try { const pending = journal.peek(); pendingId = pending.pending?.action_id ?? ''; pendingEndingId = pending.pendingEnding?.ending_id ?? '' } catch { /* recovery UI owns error */ }
  return <><output hidden data-story-session-test data-session-id={engine.sessionId} data-version={engine.version} data-cursor={engine.cursor} data-scene={engine.save.scene} data-busy={engine.busy} data-blocked={engine.actionBlocked} data-pending-id={pendingId} data-pending-ending-id={pendingEndingId} data-finale={engine.save.finale.status} data-actor={actor}/><StoryGameView key={engine.sessionId ?? 'loading'} cartridge={cartridge} engine={engine} player={{ name: actor === 'qa-a' ? 'Draw QA A' : 'Draw QA B', avatarUrl: new URL('../alteru-default-avatar.jpg', location.href).href, imageRefUrl: undefined, loaded: true, source: 'debug' }} onSelect={() => {}} onLocaleChange={() => {}} uiVariant="civic"/></>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><LabGame/></React.StrictMode>)
