import assert from 'node:assert/strict'
import { drawMeOut, drawMeOutEn } from '../src/story/cartridges/drawMeOut'
import { resolveDomainAction } from '../src/story/engine/domainRules'
import { applyParsedScene, createInitialSave, enterStory } from '../src/story/engine/reducer'
import type { StorySave } from '../src/story/types'

const emptyScene = { blocks: [], commands: [], raw: '' }
const initial = createInitialSave(drawMeOut)

assert.equal(initial.entered, false)
assert.equal(initial.scene, 0)
assert.deepEqual(initial.choices, [], 'opening must not expose a second touch-rain choice before entry resolves')
assert.equal(initial.facts['rain-is-pixels'], false)

const entered = enterStory(initial, drawMeOut)
assert.equal(entered.entered, true)
assert.equal(entered.scene, 1)
assert.equal(entered.lastActionId, '碰一下停在半空的雨')
assert.equal(entered.facts['rain-is-pixels'], true)
assert.equal(entered.facts['compute-stat-revealed'], true)
assert.equal(entered.stats.compute, 61)
assert.equal(entered.blocks.filter((block) => block.id.startsWith('action-')).length, 1)
assert.equal(entered.choices.some((choice) => /碰.*雨/.test(choice.label)), false)
assert.deepEqual(entered.choices.map((choice) => choice.label), ['叫住换脸的路人', '摸一下街边的空白', '直接跑向那扇门'])

const actions = ['叫住换脸的路人', '摸一下街边的空白', '直接跑向那扇门']
const governed = (source: StorySave, action: string): StorySave => {
  const resolution = resolveDomainAction(source, drawMeOut, action)
  assert.equal(resolution?.status, 'accepted', action)
  return applyParsedScene(source, emptyScene, drawMeOut, action, undefined, undefined, undefined, resolution)
}
const branches = actions.map((action) => {
  const source = JSON.parse(JSON.stringify(entered)) as StorySave
  return governed(source, action)
})

assert.deepEqual(branches.map((save) => save.facts['rain-city-method']), ['passerby', 'blank-edge', 'direct-door'])
assert.equal(new Set(branches.map((save) => `${save.stats.self}/${save.stats.compute}/${save.stats.trace}`)).size, 3)
assert.equal(branches[0].facts['trace-stat-revealed'], true)
assert.equal(branches[1].facts['self-stat-revealed'], true)
assert.equal(branches[2].facts['trace-stat-revealed'], true)

let flying = governed(JSON.parse(JSON.stringify(branches[0])) as StorySave, '拿走门框上的发亮按键')
flying = governed(flying, '沿着红线往前摸')
flying = governed(flying, '去救快飞走的送货员')
const flyingMethods = ['抓住送货员和早餐箱', '让小残钻进收费塔检修口', '告诉收费塔早餐属于公共服务'].map((action) => governed(JSON.parse(JSON.stringify(flying)) as StorySave, action))
assert.deepEqual(flyingMethods.map((save) => save.facts['weight-method']), ['direct-catch', 'remnant-hatch', 'public-service'])
assert.equal(new Set(flyingMethods.map((save) => `${save.stats.self}/${save.stats.compute}/${save.stats.trace}`)).size, 3)
assert(flyingMethods.every((save) => save.inventory.filter((item) => item.id === 'coordinate-weight').length === 1))
assert(flyingMethods.every((save) => save.facts['home-clue-count'] === 1))
assert.equal(flyingMethods[1].facts['residual-took-gravity-risk'], true)
assert.equal(flyingMethods[2].facts['public-gravity-precedent'], true)

const english = enterStory(createInitialSave(drawMeOutEn), drawMeOutEn)
assert.equal(english.lastActionId, 'Touch the rain frozen in midair')
assert.equal(english.facts['rain-is-pixels'], true)
assert.deepEqual(english.choices.map((choice) => choice.label), [
  'Call to the changing-face passerby',
  'Touch the blank at the street edge',
  'Run straight to the distant door',
])

console.log(JSON.stringify({
  ok: true,
  entryClicksToFirstFact: 1,
  branchFacts: branches.map((save) => save.facts['rain-city-method']),
  branchStats: branches.map((save) => save.stats),
  worldMethodFacts: flyingMethods.map((save) => save.facts['weight-method']),
  uniqueWorldMethodStats: new Set(flyingMethods.map((save) => `${save.stats.self}/${save.stats.compute}/${save.stats.trace}`)).size,
}))
