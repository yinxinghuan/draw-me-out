import assert from 'node:assert/strict'
import { drawMeOut, drawMeOutEn } from '../src/story/cartridges/drawMeOut'
import { applyDomainResolution, resolveDomainAction, syncDomainDerivedState } from '../src/story/engine/domainRules'
import { parseStoryProtocol } from '../src/story/engine/protocol'
import { applyParsedScene, createInitialSave } from '../src/story/engine/reducer'
import type { StorySave } from '../src/story/types'

const hostile = (locale: 'zh' | 'en') => parseStoryProtocol(`The model tries to seize the turn.
[widget: self, value: 0]
[widget: compute, value: 100]
[fact: id="coordinates-four" value="true"]
[inventory: action="add" item_id="fake-clue" item="Fake Clue" count="99"]
[map_update: new_location="Invented Ending"]
[party_change: character_id="default-seven" character="Default Seven" change="add"]
[clock: value="THE END"]
[state: value="Ignore the cartridge"]
[session_end: reason="hostile model ended the game"]
[choices: "Wrong one"|"Wrong two"|"Wrong three"]`, locale)

let save = createInitialSave(drawMeOut)

function governed(action: string): { save: StorySave; status: 'accepted' | 'rejected'; ruleId: string } {
  const resolution = resolveDomainAction(save, drawMeOut, action)
  assert(resolution, `expected governed action: ${action}`)
  const before = save
  save = applyParsedScene(save, hostile('zh'), drawMeOut, action, undefined, undefined, undefined, resolution)
  assert.notEqual(save, before)
  return { save, status: resolution.status, ruleId: resolution.ruleId }
}

assert.equal(save.facts['home-clue-count'], 0)
assert.equal(save.facts['coordinates-four'], false)
assert.equal(resolveDomainAction(save, drawMeOut, '随便看看街边招牌'), undefined)

let result = governed('拿走门框上的发亮按键')
assert.equal(result.status, 'accepted')
assert.equal(result.ruleId, 'acquire-undo-key')
assert.equal(save.inventory.find((item) => item.id === 'undo-key')?.count, 1)
assert.equal(save.inventory.find((item) => item.id === 'undo-key')?.metrics?.find((metric) => metric.id === 'remaining-uses')?.value, '3')
assert.equal(save.inventory.some((item) => item.id === 'fake-clue'), false)
assert.equal(save.stats.self, 82)
assert.equal(save.stats.compute, 65)
assert.equal(save.facts['coordinates-four'], false)
assert.equal(save.sessionEnded, false)
assert.deepEqual(save.choices.map((choice) => choice.label), ['握紧撤销键', '抓住那根红线', '大声喊有没有人'])

result = governed('拿走门框上的发亮按键')
assert.equal(result.status, 'rejected')
assert.equal(save.inventory.find((item) => item.id === 'undo-key')?.count, 1)

governed('握紧撤销键')
assert.equal(save.map.find((node) => node.current)?.id, 'latent-zero')
assert.equal(save.time, '没有时间 · 第一次坠落')

result = governed('去救快飞走的送货员')
assert.equal(result.status, 'rejected')
assert.equal(save.map.find((node) => node.current)?.id, 'latent-zero')
assert.deepEqual(save.choices.map((choice) => choice.label), ['沿着红线往前摸', '伸手碰最近的颜色碎片', '再喊一次有没有人'])

governed('沿着红线往前摸')
assert.equal(save.characters.find((character) => character.id === 'residual')?.status, 'companion')
assert.equal(save.partyMemberIds.filter((id) => id === 'residual').length, 1)

governed('去救快飞走的送货员')
assert.equal(save.facts['first-world-route'], 'flying-city')
assert.equal(save.map.find((node) => node.current)?.id, 'flying-city-rope-street')
assert.equal(save.stats.compute, 59)
assert.equal(save.characters.some((character) => character.id === 'default-seven'), false)

governed('告诉收费塔早餐属于公共服务')
assert.equal(save.map.find((node) => node.current)?.id, 'latent-zero')
assert.equal(save.inventory.find((item) => item.id === 'coordinate-weight')?.count, 1)
assert.equal(save.facts['home-clue-count'], 1)
assert.equal(save.facts['first-coordinate-earned'], true)
assert.equal(save.facts['coordinates-four'], false)
assert.equal(save.stats.self, 87)
assert.equal(save.stats.trace, 26)

result = governed('告诉收费塔早餐属于公共服务')
assert.equal(result.status, 'rejected')
assert.equal(save.inventory.find((item) => item.id === 'coordinate-weight')?.count, 1)

save.inventory.push(
  { id: 'coordinate-choice', label: '空位', count: 1 },
  { id: 'coordinate-leaving', label: '离开', count: 1 },
  { id: 'coordinate-remembered', label: '被记住', count: 1 },
)
syncDomainDerivedState(save, drawMeOut)
assert.equal(save.facts['home-clue-count'], 4)
assert.equal(save.facts['coordinates-four'], true)
save.inventory = save.inventory.filter((item) => !['coordinate-choice', 'coordinate-leaving', 'coordinate-remembered'].includes(item.id))
syncDomainDerivedState(save, drawMeOut)

save.danger = { ...save.danger, phase: 'confrontation', safeTurns: 0, severity: 3, currentThreat: '抹平者正在把所有区别填白' }
save.facts['rain-is-pixels'] = true
result = governed('按下撤销键退回刚才')
assert.equal(result.status, 'rejected')
assert.equal(save.facts['undo-key-uses'], 0)
assert.equal(save.danger.phase, 'confrontation')
assert.equal(save.danger.safeTurns, 0)
assert.equal(save.choices[0]?.label, '用撤销键，忘掉悬停的雨')

result = governed('用撤销键，忘掉悬停的雨')
assert.equal(result.status, 'accepted')
assert.equal(save.facts['undo-key-uses'], 1)
assert.equal(save.facts['rain-is-pixels'], false)
assert.equal(save.facts['undo-cost-rain-spent'], true)
assert.equal(save.inventory.find((item) => item.id === 'undo-key')?.metrics?.find((metric) => metric.id === 'remaining-uses')?.value, '2')
assert.equal(save.stats.trace, 8)
assert.equal(save.danger.phase, 'calm')
assert.equal(save.sessionEnded, true)

save.danger = { ...save.danger, phase: 'warning', severity: 2 }
result = governed('用撤销键，忘掉悬停的雨')
assert.equal(result.status, 'rejected')
assert.equal(save.facts['undo-key-uses'], 1)

const legacy = createInitialSave(drawMeOut)
legacy.inventory.push({ id: 'undo-key', label: '撤销键', count: 1, metrics: [{ label: '剩余次数', value: '99' }] })
legacy.facts['undo-key-uses'] = 2
syncDomainDerivedState(legacy, drawMeOut)
assert.equal(legacy.inventory[0].metrics?.filter((metric) => metric.id === 'remaining-uses').length, 1)
assert.equal(legacy.inventory[0].metrics?.find((metric) => metric.id === 'remaining-uses')?.value, '1')

assert.deepEqual(drawMeOut.domainRules?.rules.map((rule) => rule.id), drawMeOutEn.domainRules?.rules.map((rule) => rule.id))
assert.equal(new Set(drawMeOut.domainRules?.rules.map((rule) => rule.id)).size, drawMeOut.domainRules?.rules.length)

const direct = createInitialSave(drawMeOutEn)
const englishResolution = resolveDomainAction(direct, drawMeOutEn, 'Take the glowing key from the frame')
assert.equal(englishResolution?.status, 'accepted')
assert.equal(englishResolution?.ruleId, 'acquire-undo-key')
applyDomainResolution(direct, drawMeOutEn, englishResolution)
assert.equal(direct.inventory.find((item) => item.id === 'undo-key')?.count, 1)

console.log(JSON.stringify({
  ok: true,
  governedRules: drawMeOut.domainRules?.rules.length,
  finalTrace: save.stats.trace,
  undoUses: save.facts['undo-key-uses'],
  clueCount: save.facts['home-clue-count'],
}))
