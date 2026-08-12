import { writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const base = 'https://game.aiwaves.tech/alteru-media/api'
const prompt = `human perceptual mistranslation of dense machine-readable latent information, not a place and not an empty canvas; a vast perfectly flat matte-black and deep-charcoal non-space occupies most of the frame and stays identical edge to edge, visually distinct from a bone-white interface; no floor, no horizon, no perspective, no architecture, no stable direction, no readable distance, no vignette, no gradient, no horizontal division, no lighter or darker lower area, no cast shadow, no contact shadow and no vanishing line; one generic QA-only full-body figure tumbles sideways as if weightless, its body axis rotated 70 degrees away from vertical, both feet clearly not below its body, never upright and never standing, 34 percent of frame height and off-center; controlled soft edge light makes its complete silhouette, form, clothing outline, colors, patterns and accessories readable against black, used only to verify composition and not identity; nearby only a luminous blue color relation without an object, an irregular fur-like material trace without an animal, turning motion without a body, and a thin red filament; every trace has an irregular dissolving boundary, never a rectangle, crop, panel, frame, portal or pasted picture; mutually incompatible features do not form a scene; restrained editorial image, no close-up, no code, no matrices, no neural diagrams, no data streams, no writing, no text, no UI, 4:5 portrait`

const response = await fetch(`${base}/v1/images/generations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request_id: randomUUID(),
    session_id: 'c699e284-58a9-43ca-8edf-223cd69588c9',
    mode: 'text',
    prompt,
    reference_urls: [],
    size: { width: 512, height: 640 },
  }),
})
if (!response.ok) throw new Error(`submit failed: ${response.status} ${await response.text()}`)
let task = await response.json()
for (let attempt = 0; attempt < 90 && ['queued', 'running'].includes(task.status); attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 8_000))
  const poll = await fetch(`${base}/v1/tasks/${encodeURIComponent(task.task_id)}`)
  if (!poll.ok) throw new Error(`poll failed: ${poll.status} ${await poll.text()}`)
  task = await poll.json()
}
if (task.status !== 'succeeded' || task.media?.type !== 'image') throw new Error(JSON.stringify(task))
const image = await fetch(task.media.url)
if (!image.ok) throw new Error(`image download failed: ${image.status}`)
await writeFile(new URL('./ui/latent-art-direction-sample-v5.png', import.meta.url), Buffer.from(await image.arrayBuffer()))
console.log(JSON.stringify({ ok: true, taskId: task.task_id, url: task.media.url, width: task.media.width, height: task.media.height }))
