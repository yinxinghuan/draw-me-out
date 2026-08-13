import assert from 'node:assert/strict'
import { drawMeOut } from '../src/story/cartridges/drawMeOut'
import { normalizeCampaignState, resolveCampaignAction } from '../src/story/engine/campaignDirector'
import { resolveDomainAction } from '../src/story/engine/domainRules'
import { applyParsedScene, createInitialSave, enterStory } from '../src/story/engine/reducer'
import { upgradeCurrentCampaignImage } from '../src/story/engine/imageDirector'
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
assert.match(save.decisionContext, /三道裂缝|three cracks/i)
assert.deepEqual(save.choices.map((choice) => choice.label), ['走进会飞走的城市入口', '走进说话成真的王国入口', '走进七年会议的入口'])

const order = [
  '走进会贴标签的博物馆入口',
  '走进七年会议的入口',
  '走进会飞走的城市入口',
  '走进说话成真的王国入口',
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
  assert.equal(save.campaign.phase, 'return')
  assert.equal(save.campaign.currentEpisode, save.campaign.lastCompletedEpisode)
  assert.notEqual(save.map.find((node) => node.current)?.id, 'latent-zero')
  assert.match(save.decisionContext, /回(?:到)?画外之地|return outside the pictures/i)
  assert.equal(save.choices.some((choice) => /走进|enter the/i.test(choice.label)), false)
  const clueSnapshot = JSON.parse(String(save.blocks.find((block) => block.id === `image-${save.scene}`)?.data?.visualSnapshot)) as { locationId: string; shot: string; playerVisible: boolean }
  assert.equal(clueSnapshot.shot, 'clue')
  assert.notEqual(clueSnapshot.locationId, 'latent-zero')
  assert.equal(clueSnapshot.playerVisible, false, 'clue handoff is owned by the local witness, not another player portrait')
  act(save.choices[episodeIndex % 3].label)
  assert.equal(save.scene - sceneBefore, 5)
  assert.equal(save.campaign.phase, episodeIndex === order.length - 1 ? 'finale' : 'hub')
  assert.equal(save.campaign.currentEpisode, undefined)
  assert.equal(save.campaign.hubReturnCount, episodeIndex + 1)
  assert.equal(save.map.find((node) => node.current)?.id, 'latent-zero')
  assert.match(save.decisionContext, /红线环|red-filament ring/i)
  const returnSnapshot = JSON.parse(String(save.blocks.find((block) => block.id === `image-${save.scene}`)?.data?.visualSnapshot)) as { locationId: string; shot: string; props: string[]; continuity: string[]; camera: string; planVersion: number }
  assert.equal(returnSnapshot.locationId, 'latent-zero')
  assert.equal(returnSnapshot.shot, 'return')
  assert(returnSnapshot.props.includes('one thin central red-filament transit ring'))
  assert(returnSnapshot.continuity.some((rule) => rule.includes('same frontal camera')))
  assert.equal(returnSnapshot.planVersion, 2)
  assert.match(returnSnapshot.camera, /fixed frontal/i)
  assert.equal(save.facts['home-clue-count'], episodeIndex + 1)
  assert.equal(save.campaign.completedEpisodes.length, episodeIndex + 1)
  if (episodeIndex === 0) {
    const legacyCampaign: Partial<StorySave['campaign']> = { ...save.campaign, phase: 'hub' }
    delete legacyCampaign.hubReturnCount
    delete legacyCampaign.lastCompletedEpisode
    const migrated = normalizeCampaignState(save, legacyCampaign)
    assert.equal(migrated.phase, 'return')
    assert.equal(migrated.currentEpisode, 'label-museum')
    assert.equal(migrated.hubReturnCount, 0)
  }
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
  .map((block) => JSON.parse(String(block.data?.visualSnapshot)) as { locationId: string; shot: string; avoid: string[]; camera: string; planVersion: number; playerVisible: boolean })
assert.equal(snapshots.length, 27)
assert.equal(snapshots.every((snapshot) => snapshot.locationId && snapshot.shot && snapshot.avoid.length > 0), true)
assert.equal(snapshots.every((snapshot) => snapshot.planVersion === 2 && Boolean(snapshot.camera)), true)
assert.equal(snapshots.filter((snapshot) => !['unfinished-rain-city', 'latent-zero'].includes(snapshot.locationId)).every((snapshot) => snapshot.avoid.includes('montage')), true)
assert.equal(snapshots.filter((snapshot) => snapshot.shot === 'return' && snapshot.locationId === 'latent-zero').length, 4)
const campaignSnapshots = snapshots.filter((snapshot) => !['unfinished-rain-city'].includes(snapshot.locationId) && !snapshot.shot.match(/danger/))
assert(campaignSnapshots.some((snapshot) => snapshot.playerVisible), 'campaign still needs player-owned action frames')
assert(campaignSnapshots.some((snapshot) => !snapshot.playerVisible), 'campaign must include NPC/environment-owned frames without avatar reference')
assert(snapshots.filter((snapshot) => snapshot.shot === 'arrival' && snapshot.locationId !== 'latent-zero').every((snapshot) => !snapshot.playerVisible), 'world arrivals must establish the world and local problem instead of repeating a player portrait')
const nonPlayerActionOffenders = snapshots
  .filter((snapshot) => !snapshot.playerVisible && /SUBJECT A|player portrait/i.test((snapshot as unknown as { action: string }).action))
  .map((snapshot) => (snapshot as unknown as { action: string }).action)
assert.deepEqual(nonPlayerActionOffenders, [], `non-player frames must not summon the protagonist through their action text: ${nonPlayerActionOffenders.join(' | ')}`)

const campaignPrompts = save.blocks
  .filter((block) => block.kind === 'image' && block.data?.visualSnapshot && Boolean((JSON.parse(String(block.data.visualSnapshot)) as { episodeId?: string }).episodeId))
  .map((block) => String(block.data?.prompt ?? ''))
assert(campaignPrompts.every((prompt) => prompt.includes('This is not the opening rain city')), 'every episode prompt must explicitly reject opening-rain carry-over')

const staleCurrent = reload(save)
const staleImage = staleCurrent.blocks.find((block) => block.id === `image-${staleCurrent.scene}` && block.kind === 'image')
assert(staleImage?.data)
staleImage.data.promptVersion = 10
staleImage.data.status = 'ready'
staleImage.data.url = 'https://example.com/wrong-rain-frame.png'
const repairedCurrent = upgradeCurrentCampaignImage(staleCurrent, drawMeOut)
const repairedImage = repairedCurrent.blocks.find((block) => block.id === `image-${repairedCurrent.scene}` && block.kind === 'image')
assert.equal(repairedImage?.data?.promptVersion, 11)
assert.equal(repairedImage?.data?.status, 'queued')
assert.equal(repairedImage?.data?.url, '')
assert.equal(repairedCurrent.blocks.filter((block) => block.kind === 'image' && block.data?.status === 'ready').length, staleCurrent.blocks.filter((block) => block.kind === 'image' && block.id !== staleImage.id && block.data?.status === 'ready').length, 'migration must invalidate only the visible stale scene')

console.log(JSON.stringify({
  ok: true,
  finalScene: save.scene,
  clues: save.facts['home-clue-count'],
  episodes: save.campaign.completedEpisodes,
  authoritativeImages: snapshots.length,
  reloads: save.scene,
}))
