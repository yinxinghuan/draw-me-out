import assert from 'node:assert/strict'
import { drawMeOut } from '../src/story/cartridges/drawMeOut'
import { executeStoryTurn } from '../src/story/engine/executeTurn'
import { createInitialSave } from '../src/story/engine/reducer'

const initial = createInitialSave(drawMeOut)
const initialJson = JSON.stringify(initial)
let domainModelCalls = 0
const domain = await executeStoryTurn({
  save: initial,
  cartridge: drawMeOut,
  action: '碰一下停在半空的雨',
  generator: { async send(): Promise<never> { domainModelCalls += 1; throw new Error('MODEL_MUST_NOT_RUN') } },
})
assert.equal(domain.source, 'domain')
assert.equal(domainModelCalls, 0)
assert.equal(domain.save.entered, true)
assert.equal(domain.save.scene, initial.scene + 1)
assert.equal(domain.save.stats.compute, initial.stats.compute - 4)
assert.equal(domain.save.facts['rain-is-pixels'], true)
assert.equal(domain.save.objective, '从换脸路人、街边白线和远处门里选一种办法确认出口')
assert.equal(JSON.stringify(initial), initialJson, 'server pipeline must not mutate its input snapshot')

let modelCalls = 0
const model = await executeStoryTurn({
  save: initial,
  cartridge: drawMeOut,
  action: '数一数重复路人的脚步',
  generator: {
    async send() {
      modelCalls += 1
      return { content: [
        '你盯住最近的三名路人。他们每走七步就回到原位，但鞋底溅起的水花没有重置，正一层层堆在同一块白边旁。',
        '[state: value="确认白边是否是这段循环留下的出口"]',
        '[choices: "比较第七步与白边的位置"|"叫住最先回到原位的路人"|"沿水花堆积处走向远处的门"]',
      ].join('\n') }
    },
  },
})
assert.equal(model.source, 'model')
assert.equal(modelCalls, 1)
assert.equal(model.save.scene, initial.scene + 1)
assert.equal(model.save.objective, '确认白边是否是这段循环留下的出口')
assert.ok(model.save.choices.length >= 1)

console.log(JSON.stringify({ ok: true, checks: [
  'server-compatible-ordinary-turn',
  'campaign-before-domain-resolution-order',
  'governed-action-bypasses-model',
  'domain-effects-commit-together',
  'input-snapshot-remains-immutable',
  'model-proposal-enters-authoritative-reducer',
  'finale-transaction-remains-separate',
] }, null, 2))
