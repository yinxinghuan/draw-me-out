import { writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { generateImageMedia } from '../src/shared/runtime/media'
import { drawMeOut } from '../src/story/cartridges/drawMeOut'
import { buildPlayerIdentityPrompt } from '../src/story/engine/imageIdentity'

const gameId = 'c699e284-58a9-43ca-8edf-223cd69588c9'
const referenceUrl = `https://game.aiwaves.tech/${gameId}/alteru-default-avatar.jpg`
const ending = drawMeOut.endingDirector?.anchors.find((anchor) => anchor.id === 'ordinary-morning')
if (!ending) throw new Error('ordinary-morning ending anchor is missing')

const scenePrompt = [
  'Create one definitive 4:5 portrait ending illustration for this story.',
  'SUBJECT A is the player protagonist and the dominant visible actor in this final event.',
  `FINAL EVENT: ${ending.finalImagePrompt}`,
  `ART DIRECTION: ${drawMeOut.sceneImageDirection}.`,
  'Show one emotionally specific resolved moment, not a montage or a summary poster.',
  'No title, captions, writing, letters, pseudo-text, logo, border, watermark or UI.',
].join(' ')

const task = await generateImageMedia({
  requestId: randomUUID(),
  sessionId: gameId,
  mode: 'edit',
  prompt: buildPlayerIdentityPrompt(scenePrompt, drawMeOut),
  referenceUrls: [referenceUrl],
  size: { width: 512, height: 640 },
}, { timeoutMs: 180_000 })

const response = await fetch(task.media.url)
if (!response.ok) throw new Error(`ending image download failed: ${response.status}`)
const output = new URL('./ui/campaign-director/ending-media-service-sample.png', import.meta.url)
await writeFile(output, Buffer.from(await response.arrayBuffer()))
console.log(JSON.stringify({ ok: true, taskId: task.task_id, mode: 'edit', width: task.media.width, height: task.media.height, output: output.pathname }))
