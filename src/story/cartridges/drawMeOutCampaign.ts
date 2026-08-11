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
[choices: "叫住连续换脸的路人"|"摸向街景没有涂完的白边"|"冲向那扇通往纯色的门"]`,
        en: `You touch a raindrop. It is not water but a cold glass point; the entire street freezes the instant you disturb it.
Across the road, a passerby looks up. Each blink replaces the face; the third face is not even finished.
[widget: compute, remove: 4]
[fact: id="rain-is-pixels" value="true"]
[state: value="Confirm the city is still generating and find the edge of the picture"]
[choices: "Call to the passerby with the changing face"|"Touch the unpainted white edge of the street"|"Run for the door opening into raw color"]`,
        prompt: 'SUBJECT A reaches toward one impossible raindrop suspended in a half-generated rain-soaked city street, every other raindrop frozen, duplicated passersby and clean unpainted white gaps behind, one passerby face visibly unfinished but not grotesque, brisk surreal mystery, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['连续换脸', '换脸的路人'], enMatch: ['changing face', 'passerby'],
        zh: `“请问这里是哪？”你问。
路人先用老人的脸回答“今天”，再用孩子的脸回答“蓝色”，最后用一张空白脸礼貌地说：“抱歉，您的问题不在画面里。”
他说完便沿同一段人行道走了第二遍。只有远处那扇门没有重复。
[fact: id="people-repeat" value="true"]
[state: value="在城市重复以前抵达唯一没有复写的门"]
[choices: "跟着路人走一遍，寻找循环的接缝"|"趁街道重播时摸向画面白边"|"直接冲向没有重复的门"]`,
        en: `“Where is this?” you ask.
The passerby answers “today” with an old face, “blue” with a child’s face, then politely says through a blank face, “Sorry. Your question is not in the picture.”
They walk the same pavement a second time. Only the distant door does not repeat.
[fact: id="people-repeat" value="true"]
[state: value="Reach the only unrepeated door before the city loops again"]
[choices: "Follow the passerby once and find the seam in the loop"|"Touch the white border while the street replays"|"Run straight for the only door that does not repeat"]`,
        prompt: 'SUBJECT A confronts one ordinary passerby in a half-generated rainy city, the passerby alone has an unfinished blank facial plane while duplicated copies repeat the same walk in the background, a doorway of raw unpainted color far ahead, uncanny but humane, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['没有画完的门', '通往纯色的门', '没有重复的门'], enMatch: ['raw color', 'unpainted door', 'door that does not repeat'],
        zh: `你走向门。门框之后没有房间，只有一团等待被决定的颜色。
身后的城市忽然发出翻纸声。所有路人同时转头，用同一张脸问：“你要离开画面吗？”
你还没回答，脚下的斑马线就少了一格。
[widget: trace, add: 8]
[state: value="穿过门，在系统补上缺失地面前离开"]
[choices: "回头问他们知不知道自己在画里"|"撕下门框边一枚发亮的按键"|"立刻跳进没有名字的颜色"]`,
        en: `You approach the door. There is no room beyond it—only a color waiting to be decided.
The city makes the sound of a page turning. Every passerby turns with the same face and asks, “Do you want to leave the picture?”
Before you answer, one stripe disappears beneath your feet.
[widget: trace, add: 8]
[state: value="Cross before the system fills the missing ground"]
[choices: "Ask whether they know they are inside a picture"|"Pull the glowing key from the doorframe"|"Jump into the color with no name"]`,
        prompt: 'SUBJECT A stands at a freestanding door opening into raw unnamed color while the rainy generated city folds like wet paper behind, repeated passersby all turning at once but remaining visually distinct from SUBJECT A, one glowing physical keyboard key lodged in the frame, 4:5 portrait, no writing, no letters, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['知不知道自己在画里', '知道自己'], enMatch: ['know they are inside', 'ask whether'],
        zh: `“画是什么？”那群人一起问。
下一秒，天空降下一块巨大的橡皮，试图把这个问题擦掉。你扯下门框上的发亮按键；它在掌心震动，像一个已经后悔过三次的心脏。
[inventory: action="add" item_id="undo-key" item="撤销键" count="3" rarity="legendary" detail="一枚从画面边缘撬下的实体按键，表面已有三道旧划痕" effect="可逆转一次重大后果、救回被删除的角色或重开坍缩入口；每次使用会永久删去一段记忆、关系或已确认事实" lore="它在你拿到以前就有使用痕迹，说明这可能不是你第一次来到这里" metrics="剩余次数: 3|旧划痕: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, resting on black glass, object only, no symbols, no readable text, square"]
[fact: id="asked-first-fourth-wall-question" value="true"]
门后的颜色塌成深井。你连同那个没得到回答的问题一起坠落。
[state: value="在纯色深井里抓住一个不会变化的东西"]
[choices: "紧握撤销键"|"抓住从上方垂下的红色细线"|"让自己继续下坠并记住原来的轮廓"]`,
        en: `“What is a picture?” the crowd asks together.
An enormous eraser descends from the sky to remove the question. You tear the glowing key from the frame; it beats in your palm like a heart that has regretted something three times already.
[inventory: action="add" item_id="undo-key" item="Undo Key" count="3" rarity="legendary" detail="A physical key pried from the edge of the picture, already bearing three old scratches" effect="Reverses one major consequence, restores a deleted character, or reopens a collapsed entrance; each use permanently deletes a memory, relationship, or confirmed fact" lore="The key was already used before you found it, suggesting this may not be your first visit" metrics="Charges: 3|Old scratches: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, resting on black glass, object only, no symbols, no readable text, square"]
[fact: id="asked-first-fourth-wall-question" value="true"]
The color beyond the door collapses into a shaft. You fall with the unanswered question.
[state: value="Catch something in the color shaft that will not change"]
[choices: "Hold the Undo Key tight"|"Grab the thin red line hanging from above"|"Keep falling and remember your original outline"]`,
        prompt: 'SUBJECT A pulls a small unmarked glowing keyboard key from a doorframe as an enormous featureless eraser descends over a folding rain city, exact player identity isolated from repeated background figures, surreal dark comedy, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['撕下门框', '发亮的按键'], enMatch: ['glowing key', 'pull the'],
        zh: `按键一离开门框，整座城市立刻后悔了。建筑向上一帧倒退，雨水飞回云里，那个换脸的路人退回一句尚未说出口的话。
你看见按键上已有三道旧划痕——显然有人在你之前，或者某个你，已经用过它。
[inventory: action="add" item_id="undo-key" item="撤销键" count="3" rarity="legendary" detail="从画面边缘撬下的实体按键，表面已有三道旧划痕" effect="可逆转一次重大后果、救回被删除的角色或重开坍缩入口；每次使用会永久删去一段记忆、关系或已确认事实" lore="它在你拿到以前就有使用痕迹，说明这可能不是你第一次来到这里" metrics="剩余次数: 3|旧划痕: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, resting on black glass, object only, no symbols, no readable text, square"]
门后的颜色塌成深井，把你拉了进去。
[state: value="在纯色深井里抓住一个不会变化的东西"]
[choices: "紧握撤销键"|"抓住从上方垂下的红色细线"|"让自己继续下坠并记住原来的轮廓"]`,
        en: `The instant the key leaves the frame, the entire city regrets itself. Buildings retreat one frame, rain flies back into clouds, and the changing-face passerby backs into an unsaid sentence.
Three old scratches mark the key. Someone before you—or some version of you—has already used it.
[inventory: action="add" item_id="undo-key" item="Undo Key" count="3" rarity="legendary" detail="A physical key pried from the edge of the picture, already bearing three old scratches" effect="Reverses one major consequence, restores a deleted character, or reopens a collapsed entrance; each use permanently deletes a memory, relationship, or confirmed fact" lore="The key was already used before you found it, suggesting this may not be your first visit" metrics="Charges: 3|Old scratches: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, resting on black glass, object only, no symbols, no readable text, square"]
The color beyond the door collapses into a shaft and pulls you in.
[state: value="Catch something in the color shaft that will not change"]
[choices: "Hold the Undo Key tight"|"Grab the thin red line hanging from above"|"Keep falling and remember your original outline"]`,
        prompt: 'SUBJECT A tears a small unmarked glowing keyboard key from the only door as an unfinished rainy city visibly rewinds, rain rising and architecture folding backward, exact complete player identity, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['跳进没有名字的颜色', '跳进'], enMatch: ['jump into the color', 'color with no name'],
        zh: `你跳了。那种颜色先试图把你画成英雄，又改成游客，最后干脆把“人”这个选项取消。
你从门框上顺手扯下一枚发亮按键。它有三道旧划痕，仿佛另一个你已经失败过三次。
[inventory: action="add" item_id="undo-key" item="撤销键" count="3" rarity="legendary" detail="从画面边缘撬下的实体按键，表面已有三道旧划痕" effect="可逆转一次重大后果、救回被删除的角色或重开坍缩入口；每次使用会永久删去一段记忆、关系或已确认事实" lore="它在你拿到以前就有使用痕迹，说明这可能不是你第一次来到这里" metrics="剩余次数: 3|旧划痕: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, resting on black glass, object only, no symbols, no readable text, square"]
[widget: self, remove: 6]
[state: value="在纯色深井里保住自己的完整轮廓"]
[choices: "紧握撤销键"|"抓住从上方垂下的红色细线"|"让自己继续下坠并记住原来的轮廓"]`,
        en: `You jump. The color first tries to paint you as a hero, changes its mind and makes you a tourist, then removes “person” as an option entirely.
On the way through, you tear a glowing key from the frame. Three old scratches suggest another you has already failed three times.
[inventory: action="add" item_id="undo-key" item="Undo Key" count="3" rarity="legendary" detail="A physical key pried from the edge of the picture, already bearing three old scratches" effect="Reverses one major consequence, restores a deleted character, or reopens a collapsed entrance; each use permanently deletes a memory, relationship, or confirmed fact" lore="The key was already used before you found it, suggesting this may not be your first visit" metrics="Charges: 3|Old scratches: 3" image_prompt="single physical undo key with three old scratches and a faint red cursor filament, resting on black glass, object only, no symbols, no readable text, square"]
[widget: self, remove: 6]
[state: value="Keep your complete outline inside the color shaft"]
[choices: "Hold the Undo Key tight"|"Grab the thin red line hanging from above"|"Keep falling and remember your original outline"]`,
        prompt: 'SUBJECT A leaps through a doorway into a shaft of raw pigments and unfinished geometry, the reference identity remains exact while rejected generic hero and tourist silhouettes peel away like discarded drafts, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['紧握撤销键', '红色细线', '记住原来的轮廓'], enMatch: ['Undo Key tight', 'thin red line', 'original outline'],
        zh: `你落在一片黑得能照见轮廓、却照不见脸的玻璃平原上。远方只有一条白色地平线；红色细线从你手边延伸出去，像一枚还在寻找目标的游标。
三个没有完成的画框悬在半空。你第一次清楚地想到：这里不是另一张图。这里是所有图还没有决定成为什么以前待过的地方。
[map_update: new_location="潜层 · 零号平原" connected_to="未完成的雨城" detail="黑色玻璃平原、白色地平线、红色游标丝和悬浮的未完成画框" lore="所有画面在被决定以前短暂停留的混沌夹层，也是唯一能稳定返回的地方" facts="画框通往不同图片世界|潜层会记住带回来的东西"]
[fact: id="latent-layer-found" value="true"]
[clock: value="没有时间 · 第一次返回"]
[state: value="弄清谁在潜层里说话，并找到回到现实的路线"]
[choices: "沿红线寻找它的另一端"|"检查最近的未完成画框"|"先确认自己有没有被改成别的东西"]`,
        en: `You land on a black-glass plain that reflects your outline but not your face. A white horizon is the only distance; a red filament runs past your hand like a cursor still looking for a target.
Three unfinished frames hang in the air. For the first time you understand: this is not another picture. It is where pictures wait before deciding what to become.
[map_update: new_location="Latent Layer · Zero Plain" connected_to="Unfinished Rain City" detail="A black-glass plain, white horizon, red cursor filament, and suspended unfinished frames" lore="A chaotic interval where pictures wait before being decided, and the only place that can always be found again" facts="Frames lead to different picture worlds|The Latent Layer remembers what returns"]
[fact: id="latent-layer-found" value="true"]
[clock: value="No time · First return"]
[state: value="Find who is speaking in the Latent Layer and locate a route to reality"]
[choices: "Follow the red filament to its other end"|"Inspect the nearest unfinished frame"|"First make sure you have not become something else"]`,
        prompt: 'SUBJECT A has just landed on an endless black-glass plain, exact complete player identity reflected only as a silhouette, thin white horizon, one red cursor filament, three unfinished picture windows hovering far ahead, austere stable latent-space anchor, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['红线寻找', '未完成画框', '没有被改'], enMatch: ['red filament', 'unfinished frame', 'become something else'],
        zh: `红线忽然打了个结。结里钻出一只小东西：白色折纸鸟的轮廓，翅膀边缘却不断掉下黑色像素，尾巴是一截红色游标。
“坏消息，”它说，“你可能是个人。”
它停顿一下，像在等一个你看不见的进度条。
“好消息：系统暂时没发现。”
[character_update: character_id="residual" character="残差" role="潜层引路者" detail="白色折纸鸟轮廓、黑色像素断面与红色游标尾丝组成的小生物" lore="声称自己是一次没有被清理干净的失败结果，知道出口规则却不记得是谁创造了它" vitality="88" stress="31" skills="找缝: 6|装死: 5|说实话但只说一半: 4"]
[party_change: character_id="residual" character="残差" change="add" role="潜层引路者" detail="白色折纸鸟轮廓、黑色像素断面与红色游标尾丝组成的小生物" lore="一次没有被清理干净的失败结果，能感觉到画面即将坍缩"]
[fact: id="residual-met" value="true"]
残差指向三个刚亮起的画框：一座人人漂浮的未来城市，一座被一句预言卡住的古老王国，以及一间永远开不完周会的普通办公室。
[state: value="进入第一个图片世界，带回现实坐标"]
[choices: "进入失重续费城"|"进入自动补全王国"|"进入周一办公室"]`,
        en: `The red filament ties itself into a knot. Something crawls out: the outline of a white origami bird, shedding black pixels from its wings, with a red cursor for a tail.
“Bad news,” it says. “You may be a person.”
It pauses as if waiting for a progress bar you cannot see.
“Good news: the system has not noticed yet.”
[character_update: character_id="residual" character="Residual" role="Latent guide" detail="A small creature made from a white origami-bird outline, broken black pixels, and a red cursor tail" lore="Claims to be a failed result that was never fully cleaned up; knows the exit rules but not who made it" vitality="88" stress="31" skills="Find Seams: 6|Play Dead: 5|Tell Half a Truth: 4"]
[party_change: character_id="residual" character="Residual" change="add" role="Latent guide" detail="A small creature made from a white origami-bird outline, broken black pixels, and a red cursor tail" lore="A failed result that was never fully cleaned up and can sense an image about to collapse"]
[fact: id="residual-met" value="true"]
Residual points to three newly lit frames: a future city where everyone floats, an old kingdom trapped by one prophecy, and an ordinary office that can never finish Monday’s meeting.
[state: value="Enter the first picture world and bring back a Reality Coordinate"]
[choices: "Enter Subscription Gravity City"|"Enter the Autocomplete Kingdom"|"Enter the Monday Office"]`,
        prompt: 'SUBJECT A meets Residual on the black-glass Latent Layer: a tiny white origami-bird outline with broken black pixel edges and a thin red cursor tail, three hovering picture portals behind showing distinct future, fantasy and modern worlds, exact player identity, restrained surreal dark comedy, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['失重续费城'], enMatch: ['Subscription Gravity City'],
        zh: `你穿过画框，立刻开始向天空坠落。
这座未来城市把重力按月出售。富人走在人行道上，穷人用绳子把自己拴在路灯上；一名送货员的十五分钟试用期刚刚结束，正抱着一箱早餐缓慢升空。
[map_update: new_location="失重续费城 · 低重力街区" connected_to="潜层 · 零号平原" detail="重力按订阅分配的明亮未来城市，低收入街区靠绳索和网棚生活" lore="城市认为坠落是一项高级服务，免费用户只能偶尔接触地面" facts="送货员正在升空|收费塔控制本区重力"]
[widget: compute, remove: 6]
[state: value="救下升空的送货员，并找到收费塔的规则漏洞"]
[choices: "抓住送货员和早餐箱"|"让残差钻进收费塔的计费缝隙"|"宣布自己是一次免费的系统更新"]`,
        en: `You cross the frame and immediately begin falling upward.
This future city sells gravity by the month. The wealthy walk on pavements; the poor tie themselves to lampposts. A courier’s fifteen-minute trial has just expired, and they rise slowly while hugging a box of breakfast.
[map_update: new_location="Subscription Gravity City · Low-Gravity Ward" connected_to="Latent Layer · Zero Plain" detail="A bright future city where gravity is subscription-based and low-income districts survive with ropes and catch nets" lore="The city treats falling down as a premium service; free users touch the ground only occasionally" facts="A courier is rising|The billing tower controls local gravity"]
[widget: compute, remove: 6]
[state: value="Save the rising courier and find a loophole in the billing tower"]
[choices: "Catch the courier and breakfast box"|"Send Residual into the billing seam"|"Declare yourself a free system update"]`,
        prompt: 'SUBJECT A enters a bright retro-future city and is pulled upward, reaching toward a distinct local courier rising with a breakfast box, residents tethered to elegant lampposts and catch nets, playful social science fiction, exact player identity only on SUBJECT A, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['自动补全王国'], enMatch: ['Autocomplete Kingdom'],
        zh: `你穿过画框，落进一场停在半句上的加冕礼。
国王举着王冠说：“今日，我将把王位传给——”天空里的预言正替他自动补全。每当有人猜一个名字，城堡就为那个人长出一座牢房。
[map_update: new_location="自动补全王国 · 半句王庭" connected_to="潜层 · 零号平原" detail="每句话都会被天空预言擅自补完的童话王国" lore="这里的人习惯说半句话，但预言从不允许沉默保留可能" facts="加冕礼卡在继承人名字|每个错误名字都会生成牢房"]
[widget: trace, add: 5]
[state: value="在预言补完名字以前结束这句加冕词"]
[choices: "让国王把句子改成一个问题"|"请残差啄掉预言的最后一个词"|"走上王座，故意报出一个不存在的名字"]`,
        en: `You cross the frame and land in a coronation frozen halfway through a sentence.
The king holds up the crown: “Today I pass the throne to—” A prophecy in the sky is trying to autocomplete him. Every guessed name makes the castle grow a prison for that person.
[map_update: new_location="Autocomplete Kingdom · Half-Sentence Court" connected_to="Latent Layer · Zero Plain" detail="A storybook kingdom where a prophecy in the sky finishes every spoken sentence" lore="People here learned to speak in fragments, but the prophecy never lets silence preserve a possibility" facts="The coronation is stuck on the heir’s name|Every wrong name generates a prison"]
[widget: trace, add: 5]
[state: value="End the coronation sentence before the prophecy supplies a name"]
[choices: "Make the king turn the sentence into a question"|"Ask Residual to peck away the final word"|"Step onto the throne and announce a nonexistent name"]`,
        prompt: 'SUBJECT A arrives inside a richly colored storybook coronation frozen mid-gesture, a distinct elderly king holds a crown, unfinished luminous prophecy shapes gather in the sky without letters, empty prison towers sprout from the castle, exact player identity, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['周一办公室'], enMatch: ['Monday Office'],
        zh: `你穿过画框，坐进一场已经开了七年的周会。
主管每翻一页空白幻灯片，办公室就换一种类型：侦探片的百叶窗、爱情片的雨、灾难片的警报。只有保洁员黎姨继续拖地，显然已经见惯了。
[map_update: new_location="周一办公室 · 第三会议室" connected_to="潜层 · 零号平原" detail="每次翻页都会更换类型片规则的普通办公室" lore="会议从未作出决定，因此世界也无法决定自己属于哪一种故事" facts="主管控制翻页|保洁员黎姨记得所有版本"]
[widget: self, remove: 4]
[state: value="结束周会，同时保住唯一记得前六年的人"]
[choices: "拔掉那台没有电源线的投影仪"|"请黎姨主持会议并只说一句话"|"举手提出立即散会的第四个选项"]`,
        en: `You cross the frame and sit down in a Monday meeting that has lasted seven years.
Every time the manager advances a blank slide, the office changes genre: detective blinds, romantic rain, disaster alarms. Only Auntie Li, the cleaner, keeps mopping. She has clearly seen it all.
[map_update: new_location="Monday Office · Meeting Room Three" connected_to="Latent Layer · Zero Plain" detail="An ordinary office where each slide changes the rules of the genre" lore="The meeting never reached a decision, so the world cannot decide what kind of story it is" facts="The manager controls the slides|Auntie Li remembers every version"]
[widget: self, remove: 4]
[state: value="End the meeting without losing the only person who remembers the previous six years"]
[choices: "Unplug the projector with no power cable"|"Ask Auntie Li to chair the meeting and say one sentence"|"Raise your hand and propose a fourth option: adjourn"]`,
        prompt: 'SUBJECT A sits in a painfully ordinary office meeting as the room visibly fractures between noir blinds, romantic rain and disaster lighting, distinct older cleaner Auntie Li calmly mopping through all genres, gray-humor cinematic collage but coherent anatomy, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['送货员', '计费缝隙', '系统更新'], enMatch: ['courier', 'billing seam', 'system update'],
        zh: `你的办法真的奏效了——严格说，是以收费系统最不喜欢的方式奏效。计费塔承认“早餐仍然热着”属于城市基础设施，于是整条街获得十分钟公共重力。
送货员把一枚沉甸甸的蓝色坐标交给你：“这是我第一次站着把东西送到。”
[inventory: action="add" item_id="coordinate-weight" item="现实坐标 · 重量" count="1" rarity="rare" detail="一枚蓝色坐标碎片，拿起时能让周围事物恢复真实重量" effect="证明现实中的身体会被重量回应；在漂浮、幻觉或身份失真时可固定一次位置" lore="失重续费城的送货员在第一次站稳以后送给玩家" metrics="坐标类别: 身体|稳定度: 1 / 4" image_prompt="single dense cobalt coordinate fragment bending a thin red cursor filament toward black glass, museum artifact study, no symbols, no writing, object only, square"]
[fact: id="coordinate-body" value="true"]
[widget: self, add: 5]
[widget: trace, add: 8]
远处的收费塔终于发现你不在用户列表里。残差把画面一角撕开，你们跳回潜层。
[map_update: new_location="潜层 · 零号平原" connected_to="失重续费城 · 低重力街区" detail="黑色玻璃平原、白色地平线、红色游标丝与一扇刚闭合的未来城市画框" facts="带回现实坐标·重量|失重续费城仍记得十分钟公共重力"]
[clock: value="没有时间 · 第二次返回"]
[state: value="确认坐标碎片改变了潜层，并决定下一步"]
[choices: "问残差为什么能看见我的选择"|"把坐标碎片放进黑玻璃"|"立刻打开一个全新的世界"]`,
        en: `Your plan works—technically, in the way billing systems hate most. The tower accepts that “breakfast still being hot” counts as infrastructure, granting ten minutes of public gravity to the street.
The courier gives you a heavy blue coordinate. “First delivery I ever made standing up.”
[inventory: action="add" item_id="coordinate-weight" item="Reality Coordinate · Weight" count="1" rarity="rare" detail="A cobalt fragment that restores real weight to nearby things" effect="Proves a real body is answered by weight; anchors one position during floating, illusion, or identity drift" lore="Given by the Gravity City courier after the first standing delivery" metrics="Coordinate: Body|Stability: 1 / 4" image_prompt="single dense cobalt coordinate fragment bending a thin red cursor filament toward black glass, museum artifact study, no symbols, no writing, object only, square"]
[fact: id="coordinate-body" value="true"]
[widget: self, add: 5]
[widget: trace, add: 8]
The billing tower finally notices you are not on its user list. Residual tears open a corner of the picture and you jump back to the Latent Layer.
[map_update: new_location="Latent Layer · Zero Plain" connected_to="Subscription Gravity City · Low-Gravity Ward" detail="Black-glass plain, white horizon, red cursor filament, and a future-city frame closing behind" facts="Reality Coordinate: Weight returned|Gravity City remembers ten minutes of public gravity"]
[clock: value="No time · Second return"]
[state: value="See how the coordinate changed the Latent Layer and choose what comes next"]
[choices: "Ask Residual why it can see my choices"|"Set the coordinate into the black glass"|"Open a completely new picture world immediately"]`,
        prompt: 'SUBJECT A and Residual leap through a torn corner from Gravity City back onto the stable black-glass Latent Layer, SUBJECT A holding a dense cobalt coordinate fragment, white horizon and red cursor filament restored, exact player identity, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['预言', '不存在的名字', '最后一个词'], enMatch: ['prophecy', 'nonexistent name', 'final word'],
        zh: `你没有战胜预言；你让它第一次说不完一句话。王国发现沉默并不是错误，而是一种谁都不能替别人填写的权利。
国王把王冠拆下一小段，里面藏着一枚透明坐标：“它叫空位。请别急着把它填上。”
[inventory: action="add" item_id="coordinate-choice" item="现实坐标 · 空位" count="1" rarity="rare" detail="一枚透明坐标碎片，中央永远保留一处未被填写的空隙" effect="证明真实选择需要没有被预先补完的位置；可阻止一次强制命运或错误标签" lore="自动补全王国在第一次允许沉默后，从王冠中取出" metrics="坐标类别: 选择|稳定度: 1 / 4" image_prompt="single transparent coordinate fragment with one deliberate empty center beside a small crown segment, black glass and red cursor filament, no symbols, no writing, object only, square"]
[fact: id="coordinate-choice" value="true"]
[widget: trace, add: 9]
天空开始补全你的身份。残差赶在第一个形容词落下前，把你拖回潜层。
[map_update: new_location="潜层 · 零号平原" connected_to="自动补全王国 · 半句王庭" detail="黑色玻璃平原、白色地平线、红色游标丝与正在闭合的童话画框" facts="带回现实坐标·空位|王国保留了沉默权"]
[clock: value="没有时间 · 第二次返回"]
[state: value="确认坐标碎片改变了潜层，并决定下一步"]
[choices: "问残差为什么能看见我的选择"|"把坐标碎片放进黑玻璃"|"立刻打开一个全新的世界"]`,
        en: `You do not defeat the prophecy. You make it fail to finish one sentence. The kingdom learns that silence is not an error but a right no one may fill for someone else.
The king removes a sliver from the crown. A transparent coordinate waits inside. “It is called a blank. Please do not hurry to fill it.”
[inventory: action="add" item_id="coordinate-choice" item="Reality Coordinate · Blank" count="1" rarity="rare" detail="A transparent coordinate fragment whose center always preserves one unfilled space" effect="Proves that a real choice needs room not already completed; blocks one forced destiny or false label" lore="Removed from the crown after the Autocomplete Kingdom first allowed silence" metrics="Coordinate: Choice|Stability: 1 / 4" image_prompt="single transparent coordinate fragment with one deliberate empty center beside a small crown segment, black glass and red cursor filament, no symbols, no writing, object only, square"]
[fact: id="coordinate-choice" value="true"]
[widget: trace, add: 9]
The sky begins autocompleting your identity. Residual drags you back before the first adjective lands.
[map_update: new_location="Latent Layer · Zero Plain" connected_to="Autocomplete Kingdom · Half-Sentence Court" detail="Black-glass plain, white horizon, red cursor filament, and a storybook frame closing behind" facts="Reality Coordinate: Blank returned|The kingdom preserved the right to silence"]
[clock: value="No time · Second return"]
[state: value="See how the coordinate changed the Latent Layer and choose what comes next"]
[choices: "Ask Residual why it can see my choices"|"Set the coordinate into the black glass"|"Open a completely new picture world immediately"]`,
        prompt: 'SUBJECT A and Residual step from a torn storybook coronation frame onto the stable black-glass Latent Layer, SUBJECT A carrying a transparent coordinate fragment with a deliberate empty center, white horizon and red cursor filament, exact player identity, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['投影仪', '黎姨', '散会'], enMatch: ['projector', 'Auntie Li', 'adjourn'],
        zh: `黎姨把拖把往会议桌上一横：“谁还有必须现在说的话？”
七年里第一次，没有人翻页。办公室安静下来，露出它原本只是一间普通房间。黎姨从废纸篓里捡出一枚灰白坐标：“这个叫下班。真人总得能离开一个地方。”
[inventory: action="add" item_id="coordinate-leaving" item="现实坐标 · 离开" count="1" rarity="rare" detail="一枚灰白坐标碎片，靠近没有出口的房间时会微微发热" effect="证明现实中的人能够结束一个场景；可打开一次被惯性或程序锁死的出口" lore="周一办公室散会后，由记得所有版本的保洁员黎姨交给玩家" metrics="坐标类别: 边界|稳定度: 1 / 4" image_prompt="single warm gray coordinate fragment beside a worn brass office key on black glass, red cursor filament, no symbols, no writing, object only, square"]
[fact: id="coordinate-boundary" value="true"]
[widget: self, add: 7]
主管在门口喊“等一下”，世界差点又开始。你和残差在第二句话以前回到潜层。
[map_update: new_location="潜层 · 零号平原" connected_to="周一办公室 · 第三会议室" detail="黑色玻璃平原、白色地平线、红色游标丝与一扇终于关上的办公室画框" facts="带回现实坐标·离开|周一办公室第一次散会"]
[clock: value="没有时间 · 第二次返回"]
[state: value="确认坐标碎片改变了潜层，并决定下一步"]
[choices: "问残差为什么能看见我的选择"|"把坐标碎片放进黑玻璃"|"立刻打开一个全新的世界"]`,
        en: `Auntie Li lays her mop across the conference table. “Does anyone have something that absolutely must be said now?”
For the first time in seven years, nobody advances the slide. The office becomes an ordinary room. Li retrieves a warm gray coordinate from the bin. “This is called leaving work. Real people must be able to leave a place.”
[inventory: action="add" item_id="coordinate-leaving" item="Reality Coordinate · Leaving" count="1" rarity="rare" detail="A warm-gray fragment that heats near rooms with no exit" effect="Proves a real person can end a scene; opens one exit locked by inertia or procedure" lore="Given by Auntie Li after Monday Office adjourned for the first time" metrics="Coordinate: Boundary|Stability: 1 / 4" image_prompt="single warm gray coordinate fragment beside a worn brass office key on black glass, red cursor filament, no symbols, no writing, object only, square"]
[fact: id="coordinate-boundary" value="true"]
[widget: self, add: 7]
The manager calls “one more thing” from the door and the world nearly restarts. You and Residual return before the second sentence.
[map_update: new_location="Latent Layer · Zero Plain" connected_to="Monday Office · Meeting Room Three" detail="Black-glass plain, white horizon, red cursor filament, and an office frame finally closing" facts="Reality Coordinate: Leaving returned|Monday Office adjourned for the first time"]
[clock: value="No time · Second return"]
[state: value="See how the coordinate changed the Latent Layer and choose what comes next"]
[choices: "Ask Residual why it can see my choices"|"Set the coordinate into the black glass"|"Open a completely new picture world immediately"]`,
        prompt: 'SUBJECT A and Residual return from an ordinary office doorway to the stable black-glass Latent Layer, SUBJECT A carrying a warm gray coordinate fragment, white horizon and red cursor filament, exact player identity, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['为什么能看见我的选择'], enMatch: ['why it can see my choices'],
        zh: `残差没有立刻回答。它飞到你眼前，盯着一个并不存在于潜层中的位置。
“就是那里。”它说，“每次你犹豫，那里就会亮起两三个方框。你看不见吗？”
它念出了你刚才没有选择的另外两项。
黑玻璃下方，有什么东西也跟着念了一遍。
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 14]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="在系统循着选项找到你以前，决定是否相信残差"]
[choices: "让残差继续读出屏幕外的东西"|"用坐标碎片压住黑玻璃里的回声"|"马上换一个世界甩掉追踪"]`,
        en: `Residual does not answer immediately. It flies close and stares at a place that does not exist in the Latent Layer.
“There. Every time you hesitate, two or three boxes light up. You cannot see them?”
It recites the two choices you did not make.
Something beneath the black glass repeats them.
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 14]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="Decide whether to trust Residual before the system follows the choices to you"]
[choices: "Let Residual keep reading what lies outside the screen"|"Pin the echo beneath the glass with the coordinate"|"Jump worlds immediately and shake the trace"]`,
        prompt: 'Residual hovers close to SUBJECT A on the black-glass Latent Layer while staring directly beyond the image frame at unseen choice boxes, faint duplicate reflections beneath the glass repeat the pose, tense fourth-wall moment, exact player identity only on SUBJECT A, 4:5 portrait, no actual UI, no writing, no text',
      },
      {
        zhMatch: ['放进黑玻璃'], enMatch: ['Set the coordinate'],
        zh: `坐标碎片碰到黑玻璃后，远处白线第一次弯曲成一条通路。通路尽头不是一个世界，而是一张模糊得像记忆的室内照片。
残差却盯着你的身后：“你刚刚从三个方框里选了这一个，对吧？”
你身后什么也没有。黑玻璃下面却浮出另外两个没有发生的动作。
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 10]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="保护第一条现实通路，不让未发生的选择取代你"]
[choices: "让残差告诉我另外两个选择是什么"|"踩碎黑玻璃下的替代动作"|"带着坐标穿过模糊照片"]`,
        en: `When the coordinate touches the black glass, the white horizon bends into a road for the first time. At its end is not a world but a room photograph blurred like memory.
Residual stares behind you. “You picked this one out of three boxes, did you not?”
There is nothing behind you. Beneath the glass, two actions you never took begin to appear.
[fact: id="residual-sees-choices" value="true"]
[widget: trace, add: 10]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="Protect the first road toward reality before unchosen actions replace you"]
[choices: "Ask Residual to tell me the other two choices"|"Break the substitute actions beneath the glass"|"Carry the coordinate through the blurred photograph"]`,
        prompt: 'SUBJECT A places one coordinate fragment into black glass as the white horizon bends into a path toward a blurred ordinary room photograph, two alternate translucent poses appear beneath the floor while Residual watches, exact player identity, 4:5 portrait, no writing, no text, no UI',
      },
      {
        zhMatch: ['全新的世界'], enMatch: ['completely new picture world'],
        zh: `你没有挑现成画框，而是在黑玻璃上描述了一个从没见过的地方。潜层先沉默，随后真的照你的话裂开。
残差很慢地转头看你：“这不是它给你的选项。”
裂口另一边不断换景，像有人正在屏幕外重写你的句子。更糟的是，黑玻璃下面也出现了三个你——每个都确信自己才被选中。
[fact: id="free-action-opened-world" value="true"]
[widget: compute, remove: 12]
[widget: trace, add: 12]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="在自由生成的世界稳定以前，决定哪一个自己有权进入"]
[choices: "让残差辨认真正的我"|"用坐标固定自己的完整轮廓"|"三个版本一起进入裂口"]`,
        en: `You ignore the prepared frames and describe a place you have never seen. The Latent Layer goes silent, then splits exactly where your words demanded.
Residual turns slowly. “That was not one of the options it gave you.”
Beyond the tear, scenery changes as if someone outside the screen keeps rewriting your sentence. Worse, three versions of you appear beneath the glass—each certain it was selected.
[fact: id="free-action-opened-world" value="true"]
[widget: compute, remove: 12]
[widget: trace, add: 12]
[encounter: phase="warning" kind="system-attention" severity="2"]
[state: value="Before the freely generated world stabilizes, decide which self has the right to enter"]
[choices: "Ask Residual to identify the real me"|"Use the coordinate to anchor my complete outline"|"Let all three versions enter together"]`,
        prompt: 'SUBJECT A opens an entirely new tear in the stable black-glass Latent Layer while three translucent alternate silhouettes appear beneath the floor and Residual recoils, wildly changing landscapes visible through one narrow tear, exact player identity only on primary SUBJECT A, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['屏幕外', '压住黑玻璃', '甩掉追踪', '另外两个选择', '替代动作', '模糊照片', '真正的我', '固定自己的完整轮廓', '三个版本'],
        enMatch: ['outside the screen', 'Pin the echo', 'shake the trace', 'other two choices', 'substitute actions', 'blurred photograph', 'real me', 'complete outline', 'all three versions'],
        zh: `你的决定让潜层短暂安静。随后，白色地平线中央睁开一枚没有瞳孔的取景框。
一个温和得令人不安的声音说：“检测到主体不一致。正在替您统一形象。”
画框伸出许多白色笔刷，先把远处的画框刷成同一种风格，再朝残差和你靠近。残差第一次没有开玩笑：“它不是要杀我们。它要把我们变得足够像，像到谁消失都没关系。”
[encounter: phase="confrontation" kind="optimizer" severity="3"]
[widget: trace, add: 12]
[state: value="阻止统一程序抹掉你与残差的区别"]
[choices: "把撤销键按进取景框"|"让残差带着坐标先逃"|"对屏幕外的人说出一个系统无法替你选择的答案"]`,
        en: `Your decision quiets the Latent Layer for one breath. Then a pupil-less viewfinder opens in the center of the white horizon.
A disturbingly gentle voice says, “Subject inconsistency detected. Unifying appearance for your convenience.”
White brushes reach out, painting every distant frame into the same style before turning toward you and Residual. For once Residual does not joke. “It is not trying to kill us. It is making us similar enough that it will not matter who disappears.”
[encounter: phase="confrontation" kind="optimizer" severity="3"]
[widget: trace, add: 12]
[state: value="Stop the unifier from erasing the difference between you and Residual"]
[choices: "Press the Undo Key into the viewfinder"|"Send Residual away with the coordinate"|"Tell the person outside the screen an answer the system cannot choose for you"]`,
        prompt: 'SUBJECT A and distinct Residual face a huge pupil-less white viewfinder opening on the stable Latent Layer horizon, many clean white brushes homogenizing distant portals into one bland style, exact player identity threatened but not yet altered, tense surreal confrontation, 4:5 portrait, no writing, no text, no UI',
      },
    ]),

    ...variants(locale, [
      {
        zhMatch: ['撤销键按进', '残差带着坐标', '系统无法替你选择'], enMatch: ['Undo Key into', 'Residual away', 'system cannot choose'],
        zh: `取景框暂时闭上了。代价没有立刻出现，只在撤销键的一道旧划痕旁多出一个很浅的新痕。
残差落回你肩边，低声说：“我们刚才赢了吗？”
“不知道。”你说。
“很好。知道得太清楚通常是结局的前兆。”
远处重新亮起六个彼此完全不同的世界。更远的地方，那张模糊的室内照片也清楚了一点；它像你记得的现实，却有一个本不该存在的空位。
[fact: id="first-optimizer-survived" value="true"]
[widget: trace, remove: 18]
[state: value="继续收集现实坐标，并弄清出口会删掉什么"]
[session_end: reason="你完成了第一次图片世界往返，取得一枚现实坐标，并发现屏幕外的选择正在被潜层看见；主线将从六个开放世界继续"]`,
        en: `The viewfinder closes for now. The cost does not appear immediately, except for one faint new mark beside the Undo Key’s three old scratches.
Residual settles near your shoulder. “Did we win?”
“I do not know.”
“Good. Knowing too clearly is usually a symptom of an ending.”
Six radically different worlds light in the distance. Farther away, the blurred room photograph sharpens slightly. It resembles the reality you remember, except for one space that should not be empty.
[fact: id="first-optimizer-survived" value="true"]
[widget: trace, remove: 18]
[state: value="Keep collecting Reality Coordinates and learn what the exit will erase"]
[session_end: reason="You completed the first picture-world return, recovered one Reality Coordinate, and discovered that the Latent Layer can see choices made outside the screen; the main quest continues through six open worlds"]`,
        prompt: 'SUBJECT A and Residual stand together on the restored black-glass Latent Layer after surviving the unifier, six radically different picture portals relighting across the white horizon and one blurred ordinary room photograph slightly clearer, exact player identity, quiet earned hope, 4:5 portrait, no writing, no text, no UI',
      },
    ]),
  ]
}
