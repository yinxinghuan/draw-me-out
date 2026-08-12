import assert from 'node:assert/strict'
import { drawMeOut } from '../src/story/cartridges/drawMeOut'
import { resolveDomainAction } from '../src/story/engine/domainRules'
import { applyParsedScene, createInitialSave, enterStory } from '../src/story/engine/reducer'
import { parseStoryProtocol } from '../src/story/engine/protocol'
import type { StorySave } from '../src/story/types'

const reload = (save: StorySave): StorySave => JSON.parse(JSON.stringify(save)) as StorySave
let save = enterStory(createInitialSave(drawMeOut), drawMeOut)

function governed(action: string): void {
  const resolution = resolveDomainAction(save, drawMeOut, action)
  assert.equal(resolution?.status, 'accepted', `governed action must be accepted: ${action}`)
  save = reload(applyParsedScene(save, { blocks: [], commands: [], raw: '' }, drawMeOut, action, undefined, undefined, undefined, resolution))
}

function generated(action: string, visibleNarration: string, commands: string): void {
  const parsed = parseStoryProtocol(`${visibleNarration}\n${commands}`, 'zh')
  save = reload(applyParsedScene(save, parsed, drawMeOut, action))
}

governed('叫住换脸的路人')
governed('拿走门框上的发亮按键')
governed('沿着红线往前摸')
governed('去救快飞走的送货员')
governed('告诉收费塔早餐属于公共服务')

assert.equal(save.facts['weight-method'], 'public-service')
assert.equal(save.facts['home-clue-count'], 1)
assert.equal(save.inventory.find((item) => item.id === 'coordinate-weight')?.count, 1)

generated('进入会贴标签的博物馆', '你和小残进入一座会反过来定义游客的博物馆。守门人胸前没有姓名牌，只用自己守了七年的侧门介绍自己。', `[map_update: new_location="会贴标签的博物馆 · 侧门" connected_to="画外之地 · 无边处"]
[state: value="撤下那块正在把守门人改写成展品的错误标签"]
[choices: "挡住自动贴来的标签"|"请守门人说出记得的名字"|"把说明牌转向空墙"]`)
generated('请守门人说出记得的名字', '守门人准确叫出你的名字，也说出小残缺掉的那片纸翼。错误标签失效；身份不只存在于一张脸里。', `[inventory: action="add" item_id="coordinate-remembered" item="回家线索 · 被记住" count="1" rarity="rare"]
[fact: id="coordinate-remembered" value="true"]
[map_update: new_location="画外之地 · 无边处" connected_to="会贴标签的博物馆 · 侧门"]
[choices: "进入说话会成真的王国"|"检查两条回家线索"|"问小残是否还记得雨城"]`)
generated('进入说话会成真的王国', '你们落进停在半句的加冕礼。天空正试图替国王决定一个名字。', `[map_update: new_location="说话会成真的王国 · 王宫" connected_to="画外之地 · 无边处"]
[state: value="让这句话留下一个不被替做的空位"]
[choices: "让国王把这句话改成问题"|"让小残咬掉最后一个词"|"报出一个根本不存在的人"]`)
generated('让国王把这句话改成问题', '问题允许沉默，天空第一次没能替任何人回答。国王把王冠里的透明缺口交给你。', `[inventory: action="add" item_id="coordinate-choice" item="回家线索 · 空位" count="1" rarity="rare"]
[fact: id="coordinate-choice" value="true"]
[map_update: new_location="画外之地 · 无边处" connected_to="说话会成真的王国 · 王宫"]
[choices: "进入永远散不了会的办公室"|"让三条线索彼此靠近"|"问小残出口会带走谁"]`)
generated('进入永远散不了会的办公室', '第三会议室仍停在第七年的最后一页。黎姨推着清洁车，先让你看见她记满日期的手套，才说大家都叫她黎姨。', `[map_update: new_location="永远散不了会的办公室 · 第三会议室" connected_to="画外之地 · 无边处"]
[state: value="让这段已经结束的经历真正散会"]
[choices: "拔掉那台没接电的投影仪"|"让黎姨问谁真的有话要说"|"举手提议现在就散会"]`)
generated('让黎姨问谁真的有话要说', '没有人举手。黎姨按灭投影仪，把废纸篓里那枚温热碎片交给你。', `[inventory: action="add" item_id="coordinate-leaving" item="回家线索 · 离开" count="1" rarity="rare"]
[fact: id="coordinate-boundary" value="true"]
[fact: id="saved-worlds-three" value="true"]
[map_update: new_location="画外之地 · 无边处" connected_to="永远散不了会的办公室 · 第三会议室"]
[choices: "让四条线索拼出出口"|"先确认出口的代价"|"寻找抹平者留下的白痕"]`)

assert.equal(save.facts['home-clue-count'], 4)
assert.equal(save.facts['coordinates-four'], true)
assert.deepEqual(save.inventory.filter((item) => item.id.startsWith('coordinate-')).map((item) => item.id).sort(), [
  'coordinate-choice', 'coordinate-leaving', 'coordinate-remembered', 'coordinate-weight',
])

generated('寻找抹平者留下的白痕', '白痕深处先出现一双擦得过分干净的鞋，再出现灰色连体服和一张礼貌的陌生脸。它说每次画面不知道该放谁，就放它进去；它给自己留下的称呼是默认七号。', `[character_update: character_id="default-seven" character="默认七号" role="抹平者的样板人"]
[fact: id="optimizer-core-open" value="true"]
[state: value="弄清出口会清理哪些仍然活着的图片世界"]
[choices: "让默认七号带路"|"沿白痕反方向走"|"用四条线索照出出口"]`)
generated('用四条线索照出出口', '四条线索拼出一扇只能承受一个完整身份的门；门一旦打开，至少三幅仍然活着的画会被当成失败结果清理。', `[fact: id="exit-cost-known" value="true"]
[fact: id="exit-erases-worlds" value="true"]
[state: value="决定谁能通过，以及画中世界是否应该被保留"]
[choices: "先让小残说完"|"检查每个世界留下的痕迹"|"开始处理最终出口"]`)

while (save.scene < 18) generated(`确认第${save.scene + 1}段旅程`, '你逐一核对带回来的线索、人物和代价，没有让任何一项被悄悄替换。', `[fact: id="campaign-audit-${save.scene + 1}" value="true"]
[choices: "继续核对出口"|"问小残是否同意"|"查看仍然亮着的画"]`)

generated('开始处理最终出口', '你把手放在出口上，确认接下来每一步都不可逆。', '[true_ending: reason="四条线索、出口代价和抹平者源头已经确认"]')
assert.equal(save.finale.status, 'ready')
assert.equal(save.sessionEnded, true)
assert(save.characters.some((character) => character.id === 'default-seven' && character.status === 'known'))

console.log(JSON.stringify({
  ok: true,
  finalScene: save.scene,
  clueCount: save.facts['home-clue-count'],
  finale: save.finale.status,
  reloads: save.scene,
}))
