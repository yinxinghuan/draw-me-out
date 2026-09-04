import { drawMeOut } from '../../src/story/cartridges/drawMeOut'
import { resolveCampaignAction } from '../../src/story/engine/campaignDirector'
import { resolveDomainAction } from '../../src/story/engine/domainRules'
import { applyParsedScene, createInitialSave, enterStory } from '../../src/story/engine/reducer'
import type { StorySave } from '../../src/story/types'

function commit(save: StorySave, action: string): StorySave {
  const resolution = resolveCampaignAction(save, drawMeOut, action) ?? resolveDomainAction(save, drawMeOut, action)
  if (resolution?.status !== 'accepted') throw new Error(`DRAW_ME_OUT_QA_ACTION_REJECTED:${action}`)
  return applyParsedScene(
    save,
    { blocks: [], commands: [], raw: '' },
    drawMeOut,
    action,
    undefined,
    undefined,
    undefined,
    resolution,
  )
}

/** A real deterministic four-world campaign head at the authored ending gate. */
export function createDrawMeOutReadySave(): StorySave {
  let save = enterStory(createInitialSave(drawMeOut), drawMeOut)
  save = commit(save, '叫住换脸的路人')
  save = commit(save, '拿走门框上的发亮按键')
  save = commit(save, '沿着红线往前摸')

  for (const entry of [
    '走进会贴标签的博物馆入口',
    '走进七年会议的入口',
    '走进会飞走的城市入口',
    '走进说话成真的王国入口',
  ]) {
    save = commit(save, entry)
    save = commit(save, save.choices[0]!.label)
    save = commit(save, save.choices[0]!.label)
    save = commit(save, save.choices[0]!.label)
    save = commit(save, save.choices[0]!.label)
  }

  save = commit(save, '寻找抹平者留下的白痕')
  save = commit(save, '用四条线索照出出口')
  save = commit(save, '开始处理最终出口')
  if (save.finale.status !== 'ready') throw new Error('DRAW_ME_OUT_QA_ENDING_NOT_READY')
  return save
}
