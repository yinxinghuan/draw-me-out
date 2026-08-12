import assert from 'node:assert/strict'
import { drawMeOut, drawMeOutEn } from '../src/story/cartridges/drawMeOut'
import { createInitialSave, normalizeCharacterState } from '../src/story/engine/reducer'

function choicesFrom(content: string): string[] {
  const match = content.match(/\[choices:\s*"([\s\S]*?)"\]/)
  if (!match) return []
  return match[1].split('"|"').map((choice) => choice.trim())
}

function visibleProse(content: string): string {
  return content
    .split('\n')
    .filter((line) => !/^\s*\[[a-z_]+:/.test(line))
    .join('\n')
}

const forbiddenChinese = /潜空间|潜层|残差|坐标碎片|统一程序|优化器|渲染器|采样|提示词|模型参数/
const forbiddenEnglish = /\blatent (?:space|layer)\b|\bresidual\b|\bcoordinate fragments?\b|\bunifier\b|\boptimizer\b|\brenderer\b|\bsampling\b|\bmodel parameters?\b/i

const zhVisible = [
  ...drawMeOut.opening.blocks.map((block) => block.text),
  drawMeOut.opening.objective,
  ...drawMeOut.opening.choices.map((choice) => choice.label),
  ...drawMeOut.demoTurns.map((turn) => visibleProse(turn.content)),
]
assert.equal(forbiddenChinese.test(zhVisible.join('\n')), false, 'Chinese player-visible prose leaked technical jargon')

const enVisible = [
  ...drawMeOutEn.opening.blocks.map((block) => block.text),
  drawMeOutEn.opening.objective,
  ...drawMeOutEn.opening.choices.map((choice) => choice.label),
  ...drawMeOutEn.demoTurns.map((turn) => visibleProse(turn.content)),
]
assert.equal(forbiddenEnglish.test(enVisible.join('\n')), false, 'English player-visible prose leaked technical jargon')

const zhChoices = [
  ...drawMeOut.opening.choices.map((choice) => choice.label),
  ...drawMeOut.demoTurns.flatMap((turn) => choicesFrom(turn.content)),
]
assert.ok(zhChoices.length >= 18, 'Expected a meaningful set of Chinese choices')
for (const choice of zhChoices) {
  assert.ok(Array.from(choice).length <= 18, `Chinese choice is too long: ${choice}`)
  assert.equal(forbiddenChinese.test(choice), false, `Chinese choice contains jargon: ${choice}`)
}

for (const turn of [...drawMeOut.demoTurns, ...drawMeOutEn.demoTurns]) {
  assert.equal(choicesFrom(turn.content).length, 3, `Demo turn must expose exactly three choices: ${turn.match[0]}`)
}

const initialSave = createInitialSave(drawMeOut)
assert.equal(initialSave.characters.some((character) => character.id === 'residual'), false, 'Little Remnant leaked into the roster before its debut')
assert.equal(initialSave.characters.some((character) => character.id === 'default-seven'), false, 'Default Seven leaked into the roster before its debut')
const legacyPreDebut = normalizeCharacterState({
  blocks: initialSave.blocks,
  relationships: [],
  characters: drawMeOut.characters.map((character) => ({ ...character, status: 'known' as const, origin: 'cartridge' as const, updatedAtScene: 0 })),
  partyMemberIds: [],
}, drawMeOut)
assert.equal(legacyPreDebut.characters.some((character) => character.id === 'residual'), false, 'Legacy pre-debut roster was not repaired')

const residualIntroIndex = drawMeOut.demoTurns.findIndex((turn) => turn.content.includes('[character_update: character_id="residual"'))
const firstResidualChoiceIndex = drawMeOut.demoTurns.findIndex((turn) => choicesFrom(turn.content).some((choice) => choice.includes('小残')))
assert.ok(residualIntroIndex >= 0 && firstResidualChoiceIndex > residualIntroIndex, 'A choice names Little Remnant before its visible debut')
const residualIntro = visibleProse(drawMeOut.demoTurns[residualIntroIndex].content)
assert.match(residualIntro, /它不是人/)
assert.match(residualIntro, /叫我小残吧/)
assert.match(residualIntro, /向导/)

const allImagePrompts = [
  drawMeOut.opening.imagePrompt,
  ...drawMeOut.demoTurns.map((turn) => turn.imagePrompt ?? ''),
  ...drawMeOut.endingDirector.anchors.map((ending) => ending.finalImagePrompt),
]
assert.equal(allImagePrompts.some((prompt) => /black[- ]glass|white horizon/i.test(prompt)), false, 'Old spatial latent-space imagery leaked into prompts')

const latentPrompts = allImagePrompts.filter((prompt) => /latent information/i.test(prompt))
assert.ok(latentPrompts.length >= 5, 'Expected several non-spatial latent prompts')
for (const prompt of latentPrompts) {
  assert.match(prompt, /no floor/i)
  assert.match(prompt, /no horizon/i)
  assert.match(prompt, /no close-up/i)
  assert.match(prompt, /(?:30|31|32|33|34|35|36) percent/i)
}

const latentDirection = drawMeOut.sceneImageDirection ?? ''
assert.match(latentDirection, /matte near-black or deep-charcoal/i)
assert.match(latentDirection, /no vignette/i)
assert.match(latentDirection, /no (?:cast shadow|contact shadow)/i)
assert.match(latentDirection, /55 to 80 degrees/i)
assert.match(latentDirection, /30 to 36 percent/i)
assert.match(latentDirection, /silhouette, form, covering, costume, colors, patterns and accessories/i)
assert.match(latentDirection, /never look like a rectangular crop/i)

assert.deepEqual(drawMeOut.statDefinitions.map((stat) => stat.label), ['我还是我', '余力', '被发现'])
assert.deepEqual(drawMeOutEn.statDefinitions.map((stat) => stat.label), ['Still Me', 'Strength', 'Detected'])

console.log(JSON.stringify({
  ok: true,
  chineseChoices: zhChoices.length,
  latentPrompts: latentPrompts.length,
}))
