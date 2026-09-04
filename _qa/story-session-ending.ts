import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { drawMeOut } from '../src/story/cartridges/drawMeOut'
import { buildEndingSnapshot, fallbackEndingCandidate, finalizeEnding } from '../src/story/engine/endingDirector'
import { StorySessionClient, createStorySessionHttpTransport } from '../src/story/session/storySessionClient'
import { StorySessionJournal, type StorySessionJournalStore } from '../src/story/session/storySessionJournal'
import { createStorySessionLab } from '../server/storySessionLab'
import { createDrawMeOutReadySave } from './support/draw-me-out-ready-save'

class Store implements StorySessionJournalStore {
  raw: string | null = null
  read() { return this.raw }
  write(value: string) { this.raw = value }
}

function readySave() {
  return createDrawMeOutReadySave()
}

const endingGenerator = {
  async generate(save: ReturnType<typeof readySave>, cartridge: typeof drawMeOut) {
    const snapshot = buildEndingSnapshot(save, cartridge)
    const candidate = fallbackEndingCandidate(snapshot, cartridge)
    return { snapshot, ending: finalizeEnding(candidate, snapshot, false), usedFallback: true, errors: ['QA_FALLBACK'] }
  },
}

const directory = await mkdtemp(join(tmpdir(), 'draw-me-out-ending-'))
const databasePath = join(directory, 'ending.sqlite')
let calls = 0
const service = createStorySessionLab({
  cartridge: drawMeOut, databasePath, actorTokens: { token: 'owner', other: 'other' },
  generator: { async send(): Promise<never> { throw new Error('unused') } },
  endingGenerator: { async generate(save, cartridge) { calls += 1; return endingGenerator.generate(save, cartridge as typeof drawMeOut) } },
  dropEndingResponseAfterCommit: ['lost-ending'], failEndingBeforeCommit: ['rollback-ending'],
})

try {
  const { baseUrl } = await service.listen()
  const client = (token = 'token') => new StorySessionClient(createStorySessionHttpTransport({ apiBase: baseUrl, headers: () => ({ Authorization: `Bearer ${token}` }) }))
  const initial = readySave(); const enrolled = await client().enroll(initial, 'ending-enrollment')
  const snapshot = buildEndingSnapshot(enrolled.snapshot, drawMeOut)
  const lost = client().prepareEnding(enrolled, snapshot.id, 'lost-ending')
  const completed = await client().submitEnding(lost)
  assert.equal(completed.snapshot.finale.status, 'complete')
  assert.equal(completed.snapshot.finale.snapshot?.id, snapshot.id)
  assert.equal(completed.snapshot.finale.ending?.snapshotId, snapshot.id)
  assert.equal(completed.version, enrolled.version + 1)
  assert.equal(completed.cursor, enrolled.cursor, 'ending is not an ordinary turn')
  assert.equal(completed.events.length, 0)
  assert.equal(service.endingCommittedCount(), 1)
  assert.equal(calls, 1)

  const endingPath = `${baseUrl}/api/story/sessions/${enrolled.session_id}/ending`
  const headers = { Authorization: 'Bearer token', 'Content-Type': 'application/json' }
  for (let replay = 0; replay < 3; replay += 1) {
    const response = await fetch(endingPath, { method: 'POST', headers, body: JSON.stringify({ ending_id: lost.ending_id, expected_version: lost.expected_version, ruleset_version: lost.ruleset_version, snapshot_id: lost.snapshot_id }) })
    assert.equal(response.status, 200); assert.equal((await response.json()).replayed, true)
  }
  assert.equal(service.endingCommittedCount(), 1); assert.equal(calls, 1)
  const conflict = await fetch(endingPath, { method: 'POST', headers, body: JSON.stringify({ ending_id: lost.ending_id, expected_version: lost.expected_version, ruleset_version: lost.ruleset_version, snapshot_id: `${lost.snapshot_id}-other` }) })
  assert.equal(conflict.status, 409); assert.equal((await conflict.json()).code, 'ENDING_ID_CONFLICT')
  await assert.rejects(client('other').read(enrolled.session_id), { code: 'SESSION_NOT_FOUND' })

  let endingLoss = true; let offline = false
  const fetcher: typeof fetch = async (input, init) => {
    if (offline) throw new TypeError('INJECTED_OFFLINE')
    const isEnding = init?.method === 'POST' && new URL(String(input)).pathname.endsWith('/ending')
    const response = await fetch(input, init)
    if (isEnding && endingLoss) { endingLoss = false; offline = true; await response.text(); throw new TypeError('INJECTED_ENDING_RESPONSE_LOSS') }
    return response
  }
  const journalClient = new StorySessionClient(createStorySessionHttpTransport({ apiBase: baseUrl, fetcher, headers: () => ({ Authorization: 'Bearer token' }) }))
  const store = new Store(); let journal = new StorySessionJournal(journalClient, store, 'ending-journal')
  const journalHead = await journal.open(readySave())
  const journalSnapshot = buildEndingSnapshot(journalHead.snapshot, drawMeOut)
  await assert.rejects(journal.finishEnding(journalSnapshot.id, journalHead), /INJECTED_OFFLINE/)
  assert.equal(JSON.parse(store.raw!).pendingEnding.snapshot_id, journalSnapshot.id)
  assert.equal(service.endingCommittedCount(), 2)
  offline = false; journal = new StorySessionJournal(journalClient, store, 'ending-journal')
  const journalRecovered = await journal.open()
  assert.equal(journalRecovered.snapshot.finale.snapshot?.id, journalSnapshot.id)
  assert.equal(JSON.parse(store.raw!).pendingEnding, undefined)
  assert.equal(service.endingCommittedCount(), 2, 'journal recovery does not regenerate a committed ending')

  const rollbackSession = await client().enroll(readySave(), 'rollback-enrollment')
  const rollbackSnapshot = buildEndingSnapshot(rollbackSession.snapshot, drawMeOut)
  const rollback = client().prepareEnding(rollbackSession, rollbackSnapshot.id, 'rollback-ending')
  await assert.rejects(client().submitEnding(rollback), { code: 'INTERNAL_ERROR' })
  assert.deepEqual(await client().read(rollbackSession.session_id), rollbackSession)
  assert.equal(service.endingCommittedCount(), 2)
  const recovered = await client().submitEnding(rollback)
  assert.equal(recovered.snapshot.finale.status, 'complete')
  assert.equal(service.endingCommittedCount(), 3)

  const mismatchSession = await client().enroll(readySave(), 'mismatch-enrollment')
  const mismatch = client().prepareEnding(mismatchSession, 'ending-wrong', 'mismatch-ending')
  await assert.rejects(client().submitEnding(mismatch), { code: 'ENDING_SNAPSHOT_MISMATCH' })
  assert.deepEqual(await client().read(mismatchSession.session_id), mismatchSession)
  assert.equal(service.endingCommittedCount(), 3)

  console.log(JSON.stringify({ ok: true, liveModelCalled: false, productionWrites: false, checks: [
    'ending-bound-to-frozen-snapshot', 'ending-separate-from-ordinary-turn-cursor',
    'lost-response-reconciles-by-authoritative-head', 'three-replays-one-ending-commit',
    'ending-id-payload-conflict', 'owner-isolation', 'transaction-rollback-and-retry',
    'pending-ending-persisted-before-network', 'journal-restart-reconciles-without-regeneration',
    'snapshot-mismatch-zero-write',
  ] }, null, 2))
} finally {
  await service.close().catch(() => {})
  await rm(directory, { recursive: true, force: true })
}
