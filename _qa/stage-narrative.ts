import assert from 'node:assert/strict'
import { selectStageOverlay, stageNarrativeBlocks } from '../src/story/engine/stageNarrative'
import type { StoryBlock } from '../src/story/types'

const blocks: StoryBlock[] = [
  { id: 'story', kind: 'narration', text: '雨停在半空，斑马线的白线正朝两条路分开。' },
  { id: 'leak', kind: 'narration', text: 'image_subject:"player"' },
  { id: 'prompt', kind: 'narration', text: '请做出选择' },
]

assert.deepEqual(stageNarrativeBlocks(blocks).map((block) => block.id), ['story'])
assert.equal(selectStageOverlay(blocks, 'decision')?.id, 'story')
assert.equal(selectStageOverlay([{ id: 'prompt', kind: 'narration', text: '接下来，你要怎么做？' }], 'decision'), undefined)
assert.equal(selectStageOverlay([{ id: 'prompt', kind: 'narration', text: 'What will you do next?' }], 'decision'), undefined)
assert.equal(selectStageOverlay([{ id: 'prompt', kind: 'narration', text: 'Please choose an action.' }], 'decision'), undefined)
assert.equal(selectStageOverlay([{ id: 'context', kind: 'narration', text: '左边的路正在褪色，右边传来小残的呼救。' }], 'decision')?.id, 'context')
const governedResult: StoryBlock = { id: 'domain-1', kind: 'narration', text: '你已经看过的行动结果。', data: { domainStatus: 'accepted' } }
assert.equal(selectStageOverlay([governedResult], 'result')?.id, 'domain-1')
assert.equal(selectStageOverlay([governedResult], 'decision'), undefined, 'governed result must not repeat above its next choices')

console.log(JSON.stringify({ ok: true, protocolLeakHidden: true, redundantPromptHidden: true, contextKept: true, governedResultNotRepeated: true }))
