import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { drawMeOut } from '../src/story/cartridges/drawMeOut'
import { resolveCampaignAction } from '../src/story/engine/campaignDirector'
import { resolveDomainAction } from '../src/story/engine/domainRules'
import { buildPlayerIdentityPrompt } from '../src/story/engine/imageIdentity'
import { generateImageMedia } from '../src/shared/runtime/media'
import { applyParsedScene, createInitialSave, enterStory } from '../src/story/engine/reducer'
import type { StorySave, StoryVisualBeat } from '../src/story/types'

const sessionId = 'c699e284-58a9-43ca-8edf-223cd69588c9'
const avatar = 'https://yinxinghuan.github.io/draw-me-out/alteru-default-avatar.jpg'
const output = new URL('./ui/semantic-cohort-v11/', import.meta.url)
await mkdir(output, { recursive: true })

let save: StorySave = enterStory(createInitialSave(drawMeOut), drawMeOut)
function act(action: string): void {
  const resolution = resolveCampaignAction(save, drawMeOut, action) ?? resolveDomainAction(save, drawMeOut, action)
  if (resolution?.status !== 'accepted') throw new Error(`unaccepted QA action: ${action}`)
  save = applyParsedScene(save, { blocks: [], commands: [], raw: '' }, drawMeOut, action, undefined, undefined, undefined, resolution)
}

act('叫住换脸的路人')
act('拿走门框上的发亮按键')
act('沿着红线往前摸')
for (const entry of ['走进会贴标签的博物馆入口', '走进七年会议的入口', '走进会飞走的城市入口']) {
  act(entry)
  act(save.choices[0].label)
  act(save.choices[1].label)
  act(save.choices[2].label)
  act(save.choices[0].label)
}

const frames = save.blocks.flatMap((block) => {
  if (block.kind !== 'image' || !block.data?.visualSnapshot || !block.data?.prompt) return []
  const snapshot = JSON.parse(String(block.data.visualSnapshot)) as StoryVisualBeat
  return [{ block, snapshot, prompt: String(block.data.prompt) }]
})

const selected = [
  frames.find(({ snapshot }) => snapshot.episodeId === 'label-museum' && snapshot.shot === 'arrival'),
  frames.find(({ snapshot }) => snapshot.episodeId === 'endless-meeting' && !snapshot.playerVisible && snapshot.shot === 'consequence'),
  frames.find(({ snapshot }) => snapshot.episodeId === 'flying-city' && snapshot.playerVisible && snapshot.shot === 'problem'),
].filter((frame): frame is NonNullable<typeof frame> => Boolean(frame))
if (selected.length !== 3) throw new Error(`expected three semantic cohort frames, got ${selected.length}`)

const report: Array<Record<string, unknown>> = []
for (const [index, frame] of selected.entries()) {
  const prompt = frame.snapshot.playerVisible ? buildPlayerIdentityPrompt(frame.prompt, drawMeOut) : frame.prompt
  const task = await generateImageMedia({
    sessionId,
    requestId: randomUUID(),
    mode: frame.snapshot.playerVisible ? 'edit' : 'text',
    prompt,
    referenceUrls: frame.snapshot.playerVisible ? [avatar] : [],
    size: { width: 512, height: 640 },
  }, { timeoutMs: 12 * 60_000, pollIntervalMs: 8_000 })
  const response = await fetch(task.media.url)
  if (!response.ok) throw new Error(`download failed: ${response.status}`)
  const name = `${index + 1}-${frame.snapshot.episodeId}-${frame.snapshot.shot}-${frame.snapshot.playerVisible ? 'player' : 'world'}.png`
  await writeFile(new URL(name, output), Buffer.from(await response.arrayBuffer()))
  report.push({ name, taskId: task.task_id, locationId: frame.snapshot.locationId, shot: frame.snapshot.shot, playerVisible: frame.snapshot.playerVisible, mode: frame.snapshot.playerVisible ? 'edit' : 'text' })
}

await writeFile(new URL('report.json', output), `${JSON.stringify({ promptVersion: 11, frames: report }, null, 2)}\n`)
console.log(JSON.stringify({ ok: true, output: output.pathname, frames: report }, null, 2))
