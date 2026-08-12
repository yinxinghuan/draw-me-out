import type {
  DomainActionResolution, DomainEffect, DomainRequirement, ParsedCommand, StoryBlock, StoryCartridge, StorySave,
} from '../types'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[\s，。！？、,.!?;；：:"“”'‘’()（）]+/g, '')
}

function shortDecisionContext(value: string, locale: StoryCartridge['locale']): string {
  const clean = value.replace(/\s+/g, ' ').trim()
  const max = locale === 'zh' ? 41 : 150
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trim()}…`
}

function matchStrength(source: string, keyword: string): number {
  if (source.includes(keyword)) return 200 + keyword.length
  if (!/[\u3400-\u9fff]/.test(keyword)) return 0
  let cursor = 0
  for (const character of source) {
    if (character === keyword[cursor]) cursor += 1
    if (cursor === keyword.length) return keyword.length
  }
  return 0
}

function currentMapNodeId(save: StorySave): string | undefined {
  return save.map.find((node) => node.current)?.id
}

function undoCostChoices(save: StorySave, locale: StoryCartridge['locale']): [string, string, string] {
  const choices: string[] = []
  if (save.facts['rain-is-pixels'] === true && save.facts['undo-cost-rain-spent'] !== true) {
    choices.push(locale === 'zh' ? '用撤销键，忘掉悬停的雨' : 'Use Undo and forget the suspended rain')
  }
  if (save.facts['rain-city-method'] !== 'unset' && save.facts['rain-city-method'] !== 'forgotten' && save.facts['undo-cost-door-spent'] !== true) {
    choices.push(locale === 'zh' ? '用撤销键，忘掉怎样找到门' : 'Use Undo and forget how the door was found')
  }
  if (save.facts['residual-introduction-memory'] === true && save.facts['undo-cost-remnant-spent'] !== true) {
    choices.push(locale === 'zh' ? '用撤销键，忘掉小残的自我介绍' : 'Use Undo and forget Little Remnant’s introduction')
  }
  const fallback = locale === 'zh'
    ? ['不用撤销，直接承担后果', '让小残帮忙寻找别的办法', '先观察眼前后果']
    : ['Accept the consequence without Undo', 'Ask Little Remnant for another way', 'Observe the pending consequence first']
  return [...choices, ...fallback].slice(0, 3) as [string, string, string]
}

function requirementMet(requirement: DomainRequirement, save: StorySave): boolean {
  if (requirement.type === 'map') return currentMapNodeId(save) === requirement.nodeId
  if (requirement.type === 'item') return (save.inventory.find((item) => item.id === requirement.id)?.count ?? 0) >= requirement.minCount
  if (requirement.type === 'character') {
    const character = save.characters.find((entry) => entry.id === requirement.id)
    return Boolean(character && character.status === requirement.status)
  }
  if (requirement.type === 'danger') return requirement.phases.includes(save.danger.phase)
  const value = save.facts[requirement.id]
  if (requirement.equals !== undefined && value !== requirement.equals) return false
  if (requirement.notEquals !== undefined && value === requirement.notEquals) return false
  if (requirement.min !== undefined && (!(typeof value === 'number') || value < requirement.min)) return false
  if (requirement.max !== undefined && (!(typeof value === 'number') || value > requirement.max)) return false
  return true
}

export function resolveDomainAction(save: StorySave, cartridge: StoryCartridge, action: string): DomainActionResolution | undefined {
  const source = normalized(action)
  if (!source || !cartridge.domainRules?.rules.length) return undefined
  const candidate = cartridge.domainRules.rules
    .map((rule, index) => {
      const matches = rule.match.map(normalized).map((keyword) => matchStrength(source, keyword)).filter(Boolean)
      return matches.length ? { rule, index, score: matches.length * 1000 + Math.max(...matches) } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]
  if (!candidate) return undefined
  const reasons = candidate.rule.requirements.filter((requirement) => !requirementMet(requirement, save)).map((requirement) => requirement.reason)
  const choices = candidate.rule.id === 'undo-without-cost' && reasons.length
    ? undoCostChoices(save, cartridge.locale)
    : [...(reasons.length && candidate.rule.rejectionChoices ? candidate.rule.rejectionChoices : candidate.rule.successChoices)] as [string, string, string]
  return {
    status: reasons.length ? 'rejected' : 'accepted',
    ruleId: candidate.rule.id,
    intent: candidate.rule.intent,
    effects: reasons.length ? [] : candidate.rule.effects.map((effect) => ({ ...effect })),
    reasons,
    successText: candidate.rule.successText,
    successChoices: choices,
    decisionContext: candidate.rule.decisionContext,
    visualBeat: candidate.rule.visualBeat,
  }
}

export function domainVisualBeatForAction(cartridge: StoryCartridge, action: string) {
  const source = normalized(action)
  if (!source) return undefined
  return cartridge.domainRules?.rules
    .map((rule, index) => {
      const matches = rule.match.map(normalized).map((keyword) => matchStrength(source, keyword)).filter(Boolean)
      return matches.length ? { rule, index, score: matches.length * 1000 + Math.max(...matches) } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.rule.visualBeat
}

export function domainAllowsModelCommand(command: ParsedCommand, resolution?: DomainActionResolution): boolean {
  if (!resolution) return true
  return false
}

export function domainOwnsDanger(resolution?: DomainActionResolution): boolean {
  return Boolean(resolution?.status === 'accepted' && resolution.effects.some((effect) => effect.type === 'danger'))
}

function applyInventoryEffect(save: StorySave, effect: Extract<DomainEffect, { type: 'inventory' }>): number {
  const existing = save.inventory.find((item) => item.id === effect.itemId)
  if (effect.action === 'remove') {
    if (!existing) return 0
    const removed = Math.min(existing.count, effect.count)
    existing.count -= removed
    save.inventory = save.inventory.filter((item) => item.count > 0)
    return -removed
  }
  if (existing) {
    existing.count += effect.count
    return effect.count
  }
  if (!effect.item) return 0
  save.inventory.push({
    ...effect.item,
    id: effect.itemId,
    count: effect.count,
    metrics: effect.item.metrics?.map((metric) => ({ ...metric })),
    imageStatus: effect.item.imageUrl ? 'ready' : 'idle',
  })
  return effect.count
}

export function syncDomainDerivedState(save: StorySave, cartridge: StoryCartridge): StorySave {
  cartridge.domainRules?.derivedFacts?.forEach((definition) => {
    const count = definition.itemIds.reduce((total, id) => total + (save.inventory.some((item) => item.id === id && item.count > 0) ? 1 : 0), 0)
    save.facts[definition.factId] = definition.mode === 'owned-item-count' ? count : count >= definition.threshold
  })
  cartridge.domainRules?.derivedItemMetrics?.forEach((definition) => {
    const item = save.inventory.find((entry) => entry.id === definition.itemId)
    if (!item) return
    const used = Number(save.facts[definition.factId] ?? 0)
    const value = definition.mode === 'remaining-from-used' ? String(clamp(definition.maximum - used, 0, definition.maximum)) : '0'
    const metrics = item.metrics?.map((metric) => ({ ...metric })) ?? []
    const existing = metrics.find((metric) => metric.id === definition.metricId || normalized(metric.label) === normalized(definition.label))
    if (existing) {
      existing.id = definition.metricId
      existing.label = definition.label
      existing.value = value
    } else metrics.unshift({ id: definition.metricId, label: definition.label, value })
    item.metrics = metrics
  })
  return save
}

export function applyDomainResolution(save: StorySave, cartridge: StoryCartridge, resolution?: DomainActionResolution): StoryBlock[] {
  if (!resolution) return []
  save.choices = resolution.successChoices.map((label, index) => ({ id: `domain-${save.scene}-${index}`, label }))
  if (resolution.status === 'rejected') {
    save.decisionContext = shortDecisionContext(resolution.reasons.join('；') || save.objective, cartridge.locale)
    return [{
      id: `domain-${save.scene}`, kind: 'event', text: resolution.reasons.join('；'),
      data: { domainRule: resolution.ruleId, domainStatus: 'rejected' },
    }]
  }
  const blocks: StoryBlock[] = []
  const statDeltas = new Map<string, number>()
  resolution.effects.forEach((effect) => {
    if (effect.type === 'stat') statDeltas.set(effect.id, (statDeltas.get(effect.id) ?? 0) + effect.delta)
  })
  statDeltas.forEach((requestedDelta, id) => {
    const definition = cartridge.statDefinitions.find((entry) => entry.id === id)
    if (!definition) return
    const before = save.stats[id] ?? definition.initial
    const maximum = definition.maxDelta == null ? Math.abs(requestedDelta) : Math.max(0, definition.maxDelta)
    const delta = clamp(requestedDelta, -maximum, maximum)
    const current = clamp(before + delta, definition.min, definition.max)
    save.stats[id] = current
    const applied = current - before
    if (applied) blocks.push({ id: `domain-${save.scene}-stat-${id}`, kind: 'change', text: `${definition.label} ${applied > 0 ? '+' : ''}${applied}`, data: { stat: id, delta: applied, domainRule: resolution.ruleId } })
  })
  resolution.effects.forEach((effect, index) => {
    const id = `domain-${save.scene}-${index}`
    if (effect.type === 'stat') return
    if (effect.type === 'fact') save.facts[effect.id] = effect.value
    if (effect.type === 'fact-add') save.facts[effect.id] = Number(save.facts[effect.id] ?? 0) + effect.delta
    if (effect.type === 'inventory') {
      const delta = applyInventoryEffect(save, effect)
      const verb = cartridge.locale === 'zh' ? (delta > 0 ? '获得' : '消耗') : (delta > 0 ? 'Gained' : 'Consumed')
      if (delta) blocks.push({ id, kind: 'change', text: `${verb} ${effect.item?.label ?? effect.itemId} ×${Math.abs(delta)}`, data: { itemId: effect.itemId, delta, domainRule: resolution.ruleId } })
    }
    if (effect.type === 'party') {
      const character = save.characters.find((entry) => entry.id === effect.characterId)
        ?? cartridge.characters.find((entry) => entry.id === effect.characterId)
      if (!character) return
      let target = save.characters.find((entry) => entry.id === effect.characterId)
      if (!target) {
        target = { ...character, skills: character.skills.map((skill) => ({ ...skill })), status: 'known', origin: 'cartridge', updatedAtScene: save.scene }
        save.characters.push(target)
      }
      if (effect.change === 'add') {
        if (!save.partyMemberIds.includes(target.id)) save.partyMemberIds.push(target.id)
        target.status = 'companion'
        target.joinedAtScene ??= save.scene
        target.leftAtScene = undefined
      } else {
        save.partyMemberIds = save.partyMemberIds.filter((entry) => entry !== target!.id)
        target.status = 'departed'
        target.leftAtScene = save.scene
      }
      target.updatedAtScene = save.scene
    }
    if (effect.type === 'character') {
      const definition = cartridge.characters.find((entry) => entry.id === effect.characterId)
      if (!definition || save.characters.some((entry) => entry.id === effect.characterId)) return
      save.characters.push({
        ...definition,
        skills: definition.skills.map((skill) => ({ ...skill })),
        status: 'known',
        origin: 'cartridge',
        updatedAtScene: save.scene,
      })
    }
    if (effect.type === 'map') {
      const target = save.map.find((node) => node.id === effect.nodeId)
      if (!target) return
      save.map.forEach((node) => { node.current = node.id === target.id })
      target.visited = true
      save.location = target.label
      blocks.push({ id, kind: 'event', text: `${cartridge.locale === 'zh' ? '抵达' : 'Arrived at'} ${target.label}`, data: { mapId: target.id, domainRule: resolution.ruleId } })
    }
    if (effect.type === 'danger') {
      save.danger = { phase: 'calm', safeTurns: 0, cycle: save.danger.cycle + 1, cooldownTurns: cartridge.dangerDirector?.cooldownTurns ?? 0, severity: 1, lastOutcome: effect.outcome, lastResolvedScene: save.scene }
    }
    if (effect.type === 'objective') save.objective = effect.value
    if (effect.type === 'clock') save.time = effect.value
    if (effect.type === 'session') {
      save.sessionEnded = effect.ended
      if (effect.reason) blocks.push({ id, kind: 'summary', text: effect.reason, data: { domainRule: resolution.ruleId } })
    }
    if (effect.type === 'campaign') {
      save.campaign = {
        ...save.campaign,
        ...effect.patch,
        completedEpisodes: effect.patch.completedEpisodes
          ? [...effect.patch.completedEpisodes]
          : [...save.campaign.completedEpisodes],
      }
    }
    if (effect.type === 'finale') {
      save.finale = { status: 'ready', reason: effect.reason }
      save.sessionEnded = true
      save.choices = []
    }
  })
  syncDomainDerivedState(save, cartridge)
  save.decisionContext = shortDecisionContext(resolution.decisionContext ?? resolution.successText, cartridge.locale)
  blocks.push({ id: `domain-${save.scene}`, kind: 'narration', text: resolution.successText, data: { domainRule: resolution.ruleId, domainStatus: 'accepted' } })
  return blocks
}

export function domainDirectiveContract(resolution?: DomainActionResolution): string {
  if (!resolution) return ''
  if (resolution.status === 'rejected') return `
LOCAL DOMAIN ADJUDICATION IS AUTHORITATIVE. The attempted action maps to intent "${resolution.intent}" but is illegal now: ${resolution.reasons.join(' / ')}. Narrate the concrete in-world obstruction without turning it into success. Do not emit any state-changing protocol command. End with three currently feasible choices.`
  const effectSummary = resolution.effects.map((effect) => JSON.stringify(effect)).join(' | ')
  return `
LOCAL DOMAIN ADJUDICATION IS AUTHORITATIVE. The attempted action maps to intent "${resolution.intent}" and has already been accepted. The local reducer, not you, owns this entire turn's persistent state transaction: ${effectSummary}. Narrate the visible consequence consistently. Do not emit widget, fact, inventory, map, party, encounter, state, clock, ending, or session commands. End with three feasible choices.`
}

export function domainDemoContent(resolution: DomainActionResolution): string {
  const body = resolution.status === 'accepted' ? resolution.successText : resolution.reasons.join('；')
  return `${body}\n[choices: "${resolution.successChoices[0]}"|"${resolution.successChoices[1]}"|"${resolution.successChoices[2]}"]`
}
