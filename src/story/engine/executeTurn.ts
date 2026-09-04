import type { AdapterContext, AdapterResult, Locale, StoryCartridge, StorySave } from '../types'
import { resolveCampaignAction } from './campaignDirector'
import { buildDangerDirective } from './dangerDirector'
import { resolveDomainAction } from './domainRules'
import { parseStoryProtocol } from './protocol'
import { applyParsedScene, enterStory } from './reducer'

export interface StoryTurnGenerator {
  send(action: string, context: AdapterContext): Promise<AdapterResult>
}

export interface ExecutedStoryTurn {
  save: StorySave
  source: 'campaign' | 'domain' | 'model'
}

/** Server-compatible ordinary-turn boundary; finale generation stays separate. */
export async function executeStoryTurn(options: {
  save: StorySave
  cartridge: StoryCartridge
  action: string
  locale?: Locale
  generator: StoryTurnGenerator
}): Promise<ExecutedStoryTurn> {
  const action = options.action.trim()
  if (!action) throw new Error('Story action is required')
  const cartridge = options.cartridge
  const locale = options.locale ?? cartridge.locale
  const base = options.save
  const entryAction = cartridge.opening.entryAction?.trim()
  if (!base.entered && base.scene === 0 && !base.lastActionId && entryAction && action === entryAction) {
    return { save: enterStory(base, cartridge), source: 'domain' }
  }
  const campaignResolution = resolveCampaignAction(base, cartridge, action)
  const ruleResolution = campaignResolution ? undefined : resolveDomainAction(base, cartridge, action)
  const domainResolution = campaignResolution ?? ruleResolution
  const dangerDirective = domainResolution ? undefined : buildDangerDirective(base, cartridge, action)
  const result: AdapterResult = domainResolution
    ? { content: '' }
    : await options.generator.send(action, { cartridge, save: base, actionId: action, locale, dangerDirective })
  const parsed = parseStoryProtocol(result.content, locale)
  return {
    save: applyParsedScene(
      base, parsed, cartridge, action, result.imagePrompt, result.imageSubject,
      dangerDirective, domainResolution,
    ),
    source: campaignResolution ? 'campaign' : ruleResolution ? 'domain' : 'model',
  }
}
