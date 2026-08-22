import { strict as assert } from 'node:assert'
import { drawMeOut as cartridge } from '../src/story/cartridges/drawMeOut'
import { applyParsedScene, createInitialSave, createRecoveryChoices } from '../src/story/engine/reducer'
import { parseStoryProtocol } from '../src/story/engine/protocol'

const initial = createInitialSave(cartridge)
assert.deepEqual(createRecoveryChoices(initial, cartridge), [], 'calm recovery must not invent generic quick choices')

const rejected = parseStoryProtocol(`眼前的具体事件仍在继续。
[choices: "给火星总督发电报"|"追赶从未出现的银河快递员"|"喂像素独角兽"]`, cartridge.locale)
const first = applyParsedScene(initial, rejected, cartridge, '处理眼前事件')
assert.deepEqual(first.choices, [], 'all rejected recommendations leave a free-input tray')
const second = applyParsedScene(first, rejected, cartridge, '换一种说法处理眼前事件')
assert.deepEqual(second.choices, [], 'repeated failure cannot regenerate a fixed generic menu')

const dangerSave = {
  ...initial,
  danger: { ...initial.danger, phase: 'active' as const, currentThreat: '画框正在合拢' },
}
const dangerChoices = createRecoveryChoices(dangerSave, cartridge)
assert.ok(dangerChoices.length > 0, 'active danger keeps threat-bound deterministic actions')
assert.ok(dangerChoices.every((choice) => choice.label.includes('画框正在合拢')), 'danger choices stay bound to the visible threat')

console.log(JSON.stringify({ calm: first.choices.length, repeat: second.choices.length, danger: dangerChoices.length }))
