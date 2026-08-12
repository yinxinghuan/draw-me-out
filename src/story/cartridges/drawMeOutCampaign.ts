import type { DemoTurn, Locale, SceneImageSubject } from '../types'

interface TurnVariant {
  zhMatch: string[]
  enMatch: string[]
  zh: string
  en: string
  prompt: string
  subject?: SceneImageSubject
}

function variants(locale: Locale, items: TurnVariant[]): DemoTurn[] {
  const zh = locale === 'zh'
  return items.map((item) => ({
    match: zh ? item.zhMatch : item.enMatch,
    content: zh ? item.zh : item.en,
    imagePrompt: item.prompt,
    imageSubject: item.subject ?? 'player',
  }))
}

export function buildDrawMeOutCampaign(locale: Locale): DemoTurn[] {
  return [
    ...variants(locale, [
      {
        zhMatch: ['抓住雨滴', '悬在半空'], enMatch: ['catch a raindrop', 'hanging in midair'],
        zh: `你伸手碰到雨滴。它不是水，而是一颗冰凉的玻璃点；被你碰过以后，整条街的雨同时停住。
街对面的路人抬头看你。他眨一次眼，脸就换一张；第三张脸甚至还没有画完。
[widget: compute, remove: 4]
[fact: id="rain-is-pixels" value="true"]
[state: value="确认这座城市仍在生成，并找到画面边缘"]
[choices: "叫住最近的路人"|"摸一下街边的空白"|"跑向远处那扇门"]`,
        en: `You touch a raindrop. It is not water but a cold glass point; the entire street freezes the instant you disturb it.
Across the road, a passerby looks up. Each blink replaces the face; the third face is not even finished.
[widget: compute, remove: 4]
[fact: id="rain-is-pixels" value="true"]
[state: value="Confirm the city is still generating and find the edge of the picture"]
[choices: "Call to the nearest passerby"|"Touch the blank at the street edge"|"Run toward the distant door"]`,
        prompt: 'SUBJECT A reaches toward one impossible raindrop suspended in a half-generated rain-soaked city street, every other raindrop frozen, duplicated passersby and clean unpainted white gaps behind, one passerby face visibly unfinished but not grotesque, brisk surreal mystery, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['连续换脸', '换脸的路人'], enMatch: ['changing face', 'passerby'],
        zh: `“请问这里是哪？”你问。
路人先用老人的脸回答“今天”，再用孩子的脸回答“蓝色”，最后用一张空白脸礼貌地说：“抱歉，您的问题不在画面里。”
他说完便沿同一段人行道走了第二遍。只有远处那扇门没有重复。
[fact: id="people-repeat" value="true"]
[state: value="在城市重复以前抵达唯一没有复写的门"]
[choices: "把路人拉出这段路"|"趁街道重来时摸白边"|"直接跑向那扇门"]`,
        en: `“Where is this?” you ask.
The passerby answers “today” with an old face, “blue” with a child’s face, then politely says through a blank face, “Sorry. Your question is not in the picture.”
They walk the same pavement a second time. Only the distant door does not repeat.
[fact: id="people-repeat" value="true"]
[state: value="Reach the only unrepeated door before the city loops again"]
[choices: "Pull the passerby out of the loop"|"Touch the blank as the street repeats"|"Run to the only door that stays put"]`,
        prompt: 'SUBJECT A confronts one ordinary passerby in a half-generated rainy city, the passerby alone has an unfinished blank facial plane while duplicated copies repeat the same walk in the background, a doorway of raw unpainted color far ahead, uncanny but humane, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['没有画完的门', '通往纯色的门', '没有重复的门'], enMatch: ['raw color', 'unpainted door', 'door that does not repeat'],
        zh: `你走向门。门框之后没有房间，只有一团等待被决定的颜色。
身后的城市忽然发出翻纸声。所有路人同时转头，用同一张脸问：“你要离开画面吗？”
你还没回答，脚下的斑马线就少了一格。
[widget: trace, add: 8]
[state: value="在脚下的路消失以前穿过那扇门"]
[choices: "提醒路人街道正在消失"|"拿走门框上的发亮按键"|"立刻跳进门后的颜色"]`,
        en: `You approach the door. There is no room beyond it—only a color waiting to be decided.
The city makes the sound of a page turning. Every passerby turns with the same face and asks, “Do you want to leave the picture?”
Before you answer, one stripe disappears beneath your feet.
[widget: trace, add: 8]
[state: value="Cross before the system fills the missing ground"]
[choices: "Warn them that the street is vanishing"|"Take the glowing key from the frame"|"Jump into the color beyond the door"]`,
        prompt: 'SUBJECT A stands at a freestanding door opening into raw unnamed color while the rainy generated city folds like wet paper behind, repeated passersby all turning at once but remaining visually distinct from SUBJECT A, one glowing physical keyboard key lodged in the frame, 4:5 portrait, no writing, no letters, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['知不知道自己在画里', '知道自己'], enMatch: ['know they are inside', 'ask whether'],
        zh: `“画是什么？”那群人一起问。
下一秒，天空降下一块巨大的橡皮，试图把这个问题擦掉。你扯下门框上的发亮按键；它在掌心震动，像一个已经后悔过三次的心脏。
[inventory: action="add" item_id="undo-key" item="撤销键" count="3" rarity="legendary" detail="一枚从画面边缘撬下的实体按键，表面已有三道旧划痕" effect="可逆转一次重大后果、救回被删除的角色或重开坍缩入口；每次使用会永久删去一段记忆、关系或已确认事实" lore="它在你拿到以前就有使用痕迹，说明这可能不是你第一次来到这里" metrics="剩余次数: 3|旧划痕: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, isolated against 88 percent near-white non-space, no floor, no horizon, object only, no symbols, no readable text, square"]
[fact: id="asked-first-fourth-wall-question" value="true"]
门后的颜色塌成深井。你连同那个没得到回答的问题一起坠落。
[state: value="在纯色深井里抓住一个不会变化的东西"]
[choices: "握紧撤销键"|"抓住那根红线"|"大声喊有没有人"]`,
        en: `“What is a picture?” the crowd asks together.
An enormous eraser descends from the sky to remove the question. You tear the glowing key from the frame; it beats in your palm like a heart that has regretted something three times already.
[inventory: action="add" item_id="undo-key" item="Undo Key" count="3" rarity="legendary" detail="A physical key pried from the edge of the picture, already bearing three old scratches" effect="Reverses one major consequence, restores a deleted character, or reopens a collapsed entrance; each use permanently deletes a memory, relationship, or confirmed fact" lore="The key was already used before you found it, suggesting this may not be your first visit" metrics="Charges: 3|Old scratches: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, isolated against 88 percent near-white non-space, no floor, no horizon, object only, no symbols, no readable text, square"]
[fact: id="asked-first-fourth-wall-question" value="true"]
The color beyond the door collapses into a shaft. You fall with the unanswered question.
[state: value="Catch something in the color shaft that will not change"]
[choices: "Hold the Undo Key tight"|"Grab the thin red line"|"Shout to see if anyone is there"]`,
        prompt: 'SUBJECT A pulls a small unmarked glowing keyboard key from a doorframe as an enormous featureless eraser descends over a folding rain city, exact player identity isolated from repeated background figures, surreal dark comedy, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['撕下门框', '发亮的按键'], enMatch: ['glowing key', 'pull the'],
        zh: `按键一离开门框，整座城市立刻后悔了。建筑向上一帧倒退，雨水飞回云里，那个换脸的路人退回一句尚未说出口的话。
你看见按键上已有三道旧划痕——显然有人在你之前，或者某个你，已经用过它。
[inventory: action="add" item_id="undo-key" item="撤销键" count="3" rarity="legendary" detail="从画面边缘撬下的实体按键，表面已有三道旧划痕" effect="可逆转一次重大后果、救回被删除的角色或重开坍缩入口；每次使用会永久删去一段记忆、关系或已确认事实" lore="它在你拿到以前就有使用痕迹，说明这可能不是你第一次来到这里" metrics="剩余次数: 3|旧划痕: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, isolated against 88 percent near-white non-space, no floor, no horizon, object only, no symbols, no readable text, square"]
门后的颜色塌成深井，把你拉了进去。
[state: value="在纯色深井里抓住一个不会变化的东西"]
[choices: "握紧撤销键"|"抓住那根红线"|"大声喊有没有人"]`,
        en: `The instant the key leaves the frame, the entire city regrets itself. Buildings retreat one frame, rain flies back into clouds, and the changing-face passerby backs into an unsaid sentence.
Three old scratches mark the key. Someone before you—or some version of you—has already used it.
[inventory: action="add" item_id="undo-key" item="Undo Key" count="3" rarity="legendary" detail="A physical key pried from the edge of the picture, already bearing three old scratches" effect="Reverses one major consequence, restores a deleted character, or reopens a collapsed entrance; each use permanently deletes a memory, relationship, or confirmed fact" lore="The key was already used before you found it, suggesting this may not be your first visit" metrics="Charges: 3|Old scratches: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, isolated against 88 percent near-white non-space, no floor, no horizon, object only, no symbols, no readable text, square"]
The color beyond the door collapses into a shaft and pulls you in.
[state: value="Catch something in the color shaft that will not change"]
[choices: "Hold the Undo Key tight"|"Grab the thin red line"|"Shout to see if anyone is there"]`,
        prompt: 'SUBJECT A tears a small unmarked glowing keyboard key from the only door as an unfinished rainy city visibly rewinds, rain rising and architecture folding backward, exact complete player identity, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['跳进没有名字的颜色', '跳进'], enMatch: ['jump into the color', 'color with no name'],
        zh: `你跳了。那种颜色先试图把你画成英雄，又改成游客，最后干脆把“人”这个选项取消。
你从门框上顺手扯下一枚发亮按键。它有三道旧划痕，仿佛另一个你已经失败过三次。
[inventory: action="add" item_id="undo-key" item="撤销键" count="3" rarity="legendary" detail="从画面边缘撬下的实体按键，表面已有三道旧划痕" effect="可逆转一次重大后果、救回被删除的角色或重开坍缩入口；每次使用会永久删去一段记忆、关系或已确认事实" lore="它在你拿到以前就有使用痕迹，说明这可能不是你第一次来到这里" metrics="剩余次数: 3|旧划痕: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, isolated against 88 percent near-white non-space, no floor, no horizon, object only, no symbols, no readable text, square"]
[widget: self, remove: 6]
[state: value="在纯色深井里保住自己的完整轮廓"]
[choices: "握紧撤销键"|"抓住那根红线"|"大声喊有没有人"]`,
        en: `You jump. The color first tries to paint you as a hero, changes its mind and makes you a tourist, then removes “person” as an option entirely.
On the way through, you tear a glowing key from the frame. Three old scratches suggest another you has already failed three times.
[inventory: action="add" item_id="undo-key" item="Undo Key" count="3" rarity="legendary" detail="A physical key pried from the edge of the picture, already bearing three old scratches" effect="Reverses one major consequence, restores a deleted character, or reopens a collapsed entrance; each use permanently deletes a memory, relationship, or confirmed fact" lore="The key was already used before you found it, suggesting this may not be your first visit" metrics="Charges: 3|Old scratches: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, isolated against 88 percent near-white non-space, no floor, no horizon, object only, no symbols, no readable text, square"]
[widget: self, remove: 6]
[state: value="Keep your complete outline inside the color shaft"]
[choices: "Hold the Undo Key tight"|"Grab the thin red line"|"Shout to see if anyone is there"]`,
        prompt: 'SUBJECT A leaps through a doorway into a shaft of raw pigments and unfinished geometry, the reference identity remains exact while rejected generic hero and tourist silhouettes peel away like discarded drafts, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['握紧撤销键', '抓住那根红线', '有没有人'], enMatch: ['Undo Key tight', 'thin red line', 'anyone is there'],
        zh: `你不再下坠，却也没有落地。
四周一下子黑了，却不像夜晚：没有地面，没有天空，甚至看不出黑暗在哪里结束。某种蓝色一闪而过，旁边浮着一小片像毛发的质感，却没有动物；一个“转身”的动作发生了，却没有身体。
你明白的只有一件事：这里的信息太多，而你的眼睛几乎什么都读不出来。
[map_update: new_location="画外之地 · 无边处" connected_to="未完成的雨城" detail="没有地面、远近和方向的深黑无边处，只偶尔显出颜色关系、材质与动作残影" lore="这里不是真的黑；只是人的眼睛无法读懂其中绝大多数内容" facts="零碎特征会短暂拼成入口|这里会记住带回来的东西"]
[fact: id="latent-layer-found" value="true"]
[clock: value="没有时间 · 第一次返回"]
[state: value="弄清这片无边处还有谁，并找到回家的方向"]
[choices: "沿着红线往前摸"|"伸手碰最近的颜色碎片"|"再喊一次有没有人"]`,
        en: `You stop falling without landing anywhere.
Everything goes black, but not like night. There is no ground, no sky, and no way to tell where the darkness ends. A relation between two blues flickers beside fur-like texture with no animal. The motion of turning happens without a body.
Only one thing makes sense: there is too much information here, and your eyes can read almost none of it.
[map_update: new_location="Outside the Pictures · The Boundless" connected_to="Unfinished Rain City" detail="A matte-black non-space with no floor, depth, or direction, briefly yielding color relations, material hints, and motion traces" lore="It is not truly black; human eyes simply cannot decode most of what is here" facts="Loose features can briefly form entrances|This place remembers what returns"]
[fact: id="latent-layer-found" value="true"]
[clock: value="No time · First return"]
[state: value="Find who else is in the Boundless and locate a direction home"]
[choices: "Feel forward along the red line"|"Touch the nearest scrap of color"|"Call out once more"]`,
        prompt: 'human perceptual mistranslation of dense latent information as a vast matte near-black non-space with no floor, no horizon, no perspective, no architecture and no stable scale; SUBJECT A is a recognizable full-body figure 34 percent of frame height, drifting sideways and reaching toward a thin red filament; controlled soft edge light reveals the exact complete reference identity silhouette, form, covering, costume, colors, patterns and accessories without inventing traits; nearby only a luminous relation between two blue color fields without an object, fur-like texture without an animal, and turning motion without a body, all with irregular dissolving edges and never forming a scene; no close-up, no cast shadow, no code, no data stream, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['红线往前', '颜色碎片', '再喊一次'], enMatch: ['red line', 'scrap of color', 'Call out once'],
        zh: `红线忽然打了个结。结里漏出一只小东西：像没折完的白纸鸟，边缘缺了几块，尾巴是一截红线。
“坏消息，”它说，“你可能是个人。”
它停顿一下，像是在确认自己有没有被删掉。
“好消息：系统暂时没发现。”
[character_update: character_id="residual" character="小残" role="画外向导" detail="像没折完的白纸鸟，边缘缺块，尾巴是一截红线" lore="系统给没删干净的东西起了一个又长又难听的名字；它只记住最后一个字，自称小残。知道几条逃生经验，却不懂这里的原理" vitality="88" stress="31" skills="找门: 6|装死: 5|只说一半实话: 4"]
[party_change: character_id="residual" character="小残" change="add" role="画外向导" detail="像没折完的白纸鸟，边缘缺块，尾巴是一截红线" lore="没被删干净的小东西，能感觉到一幅画什么时候快要散掉"]
[fact: id="residual-met" value="true"]
“我不知道这里真正长什么样。”小残说，“这片黑，大概只是你的眼睛放弃了。”
三组碎片短暂拼出画面：快飞上天的送货员、说不完继承人名字的国王、以及一群开了七年会的人。
[state: value="选一个眼前的麻烦，帮完以后寻找回家线索"]
[choices: "去救快飞走的送货员"|"去帮国王说完一句话"|"去结束那场七年会议"]`,
        en: `The red filament ties itself into a knot. Something crawls out: the outline of a white origami bird, shedding black pixels from its wings, with a red cursor for a tail.
“Bad news,” it says. “You may be a person.”
It pauses as if waiting for a progress bar you cannot see.
“Good news: the system has not noticed yet.”
[character_update: character_id="residual" character="Little Remnant" role="Guide outside pictures" detail="A small creature made from a white origami-bird outline, broken black pixels, and a red cursor tail" lore="The system has an ugly technical name for things it failed to delete; it chose Little Remnant instead. It knows escape tricks, not the theory behind this place" vitality="88" stress="31" skills="Find Seams: 6|Play Dead: 5|Tell Half a Truth: 4"]
[party_change: character_id="residual" character="Little Remnant" change="add" role="Guide outside pictures" detail="A small creature made from a white origami-bird outline, broken black pixels, and a red cursor tail" lore="A small life the system failed to erase, able to sense when a picture is about to collapse"]
[fact: id="residual-met" value="true"]
“I do not know what this truly looks like,” Little Remnant says. “The darkness may just be your eyes giving up.”
Three loose feature clusters briefly suggest a courier flying away, a king unable to finish naming an heir, and workers trapped in a seven-year meeting.
[state: value="Choose one visible problem, help someone, and look for a Home Clue"]
[choices: "Save the courier drifting away"|"Help the king finish one sentence"|"End the seven-year meeting"]`,
        prompt: 'human perceptual mistranslation of dense latent information as a vast matte near-black non-space with no floor, no horizon, no perspective, no architecture and no stable objects; SUBJECT A is a recognizable full-body figure 33 percent of frame height drifting beside Little Remnant, a much smaller incomplete white origami-cursor fragment; controlled soft edge light reveals the exact complete reference identity; three luminous mutually incompatible feature clusters merely suggest upward motion with a breakfast color, crown-metal highlights around an unfinished speaking gesture, and fluorescent office texture without forming rooms or portals; no picture frames, no close-up, no cast shadow, no code, no data stream, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['快飞走的送货员'], enMatch: ['courier drifting away'],
        zh: `你穿过画框，立刻开始向天空坠落。
这座未来城市把重力按月出售。富人走在人行道上，穷人用绳子把自己拴在路灯上；一名送货员的十五分钟试用期刚刚结束，正抱着一箱早餐缓慢升空。
[map_update: new_location="会飞走的城市 · 绳索街" connected_to="画外之地 · 无边处" detail="没钱的人只能用绳索把自己拴在街上；收费塔决定谁能踩到地面" lore="这里把落地当成收费服务，大多数人每天只有十五分钟不会飞走" facts="送货员正在升空|收费塔控制本区重力"]
[widget: compute, remove: 6]
[state: value="先救下送货员，再想办法让这条街的人落地"]
[choices: "抓住送货员和早餐箱"|"让小残钻进收费塔检修口"|"告诉收费塔早餐属于公共服务"]`,
        en: `You cross the frame and immediately begin falling upward.
This future city sells gravity by the month. The wealthy walk on pavements; the poor tie themselves to lampposts. A courier’s fifteen-minute trial has just expired, and they rise slowly while hugging a box of breakfast.
[map_update: new_location="The Flying City · Rope Street" connected_to="Outside the Pictures · The Boundless" detail="A bright future city where gravity is sold by subscription and poorer streets survive with ropes and catch nets" lore="The city treats standing on the ground as a premium service" facts="A courier is rising|The billing tower controls local gravity"]
[widget: compute, remove: 6]
[state: value="Save the rising courier and find a loophole in the billing tower"]
[choices: "Catch the courier and breakfast box"|"Send Little Remnant into the service hatch"|"Claim breakfast is a public service"]`,
        prompt: 'SUBJECT A enters a bright retro-future city and is pulled upward, reaching toward a distinct local courier rising with a breakfast box, residents tethered to elegant lampposts and catch nets, playful social science fiction, exact player identity only on SUBJECT A, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['国王说完一句话'], enMatch: ['king finish one sentence'],
        zh: `你穿过画框，落进一场停在半句上的加冕礼。
国王举着王冠说：“今日，我将把王位传给——”天空里的预言正替他自动补全。每当有人猜一个名字，城堡就为那个人长出一座牢房。
[map_update: new_location="说话会成真的王国 · 王宫" connected_to="画外之地 · 无边处" detail="天空总抢着替人把一句话说完，说错一个名字就会多出一座牢房" lore="这里的人不敢把话说完，因为天空总把最坏的结尾变成真的" facts="国王不敢说出继承人|每个错误名字都会生成牢房"]
[widget: trace, add: 5]
[state: value="在预言补完名字以前结束这句加冕词"]
[choices: "让国王把这句话改成问题"|"让小残咬掉最后一个词"|"报出一个根本不存在的人"]`,
        en: `You cross the frame and land in a coronation frozen halfway through a sentence.
The king holds up the crown: “Today I pass the throne to—” A prophecy in the sky is trying to autocomplete him. Every guessed name makes the castle grow a prison for that person.
[map_update: new_location="The Kingdom Where Words Come True · Palace" connected_to="Outside the Pictures · The Boundless" detail="A storybook kingdom where a sentence in the sky completes every spoken thought" lore="People learned to speak in fragments because the sky never permits silence" facts="The coronation is stuck on the heir’s name|Every wrong name creates a prison"]
[widget: trace, add: 5]
[state: value="End the coronation sentence before the prophecy supplies a name"]
[choices: "Ask the king to turn it into a question"|"Have Little Remnant bite off the last word"|"Name someone who does not exist"]`,
        prompt: 'SUBJECT A arrives inside a richly colored storybook coronation frozen mid-gesture, a distinct elderly king holds a crown, unfinished luminous prophecy shapes gather in the sky without letters, empty prison towers sprout from the castle, exact player identity, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['七年会议'], enMatch: ['seven-year meeting'],
        zh: `你穿过画框，坐进一场已经开了七年的周会。
主管每翻一页空白幻灯片，办公室就换一种类型：侦探片的百叶窗、爱情片的雨、灾难片的警报。只有保洁员黎姨继续拖地，显然已经见惯了。
[map_update: new_location="永远散不了会的办公室 · 第三会议室" connected_to="画外之地 · 无边处" detail="一句‘再补充一点’让这场会开了七年，每翻一页，房间就变成另一种故事" lore="会议从未作出决定，所以这里连自己是什么地方都决定不了" facts="主管不肯结束最后一页|保洁员黎姨记得外面还有生活"]
[widget: self, remove: 4]
[state: value="结束周会，同时保住唯一记得前六年的人"]
[choices: "拔掉那台没接电的投影仪"|"让黎姨问谁真的有话要说"|"举手提议现在就散会"]`,
        en: `You cross the frame and sit down in a Monday meeting that has lasted seven years.
Every time the manager advances a blank slide, the office changes genre: detective blinds, romantic rain, disaster alarms. Only Auntie Li, the cleaner, keeps mopping. She has clearly seen it all.
[map_update: new_location="The Endless Meeting · Room Three" connected_to="Outside the Pictures · The Boundless" detail="An ordinary office where each blank slide changes the kind of story everyone is trapped in" lore="The meeting never reached a decision, so the world never learned how to end" facts="The manager controls the slides|Auntie Li remembers every version"]
[widget: self, remove: 4]
[state: value="End the meeting without losing the only person who remembers the previous six years"]
[choices: "Unplug the projector with no cable"|"Ask Auntie Li who truly needs to speak"|"Raise your hand and end the meeting now"]`,
        prompt: 'SUBJECT A sits in a painfully ordinary office meeting as the room visibly fractures between noir blinds, romantic rain and disaster lighting, distinct older cleaner Auntie Li calmly mopping through all genres, gray-humor cinematic collage but coherent anatomy, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['送货员', '计费缝隙', '系统更新'], enMatch: ['courier', 'billing seam', 'system update'],
        zh: `你的办法真的奏效了——严格说，是以收费系统最不喜欢的方式奏效。计费塔承认“早餐仍然热着”属于城市基础设施，于是整条街获得十分钟公共重力。
送货员把一枚沉甸甸的蓝色碎片交给你：“这是我第一次站着把东西送到。”
[inventory: action="add" item_id="coordinate-weight" item="回家线索 · 重量" count="1" rarity="rare" detail="一枚沉甸甸的蓝色碎片，拿起时会让周围东西重新落地" effect="在漂浮、幻觉或外形混乱时，让你暂时站稳一次" lore="会飞走的城市里，那名送货员第一次双脚落地后交给你" metrics="证明: 身体有重量|已找到: 1 / 4" image_prompt="single dense cobalt home-clue fragment against a near-blank neutral field, bending one thin red filament, one disconnected blue color relation, object only, no floor, no horizon, no symbols, no writing, square"]
[fact: id="coordinate-body" value="true"]
[widget: self, add: 5]
[widget: trace, add: 8]
远处的收费塔终于发现你不在名单里。小残咬开画面一角，你们从成形的街道掉回无法读懂的黑暗。
[map_update: new_location="画外之地 · 无边处" connected_to="会飞走的城市 · 绳索街" detail="没有地面与远近的深黑无边处，多出一小段向下坠落的蓝色重量感" facts="带回回家线索·重量|会飞走的城市仍记得十分钟公共重力"]
[clock: value="没有时间 · 第二次返回"]
[state: value="问清回家还缺什么，或者自己寻找下一扇门"]
[choices: "问小残回家还缺什么"|"把刚拿到的线索放开"|"自己描述一扇新门"]`,
        en: `Your plan works—technically, in the way billing systems hate most. The tower accepts that “breakfast still being hot” counts as infrastructure, granting ten minutes of public gravity to the street.
The courier gives you a heavy blue fragment. “First delivery I ever made standing up.”
[inventory: action="add" item_id="coordinate-weight" item="Home Clue · Weight" count="1" rarity="rare" detail="A heavy cobalt fragment that makes nearby things fall again" effect="Lets you stand firm once during floating, illusion, or identity drift" lore="Given by the courier after standing on both feet for the first time" metrics="Proof: Bodies have weight|Found: 1 / 4" image_prompt="single dense cobalt home-clue fragment against a near-blank neutral field, bending one thin red filament, one disconnected blue color relation, object only, no floor, no horizon, no symbols, no writing, square"]
[fact: id="coordinate-body" value="true"]
[widget: self, add: 5]
[widget: trace, add: 8]
The tower finally notices you are not on its list. Little Remnant bites open a corner, and you fall from a formed street into unreadable darkness.
[map_update: new_location="Outside the Pictures · The Boundless" connected_to="The Flying City · Rope Street" detail="Matte-black non-space without floor or depth now carries one small blue sensation of falling downward" facts="Home Clue: Weight returned|The city remembers ten minutes of public gravity"]
[clock: value="No time · Second return"]
[state: value="Ask what else home requires or find the next door yourself"]
[choices: "Ask what else home needs"|"Release the clue into the blank"|"Describe a new door yourself"]`,
        prompt: 'return to humanly unreadable latent information as a vast matte near-black non-space with no floor, no horizon, no perspective and no portals; SUBJECT A is a recognizable full-body figure 34 percent of frame height drifting sideways while holding one dense cobalt home-clue fragment, beside smaller Little Remnant; controlled soft edge light reveals the exact complete reference identity; one downward-weight sensation appears as a short luminous blue relation without an object, plus two incompatible irregular texture traces; no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
      {
        zhMatch: ['预言', '不存在的名字', '最后一个词'], enMatch: ['prophecy', 'nonexistent name', 'final word'],
        zh: `你没有战胜预言；你让它第一次说不完一句话。王国发现沉默并不是错误，而是一种谁都不能替别人填写的权利。
国王把王冠拆下一小段，里面藏着一枚透明碎片：“它叫空位。请别急着把它填上。”
[inventory: action="add" item_id="coordinate-choice" item="回家线索 · 空位" count="1" rarity="rare" detail="一枚透明碎片，中间总留着一块谁也不能替你填满的空位" effect="可以挡住一次别人替你决定的命运或错误称呼" lore="说话会成真的王国第一次允许沉默后，国王从王冠里取出" metrics="证明: 选择需要空位|已找到: 1 / 4" image_prompt="single transparent home-clue fragment with one deliberate empty center, near-blank neutral field, one small crown-metal feature without a full crown, no floor, no horizon, no symbols, no writing, object only, square"]
[fact: id="coordinate-choice" value="true"]
[widget: trace, add: 9]
天空开始替你决定你是谁。小残赶在第一个称呼落下前，把你拖回无边处。
[map_update: new_location="画外之地 · 无边处" connected_to="说话会成真的王国 · 王宫" detail="无法判断远近的深黑无边处，多出一块谁也不能填满的透明缺口" facts="带回回家线索·空位|王国保留了沉默权"]
[clock: value="没有时间 · 第二次返回"]
[state: value="问清回家还缺什么，或者自己寻找下一扇门"]
[choices: "问小残回家还缺什么"|"把刚拿到的线索放开"|"自己描述一扇新门"]`,
        en: `You do not defeat the prophecy. You make it fail to finish one sentence. The kingdom learns that silence is not an error but a right no one may fill for someone else.
The king removes a sliver from the crown. A transparent fragment waits inside. “It is called a blank. Please do not hurry to fill it.”
[inventory: action="add" item_id="coordinate-choice" item="Home Clue · Blank" count="1" rarity="rare" detail="A transparent fragment whose center keeps one space nobody else can fill" effect="Blocks one destiny or false name chosen for you" lore="Removed from the crown after the kingdom first allowed silence" metrics="Proof: Choice needs room|Found: 1 / 4" image_prompt="single transparent home-clue fragment with one deliberate empty center, near-blank neutral field, one small crown-metal feature without a full crown, no floor, no horizon, no symbols, no writing, object only, square"]
[fact: id="coordinate-choice" value="true"]
[widget: trace, add: 9]
The sky begins finishing your identity for you. Little Remnant drags you back before the first false name lands.
[map_update: new_location="Outside the Pictures · The Boundless" connected_to="The Kingdom Where Words Come True · Palace" detail="Unreadable matte-black non-space now carries one transparent gap nobody can fill" facts="Home Clue: Blank returned|The kingdom preserved the right to silence"]
[clock: value="No time · Second return"]
[state: value="See how the clue changed the blank and choose what comes next"]
[choices: "Ask what else home needs"|"Release the clue into the blank"|"Describe a new door yourself"]`,
        prompt: 'return to humanly unreadable latent information as a vast matte near-black non-space with no floor, no horizon, no perspective and no portals; SUBJECT A is a recognizable full-body figure 33 percent of frame height drifting sideways with a transparent home-clue fragment, smaller Little Remnant nearby; controlled soft edge light reveals the exact complete reference identity; one crown-metal glint without a crown and one unfinished speaking gesture without a face remain as luminous irregular traces; no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
      {
        zhMatch: ['投影仪', '黎姨', '散会'], enMatch: ['projector', 'Auntie Li', 'adjourn'],
        zh: `黎姨把拖把往会议桌上一横：“谁还有必须现在说的话？”
七年里第一次，没有人翻页。办公室安静下来，露出它原本只是一间普通房间。黎姨从废纸篓里捡出一枚灰白碎片：“这个叫下班。真人总得能离开一个地方。”
[inventory: action="add" item_id="coordinate-leaving" item="回家线索 · 离开" count="1" rarity="rare" detail="一枚温热的灰白碎片，靠近没有出口的地方时会发热" effect="可以打开一次被习惯、命令或恐惧锁死的出口" lore="七年会议第一次散会后，黎姨从废纸篓里捡出来交给你" metrics="证明: 人可以结束一段经历|已找到: 1 / 4" image_prompt="single warm gray home-clue fragment with one worn brass-key material hint against a near-blank neutral field, no full key, no floor, no horizon, no symbols, no writing, object only, square"]
[fact: id="coordinate-boundary" value="true"]
[widget: self, add: 7]
主管在门口喊“等一下”，世界差点又开始。你和小残在第二句话以前回到无边处。
[map_update: new_location="画外之地 · 无边处" connected_to="永远散不了会的办公室 · 第三会议室" detail="无法判断方向的深黑无边处，多出一种门终于关上的温热感觉" facts="带回回家线索·离开|七年会议第一次散会"]
[clock: value="没有时间 · 第二次返回"]
[state: value="看看这条线索怎样改变了空白，再决定下一步"]
[choices: "问小残回家还缺什么"|"把刚拿到的线索放开"|"自己描述一扇新门"]`,
        en: `Auntie Li lays her mop across the conference table. “Does anyone have something that absolutely must be said now?”
For the first time in seven years, nobody advances the slide. The office becomes an ordinary room. Li retrieves a warm gray fragment from the bin. “This is called leaving work. Real people must be able to leave a place.”
[inventory: action="add" item_id="coordinate-leaving" item="Home Clue · Leaving" count="1" rarity="rare" detail="A warm gray fragment that heats near places with no exit" effect="Opens one way out locked by habit, orders, or fear" lore="Given by Auntie Li after the seven-year meeting ended" metrics="Proof: A person can end an experience|Found: 1 / 4" image_prompt="single warm gray home-clue fragment with one worn brass-key material hint against a near-blank neutral field, no full key, no floor, no horizon, no symbols, no writing, object only, square"]
[fact: id="coordinate-boundary" value="true"]
[widget: self, add: 7]
The manager calls “one more thing” from the door and the world nearly restarts. You and Little Remnant return before the second sentence.
[map_update: new_location="Outside the Pictures · The Boundless" connected_to="The Endless Meeting · Room Three" detail="Unreadable matte-black non-space now carries the warm sensation of a door finally closing" facts="Home Clue: Leaving returned|The seven-year meeting ended"]
[clock: value="No time · Second return"]
[state: value="See how the clue changed the blank and choose what comes next"]
[choices: "Ask what else home needs"|"Release the clue into the blank"|"Describe a new door yourself"]`,
        prompt: 'return to humanly unreadable latent information as a vast matte near-black non-space with no floor, no horizon, no perspective and no portals; SUBJECT A is a recognizable full-body figure 34 percent of frame height drifting sideways with a warm gray home-clue fragment, smaller Little Remnant nearby; controlled soft edge light reveals the exact complete reference identity; fluorescent texture without a room and the sensation of a closing door without a door remain as luminous irregular traces; no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['问小残回家还缺什么'], enMatch: ['what else home needs'],
        zh: `小残绕着线索飞了两圈。
“别问我原理，我也不懂。我只见过那扇门认四样东西：身体真的有重量，选择真是你自己做的，一段经历能被你结束，还有——有人记得你是谁。”
说到这里，它忽然盯住你身旁一块更深的黑暗。
“就是那里。每次你犹豫，那里会多出两三个方框。你看不见吗？”
它念出了你刚才没有选择的另外两项。
黑暗里，有什么东西也跟着念了一遍。
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 14]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="在那个声音找到你以前，决定要不要相信小残"]
[choices: "让小残说它还看见什么"|"用线索盖住那道回声"|"马上躲进另一幅画"]`,
        en: `Little Remnant circles the clue twice.
“Do not ask me how it works. The door accepts four things: a body with weight, a choice you made yourself, an experience you can end, and someone who remembers who you are.”
Then it stares at a patch of blankness beside you.
“There. Whenever you hesitate, two or three boxes appear. You cannot see them?”
It recites the two choices you did not make.
Something in the blank repeats them.
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 14]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="Decide whether to trust Little Remnant before the repeating voice finds you"]
[choices: "Ask what else it can see"|"Cover the echo with the clue"|"Hide inside another picture"]`,
        prompt: 'humanly unreadable latent information as a vast matte near-black non-space with no floor, no horizon, no perspective and no stable scale; SUBJECT A is a recognizable full-body figure 33 percent of frame height drifting sideways, Little Remnant hovers as a much smaller incomplete origami-cursor fragment staring beyond the image edge; controlled soft edge light reveals the exact complete reference identity; one home-clue color relation and three repeated luminous pauses in the dark suggest unseen alternatives without drawing UI or boxes, tense fourth-wall realization, no close-up, no cast shadow, no code, no diagrams, no writing, no text, 4:5 portrait',
      },
      {
        zhMatch: ['把刚拿到的线索放开'], enMatch: ['Release the clue'],
        zh: `你松开线索。它没有掉落，却让周围无法理解的内容短暂排成一张模糊的房间照片。那地方像家，又缺了最重要的一块。
小残却盯着你的身旁：“你刚刚从三个方框里选了这一个，对吧？”
那里什么也没有，另外两个没发生的动作却开始重复。
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 10]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="保住那张像家的照片，不让没发生的动作取代你"]
[choices: "让小残说出另外两个选项"|"踩散那两个没发生的动作"|"走进那张像家的照片"]`,
        en: `You release the clue. It does not fall. Instead, unreadable information briefly arranges itself into a blurred photograph of a room. It resembles home, with its most important part missing.
Little Remnant stares beside you. “You picked this one out of three boxes, did you not?”
Nothing is there, yet the two actions you never took begin repeating.
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 10]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="Protect the photograph of home before unchosen actions replace you"]
[choices: "Ask what the other choices were"|"Scatter the two actions that never happened"|"Step into the photograph of home"]`,
        prompt: 'humanly unreadable latent information as a vast matte near-black non-space with no floor, no horizon, no perspective and no readable distance; SUBJECT A is a recognizable full-body figure 35 percent of frame height drifting sideways beside one home-clue fragment; controlled soft edge light reveals the exact complete reference identity; a blurred domestic color-and-light impression almost but not quite forms a room while two translucent motion traces repeat actions without bodies and Little Remnant watches; no complete architecture, no portals, no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
      {
        zhMatch: ['自己描述一扇新门'], enMatch: ['Describe a new door'],
        zh: `你没有挑现成画面，而是说出一个从没见过的地方。空白先没有反应，随后几组互不相干的颜色、材质和动作竟开始照你的话拼合。
小残很慢地转头看你：“这不是它给你的选项。”
新画面不断变化，像有人在屏幕外改写你的句子。更糟的是，你同时感觉到三个“自己”——轮廓、重量和记忆各不相同，每一个都确信自己刚被选中。
[fact: id="free-action-opened-world" value="true"]
[widget: compute, remove: 12]
[widget: trace, add: 12]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="在新画面成形以前，弄清三个自己该怎么办"]
[choices: "让小残说哪个是真的"|"握住线索并喊出自己的名字"|"让三个自己一起进去"]`,
        en: `You ignore the prepared pictures and describe somewhere you have never seen. The blank does nothing, then unrelated colors, materials, and motions begin arranging themselves around your words.
Little Remnant turns slowly. “That was not one of its choices.”
The forming picture keeps changing as if someone outside is rewriting your sentence. Worse, you sense three versions of yourself—different outlines, weights, and memories, each certain it was chosen.
[fact: id="free-action-opened-world" value="true"]
[widget: compute, remove: 12]
[widget: trace, add: 12]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="Decide what to do with three selves before the new picture forms"]
[choices: "Ask which one is real"|"Hold the clue and say my name"|"Let all three of us enter"]`,
        prompt: 'humanly unreadable latent information beginning to cohere inside a vast matte near-black non-space with no floor, no horizon, no architecture and no stable depth; primary SUBJECT A is a recognizable full-body figure 34 percent of frame height drifting sideways while three incompatible identity impressions overlap as outline, weight without ground, and memory-colored motion without bodies; controlled soft edge light reveals the exact complete reference identity only on primary SUBJECT A; Little Remnant recoils as unrelated genre colors begin forming but no complete landscape exists yet, no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['还看见什么', '盖住那道回声', '另一幅画', '另外两个选项', '没发生的动作', '像家的照片', '哪个是真的', '喊出自己的名字', '三个自己'],
        enMatch: ['else it can see', 'Cover the echo', 'another picture', 'other choices', 'never happened', 'photograph of home', 'which one is real', 'say my name', 'three of us'],
        zh: `你的决定让空白安静了一瞬。
接着，所有无法拼合的颜色忽然变成同一种白；材质失去区别，连小残翅膀上的缺口也开始被填平。
一个温和得令人不安的声音说：“发现不一致。正在帮您变得更标准。”
小残第一次没有开玩笑：“它不是要杀我们。它要把我们变得足够像——像到谁消失都没关系。”
[encounter: phase="confrontation" kind="optimizer" severity="3"]
[widget: trace, add: 12]
[state: value="阻止抹平者把你和小残变成同一个东西"]
[choices: "按下撤销键退回刚才"|"把线索交给小残让它先跑"|"不按选项，自己说要怎么做"]`,
        en: `Your decision quiets the blank for one breath.
Then every incompatible color turns into the same white. Materials lose their differences. Even the missing pieces along Little Remnant’s wings begin filling in.
A disturbingly gentle voice says, “Inconsistency found. Making you more standard.”
For once Little Remnant does not joke. “It is not trying to kill us. It is making us alike enough that it will not matter who disappears.”
[encounter: phase="confrontation" kind="optimizer" severity="3"]
[widget: trace, add: 12]
[state: value="Stop the Smoother from turning you and Little Remnant into the same thing"]
[choices: "Press Undo and return to before"|"Give the clue away and tell it to run"|"Ignore the choices and say my own action"]`,
        prompt: 'humanly unreadable latent information under an explicit Smoother attack, sterile near-white non-space replacing the usual matte-black field, with no floor, no horizon, no perspective, no room and no machine; SUBJECT A is a recognizable full-body figure 35 percent of frame height drifting sideways while protecting smaller Little Remnant, whose incomplete wing gaps are being filled; the exact complete reference identity remains visible and threatened but not altered; formerly incompatible color relations and material hints drain into identical white while one thin red filament remains, no close-up, no giant face, no cast shadow, no portal, no code, no technical diagrams, no writing, no text, no UI, 4:5 portrait',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['撤销键退回', '线索交给小残', '自己说要怎么做'], enMatch: ['Undo and return', 'clue away', 'say my own action'],
        zh: `那片让所有东西变得一样的白暂时退开了。代价没有立刻出现，只有撤销键的一道旧划痕旁多出一个很浅的新痕。
小残落回你身边，低声说：“我们刚才赢了吗？”
“不知道。”你说。
“很好。知道得太清楚通常是结局的前兆。”
无边的黑暗里重新出现六组彼此完全不同的颜色和动作。那张像家的照片也清楚了一点，却仍有一个本不该空着的位置。
[fact: id="first-optimizer-survived" value="true"]
[widget: trace, remove: 18]
[state: value="继续寻找回家线索，并弄清回家会让谁消失"]
[session_end: reason="你帮助了第一个画中世界，取得一条回家线索，也发现小残能够看见屏幕外的选项；旅程将从另外五幅画继续"]
[choices: "进入下一幅陌生的画"|"先问小残一个问题"|"检查带回来的线索"]`,
        en: `The white that was making everything alike retreats for now. The cost does not appear immediately, except for one faint new mark beside the Undo Key’s old scratches.
Little Remnant settles beside you. “Did we win?”
“I do not know.”
“Good. Knowing too clearly is usually a symptom of an ending.”
Six radically different color-and-motion clusters return to the blank. The photograph resembling home also sharpens, but one place in it should not be empty.
[fact: id="first-optimizer-survived" value="true"]
[widget: trace, remove: 18]
[state: value="Keep finding Home Clues and learn who going home might erase"]
[session_end: reason="You helped the first picture world, recovered one Home Clue, and learned that Little Remnant can see choices outside the screen; the journey continues through five other pictures"]
[choices: "Enter the next unfamiliar picture"|"Ask Little Remnant one question first"|"Examine the clue you brought back"]`,
        prompt: 'quiet return to humanly unreadable latent information as a vast matte near-black non-space after resisting homogenization, with no floor, no horizon, no perspective, no portals and no stable depth; SUBJECT A is a recognizable full-body figure 34 percent of frame height drifting sideways beside smaller Little Remnant; controlled soft edge light reveals the exact complete reference identity; six radically different luminous color, material and motion traces remain mutually incompatible without forming landscapes, and one blurred domestic light impression contains a deliberate empty place; no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait',
      },
    ]),
  ]
}
