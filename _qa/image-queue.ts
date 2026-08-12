import assert from 'node:assert/strict'
import { createImageBlock } from '../src/story/engine/reducer'
import { newestQueuedSceneImage, recoverInterruptedImageStates } from '../src/story/useStoryEngine'

const interrupted = [
  createImageBlock('image-0', 'Opening', 'opening', 'generating'),
  createImageBlock('image-1', 'Next', 'next', 'queued'),
]
const recovered = recoverInterruptedImageStates(interrupted)
assert.equal(recovered[0].data?.status, 'queued', 'a request owned by a dead tab must not stay generating')
assert.equal(recovered[1].data?.status, 'queued')

const queue = [
  createImageBlock('image-0', 'Opening', 'opening', 'queued'),
  createImageBlock('image-1', 'Middle', 'middle', 'ready', 'https://example.com/ready.png'),
  createImageBlock('image-2', 'Current', 'current', 'queued'),
]
assert.equal(newestQueuedSceneImage(queue)?.id, 'image-2', 'the visible current scene must jump ahead of older backlog')

console.log(JSON.stringify({ ok: true, recovered: recovered[0].id, prioritized: newestQueuedSceneImage(queue)?.id }))
