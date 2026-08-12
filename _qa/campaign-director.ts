import assert from 'node:assert/strict'
import { drawMeOut } from '../src/story/cartridges/drawMeOut'
import { resolveCampaignAction } from '../src/story/engine/campaignDirector'
import { resolveDomainAction } from '../src/story/engine/domainRules'
import { applyParsedScene, createInitialSave, enterStory } from '../src/story/engine/reducer'
import type { StorySave } from '../src/story/types'

const reload = (save: StorySave): StorySave => JSON.parse(JSON.stringify(save)) as StorySave
let save = reload(enterStory(createInitialSave(drawMeOut), drawMeOut))

function act(action: string): void {
  const resolution = resolveCampaignAction(save, drawMeOut, action) ?? resolveDomainAction(save, drawMeOut, action)
  assert.equal(resolution?.status, 'accepted', `action must be governed and accepted: ${action}`)
  const beforeImages = save.blocks.filter((block) => block.kind === 'image').length
  save = reload(applyParsedScene(save, { blocks: [], commands: [], raw: '' }, drawMeOut, action, undefined, undefined, undefined, resolution))
  if (resolution?.ruleId.startsWith('campaign-')) {
    const image = save.blocks.find((block) => block.id === `image-${save.scene}` && block.kind === 'image')
    assert(image, `campaign action must schedule one authoritative image: ${action}`)
    assert.equal(Boolean(image.data?.visualSnapshot), true, `campaign image must persist a visual snapshot: ${action}`)
    assert.equal(save.blocks.filter((block) => block.kind === 'image').length, beforeImages + 1)
    assert.equal(save.location, save.map.find((node) => node.current)?.label)
  }
}

act('叫住换脸的路人')
act('拿走门框上的发亮按键')
act('沿着红线往前摸')
assert.equal(save.campaign.phase, 'hub')

const order = [
  '进入会给人贴标签的博物馆',
  '进入开了七年的会议',
  '进入会飞走的城市',
  '进入说话成真的王国',
]

order.forEach((entry, episodeIndex) => {
  const sceneBefore = save.scene
  act(entry)
  assert.equal(save.campaign.phase, 'entry')
  act(save.choices[episodeIndex % 3].label)
  assert.equal(save.campaign.phase, 'problem')
  act(save.choices[(episodeIndex + 1) % 3].label)
  assert.equal(save.campaign.phase, 'resolution')
  act(save.choices[(episodeIndex + 2) % 3].label)
  assert.equal(save.scene - sceneBefore, 4)
  assert.equal(save.campaign.phase, 'hub')
  assert.equal(save.campaign.currentEpisode, undefined)
  assert.equal(save.facts['home-clue-count'], episodeIndex + 1)
  assert.equal(save.campaign.completedEpisodes.length, episodeIndex + 1)
})

assert.deepEqual(save.inventory.filter((item) => item.id.startsWith('coordinate-')).map((item) => item.id).sort(), [
  'coordinate-choice',
  'coordinate-leaving',
  'coordinate-remembered',
  'coordinate-weight',
])
assert.equal(save.facts['coordinates-four'], true)
assert.equal(save.campaign.completedEpisodes.length, 4)
assert.equal(save.blocks.some((block) => block.kind === 'check'), false)

act('寻找抹平者留下的白痕')
act('用四条线索照出出口')
act('开始处理最终出口')
assert.equal(save.facts['optimizer-core-open'], true)
assert.equal(save.facts['exit-cost-known'], true)
assert.equal(save.finale.status, 'ready')
assert.equal(save.sessionEnded, true)
assert(save.characters.some((character) => character.id === 'default-seven' && character.status === 'known'))

const snapshots = save.blocks
  .filter((block) => block.kind === 'image' && block.data?.visualSnapshot)
  .map((block) => JSON.parse(String(block.data?.visualSnapshot)) as { locationId: string; shot: string; avoid: string[] })
assert.equal(snapshots.length, 19)
assert.equal(snapshots.every((snapshot) => snapshot.locationId && snapshot.shot && snapshot.avoid.includes('montage')), true)

console.log(JSON.stringify({
  ok: true,
  finalScene: save.scene,
  clues: save.facts['home-clue-count'],
  episodes: save.campaign.completedEpisodes,
  authoritativeImages: snapshots.length,
  reloads: save.scene,
}))
