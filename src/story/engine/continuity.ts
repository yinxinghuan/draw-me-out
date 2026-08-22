import type { Choice, StoryCartridge, StorySave } from '../types'

function clean(value: string): string {
  return value.toLocaleLowerCase().replace(/[\s，。！？、,.!?;；:："“”'‘’()（）\-—_/]+/g, '')
}

function chineseTerms(value: string): string[] {
  const stripped = value
    .replace(/^(?:先|暂时|独自|去|走|前往|沿着?|循着?|跟随|追赶|寻找|搜寻|返回|回到|留下|等待|观察|查看|检查|调查|搜索|询问|告诉|帮|帮助|拒绝|接受|进入|使用|带着?|把|让|与|继续|尝试|绕到?|登上|走向|停下|休息|决定|选择)+/u, '')
    .replace(/(?:一下|一遍|下一步|当前|现在|这里|那里|周围|情况|局面|方式|事情|行动|线索|变化|继续|再说|商量|突然|刚刚|从未|出现|提过|陌生)/gu, '')
  const terms = new Set<string>()
  for (const chunk of stripped.match(/[\u3400-\u9fff]{2,}/gu) ?? []) {
    if (chunk.length <= 6) terms.add(chunk)
    for (let index = 0; index < chunk.length - 1; index += 1) terms.add(chunk.slice(index, index + 2))
  }
  return [...terms]
}

function englishTerms(value: string): string[] {
  const generic = new Set(['with', 'from', 'into', 'about', 'around', 'again', 'next', 'current', 'situation', 'continue', 'inspect', 'observe', 'check', 'ask', 'tell', 'help', 'return', 'follow', 'leave', 'wait', 'take', 'make', 'try', 'use', 'look', 'move', 'alone'])
  return [...new Set(value.toLocaleLowerCase().match(/[a-z]{4,}/g) ?? [])].filter((term) => !generic.has(term))
}

function choiceIsGrounded(choice: Choice, source: string, locale: StoryCartridge['locale']): boolean {
  const terms = locale === 'zh' ? chineseTerms(choice.label) : englishTerms(choice.label)
  if (!terms.length) return true
  const normalizedSource = clean(source)
  return terms.some((term) => normalizedSource.includes(clean(term)))
}

export function filterGroundedChoices(choices: Choice[], save: StorySave, cartridge: StoryCartridge): Choice[] {
  const visibleHistory = save.blocks
    .filter((block) => block.kind !== 'image' && !block.id.startsWith('action-'))
    .map((block) => `${block.speaker ?? ''} ${block.text}`)
  const knownPeople = save.characters.filter((character) => character.status !== 'departed').map((character) => [character.name, character.role, character.detail, character.lore].filter(Boolean).join(' '))
  const knownPlaces = save.map.filter((node) => node.visited || node.current).map((node) => [node.label, node.detail, node.lore, ...(node.facts ?? [])].filter(Boolean).join(' '))
  const knownItems = save.inventory.map((item) => [item.label, item.detail, item.effect, item.lore].filter(Boolean).join(' '))
  const priorChoices = save.choices.map((choice) => choice.label)
  const source = [...visibleHistory, ...priorChoices, save.location, save.objective, ...knownPeople, ...knownPlaces, ...knownItems].join(' ')
  return choices.filter((choice) => choiceIsGrounded(choice, source, cartridge.locale))
}
