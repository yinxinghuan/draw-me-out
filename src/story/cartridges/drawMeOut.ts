import type {
  DomainActionRule, DomainEffect, InventoryItem, Locale, StoryCartridge, StoryDangerDirector, StoryDomainRules, StoryEndingAnchor,
  StoryEndingCapability, StoryEndingDirector, StoryImageDirector, StoryVisualBeat,
} from '../types'
import { buildDrawMeOutCampaign } from './drawMeOutCampaign'

const coverImage = new URL('../img/worlds/draw-me-out.png', import.meta.url).href
const entryImage = new URL('../img/worlds/draw-me-out-entry.png', import.meta.url).href

function build(locale: Locale): StoryCartridge {
  const zh = locale === 'zh'
  const s = (cn: string, en: string) => zh ? cn : en
  const openingBeat = (
    phase: string, action: string, result: string, environment: string, props: string[],
    options: { latent?: boolean; shot?: StoryVisualBeat['shot']; continuity?: string[] } = {},
  ): StoryVisualBeat => ({
    locationId: options.latent ? 'latent-zero' : 'unfinished-rain-city',
    location: options.latent ? 'the unreadable outside of pictures' : 'the unfinished rainy city',
    phase,
    shot: options.shot ?? 'consequence',
    action,
    result,
    subjects: ['SUBJECT A', ...(options.latent ? ['Little Remnant only when explicitly introduced'] : ['frozen anonymous rain-city passersby'])],
    props,
    environment,
    lighting: options.latent
      ? 'one controlled soft edge light in otherwise flat matte-black unreadable non-space'
      : 'continuous cold rainy evening light, wet asphalt reflections and the same distant doorway',
    continuity: options.continuity ?? (options.latent
      ? ['SUBJECT A retains exact supplied identity and tumbles without a floor', 'the red filament remains the only directional relation']
      : ['the same rainy street, suspended droplets, wet crossing and distant door remain visibly continuous', 'SUBJECT A retains exact supplied identity and clothing']),
    avoid: options.latent
      ? [...(phase === 'threshold-fall' ? [] : ['rainy street still presented as the current location']), 'floor', 'horizon', 'architecture', 'unintroduced human stranger', 'rabbit ears', 'superhero costume']
      : ['matte-black latent void', 'empty black background', 'teleporting to another location', 'unintroduced fantasy person', 'rabbit ears'],
    playerVisible: true,
    refresh: true,
  })

  const capabilities: StoryEndingCapability[] = [
    {
      id: 'open-reality-door', label: s('打开回家的门', 'Open the Way Home'),
      meaning: s('用四条回家线索拼出一扇只够一个人通过的门。', 'Use four Home Clues to build a door wide enough for one person.'),
      requires: [{ type: 'fact', id: 'coordinates-four', equals: true }, { type: 'fact', id: 'exit-cost-known', equals: true }],
      mandatoryCosts: ['the_exit_can_carry_only_one_complete_identity'],
    },
    {
      id: 'carry-generated-companion', label: s('带小残一起回家', 'Bring Little Remnant Home'),
      meaning: s('让回家的门记住小残，把它当成一个不能被替换的生命。', 'Make the door remember Little Remnant as a life that cannot be replaced.'),
      requires: [{ type: 'character', id: 'residual', status: 'companion' }, { type: 'fact', id: 'companion-coordinate-earned', equals: true }],
      mandatoryCosts: ['the_player_must_leave_one_coordinate_behind'],
      incompatibleWith: ['preserve-all-worlds'],
    },
    {
      id: 'become-latent-guide', label: s('留下来为别人带路', 'Stay and Guide Others'),
      meaning: s('放弃自己的门，让后来掉进画外的人总能找到方向。', 'Give up your own door so people who fall outside pictures can find a way forward.'),
      requires: [{ type: 'fact', id: 'saved-worlds-three', equals: true }, { type: 'relationship', characterId: 'residual', minTotal: 4 }],
      mandatoryCosts: ['the_player_does_not_return_to_original_reality'],
    },
    {
      id: 'open-all-portals', label: s('打开所有世界的门', 'Open Every World Door'),
      meaning: s('让画中的人也能穿过彼此的世界，不再只能等你来救。', 'Let people in the pictures cross into one another’s worlds instead of waiting for you.'),
      requires: [{ type: 'fact', id: 'optimizer-core-open', equals: true }, { type: 'stat', id: 'compute', min: 55 }],
      mandatoryCosts: ['world_boundaries_remain_unstable'],
      incompatibleWith: ['close-latent-layer'],
    },
    {
      id: 'preserve-all-worlds', label: s('保住画里的所有人', 'Save Everyone in the Pictures'),
      meaning: s('拒绝拿画中世界的消失，换自己一条更容易的回家路。', 'Refuse to erase the picture worlds just to make your own way home easier.'),
      requires: [{ type: 'fact', id: 'exit-erases-worlds', equals: true }, { type: 'fact', id: 'saved-worlds-three', equals: true }],
      mandatoryCosts: ['the_original_reality_route_closes'],
      incompatibleWith: ['carry-generated-companion'],
    },
    {
      id: 'accept-many-forms', label: s('接受多重形象', 'Accept Many Forms'),
      meaning: s('承认自我不依赖一个永远不变的外表，同时保留对完整身份的选择权。', 'Accept that selfhood need not depend on one frozen appearance while preserving agency over complete identity.'),
      requires: [{ type: 'fact', id: 'met-alternate-self', equals: true }, { type: 'stat', id: 'self', min: 45 }],
      mandatoryCosts: ['no_single_image_can_prove_the_player_is_real'],
    },
    {
      id: 'let-residual-leave', label: s('让小残先走', 'Let Little Remnant Go First'),
      meaning: s('把唯一的回家位置交给小残，让它拥有一次真正属于自己的生活。', 'Give the only place home to Little Remnant so it can have a life of its own.'),
      requires: [{ type: 'character', id: 'residual', status: 'companion' }, { type: 'fact', id: 'residual-origin-known', equals: true }],
      mandatoryCosts: ['the_player_remains_between_worlds'],
    },
    {
      id: 'seize-renderer', label: s('关掉抹平者', 'Stop the Smoother'),
      meaning: s('阻止那个把所有人变得一样的东西，保住每个人的不同。', 'Stop the thing making everyone alike and preserve what makes each person different.'),
      requires: [{ type: 'fact', id: 'optimizer-core-open', equals: true }, { type: 'stat', id: 'trace', min: 70 }],
      mandatoryCosts: ['the_player_becomes_visible_to_every_future_generation'],
      incompatibleWith: ['close-latent-layer'],
    },
    {
      id: 'close-latent-layer', label: s('封住画外之地', 'Seal the Outside'),
      meaning: s('让所有图片稳定下来，以后不再有人从画面之间掉出去。', 'Stabilize every picture so no one ever falls out between images again.'),
      requires: [{ type: 'fact', id: 'latent-anchor-complete', equals: true }, { type: 'item', id: 'undo-key', minCount: 1 }],
      mandatoryCosts: ['no_one_can_cross_between_worlds_again'],
      incompatibleWith: ['open-all-portals', 'seize-renderer'],
    },
  ]

  const anchor = (
    id: string, cn: string, en: string, thesisCn: string, thesisEn: string, capabilityIds: string[],
    costs: string[], preserved: string[], lost: string[], unresolved: string[], scenesCn: string[], scenesEn: string[], prompt: string,
  ): StoryEndingAnchor => ({
    id, title: s(cn, en), thesis: s(thesisCn, thesisEn), capabilityIds,
    irreversibleCosts: costs, preserved, lost, unresolved, finaleScenes: zh ? scenesCn : scenesEn, finalImagePrompt: prompt,
  })

  const anchors: StoryEndingAnchor[] = [
    anchor('ordinary-morning', '一张普通的早晨', 'An Ordinary Morning', '你回到了现实，或者至少回到了一张足够稳定的现实。', 'You return to reality—or at least to one stable enough to live in.',
      ['open-reality-door'], ['the_exit_can_carry_only_one_complete_identity'], ['the player identity', 'one ordinary morning'], ['direct contact with the place outside pictures'], ['whether the room is another generated image'],
      ['出口落在一间普通房间里。', '所有东西都遵守重量，雨水也真的会打湿手。', '镜子里的你没有变化。', '只有窗外一只白鸟，尾后拖着一根极细的红线。'],
      ['The exit opens into an ordinary room.', 'Everything obeys weight, and rain truly wets your hand.', 'Your reflection does not change.', 'Only a white bird outside carries one impossibly thin red line behind it.'],
      'quiet ordinary morning room after rain, SUBJECT A seen through natural window reflection with exact complete identity, one tiny white origami bird outside trailing a red filament, emotionally ambiguous realism, 4:5 portrait, no writing, no text, no UI'),
    anchor('visitor-from-a-picture', '从画里来的客人', 'A Visitor from a Picture', '你带小残穿过出口，却必须在现实里给这个本来会被删掉的小生命留一个位置。', 'You bring Little Remnant through and must make room in reality for a small life that was meant to be deleted.',
      ['open-reality-door', 'carry-generated-companion'], ['the_player_must_leave_one_coordinate_behind'], ['the player', 'Little Remnant', 'one shared future'], ['one proof of the original reality'], ['how long reality tolerates Little Remnant'],
      ['你先穿过出口，再回头叫小残的名字。', '它掉在现实地板上，第一次拥有真正的影子。', '第二天，所有相机都把它拍成一块灰尘。', '你仍每天为它留一只小碟子，因为被机器看不见不等于不存在。'],
      ['You cross first, then call Little Remnant by name.', 'It lands on a real floor and casts its first true shadow.', 'The next day every camera records it as dust.', 'You still leave it a small dish, because machines failing to see something does not make it absent.'],
      'SUBJECT A in an ordinary home kneeling beside distinct tiny Little Remnant casting its first real shadow, warm morning, complete player identity exact, intimate magical realism, 4:5 portrait, no writing, no text, no UI'),
    anchor('the-one-who-leaves-signs', '后来者的路标', 'Signs for Those Who Fall Later', '你不再只找自己的出口，而是给后来掉进画外的人留下方向。', 'You stop seeking only your exit and leave directions for those who fall outside pictures later.',
      ['become-latent-guide'], ['the_player_does_not_return_to_original_reality'], ['the blank outside pictures', 'future lost travelers', 'Little Remnant'], ['the original return route'], ['who the next traveler will be'],
      ['你放开四条回家线索，让它们在空白里彼此记住。', '空白仍然没有道路，但后来者只要握住其中一条，就知道下一步往哪里走。', '小残负责欢迎新来的人，你负责告诉他们坏消息。', '很多年后，你仍会听见有人第一次喊出自己的名字。'],
      ['You release four Home Clues and let them remember one another in the blank.', 'There are still no roads, but anyone holding one clue can sense the next step.', 'Little Remnant welcomes newcomers; you deliver the bad news.', 'Years later, you still hear someone say their own name for the first time.'],
      'humanly unreadable latent information as a vast matte near-black non-space, no floor, no horizon, no roads, no architecture and no stable depth; SUBJECT A is a recognizable full-body figure 34 percent of frame height drifting sideways beside smaller Little Remnant and several distant lost travelers; controlled soft edge light reveals the exact identity-defining silhouette, covering, costume colors and patterns; four sparse luminous color, weight, warmth and memory traces gently relate without forming objects, hopeful, no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait'),
    anchor('images-visit-each-other', '画面互访日', 'The Day Pictures Visited', '你打开所有入口，让世界的差异不再只能由你独自承担。', 'You open every entrance so difference is no longer yours alone to carry.',
      ['open-all-portals', 'accept-many-forms'], ['world_boundaries_remain_unstable', 'no_single_image_can_prove_the_player_is_real'], ['many picture worlds', 'free travel', 'multiple forms of the player'], ['one stable genre'], ['which world counts as home'],
      ['失重城的送货员第一次把早餐送进王宫。', '黎姨在预言说完以前宣布散会。', '儿童画的太阳走进退稿荒原，把十二条腿借给迁徙兽。', '你每次过门都有一点不同，但每次都由自己决定留下什么。'],
      ['The Flying City courier delivers breakfast to a palace.', 'Auntie Li adjourns before the prophecy finishes.', 'A twelve-legged child-drawn sun lends its legs to abandoned picture creatures.', 'You change slightly at every door, but always choose what remains.'],
      'joyful meeting inside one newly shared picture where visitors from radically different worlds exchange gifts, SUBJECT A small but clearly recognizable with exact complete identity and Little Remnant overhead, coherent group staging, controlled celebratory 4:5 portrait, no writing, no text, no UI'),
    anchor('keep-them-drawn', '请让他们留在画里', 'Let Them Remain Drawn', '你关闭自己的出口，换来六个世界不再作为失败结果被清理。', 'You close your own exit so six worlds are no longer cleaned away as failed results.',
      ['preserve-all-worlds', 'close-latent-layer'], ['the_original_reality_route_closes', 'no_one_can_cross_between_worlds_again'], ['six worlds', 'their inhabitants', 'their local futures'], ['the player’s exit', 'cross-world travel'], ['whether the player can be remembered across closed frames'],
      ['你最后一次走过六个世界。', '每个世界都以自己的方式记住你，却没人知道你来自哪里。', '撤销键关上最后一条缝。', '画外的空白再也无法被人看见，六个世界却仍各自亮着。'],
      ['You walk through all six worlds once more.', 'Each remembers you differently, though none knows where you came from.', 'The Undo Key closes the final seam.', 'The blank outside pictures can no longer be seen, but all six worlds remain alive.'],
      'six independent picture impressions remaining vivid against 86 percent near-black non-space, no floor, no horizon, no gallery and no frame architecture; each impression shows a different living world while SUBJECT A appears as one tiny exact silhouette walking away inside a single impression, emotional 4:5 portrait, no writing, no text, no UI'),
    anchor('residual-goes-first', '小残先走', 'Little Remnant Goes First', '你把唯一的回家位置交给一个本来会被随手删掉的生命。', 'You give the only place home to a life that was supposed to be deleted.',
      ['open-reality-door', 'let-residual-leave'], ['the_player_remains_between_worlds'], ['Little Remnant’s reality', 'the player’s promise'], ['the player’s immediate return'], ['whether Little Remnant can remember the blank outside pictures'],
      ['出口只能承受一个完整身份。', '小残骂了你一句，还是被你推了进去。', '门外传来一声很轻的、真正落地的声音。', '你转身面对六个世界，发现自己第一次不急着离开。'],
      ['The exit can carry one complete identity.', 'Little Remnant insults you and is pushed through anyway.', 'A small, unmistakably real landing sound comes from beyond.', 'You turn toward six worlds and, for the first time, do not hurry to leave.'],
      'humanly unreadable latent information as a vast matte near-black non-space, no floor, no horizon and no stable depth; SUBJECT A is a recognizable full-body figure 34 percent of frame height drifting sideways while gently releasing distinct Little Remnant toward one warm domestic light impression that does not form a physical doorway; controlled soft edge light reveals exact complete player identity, restrained emotional farewell, no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait'),
    anchor('the-renderer-is-watching', '此后，每张图都知道你', 'Every Picture Knows You Now', '你关掉抹平者，保住所有人的不同，却再也无法从新画面中隐藏。', 'You stop the Smoother and preserve difference, but can never hide from a new picture again.',
      ['seize-renderer', 'accept-many-forms'], ['the_player_becomes_visible_to_every_future_generation', 'no_single_image_can_prove_the_player_is_real'], ['world differences', 'player agency', 'future anomalies'], ['privacy between images'], ['who is choosing when the system speaks in the player’s voice'],
      ['你没有毁掉抹平者，而是让它再也不能删去人与人之间的不同。', '从此以后，每张新图片都会留出一个位置。', '有时那个位置里是你，有时只是你的影子。', '屏幕外的人偶尔会觉得画面正在回望。'],
      ['You do not destroy the Smoother; you prevent it from deleting the differences between people.', 'Every new picture leaves one place open afterward.', 'Sometimes you occupy it; sometimes only your shadow does.', 'Now and then, the person outside the screen feels the image looking back.'],
      'many distinct picture impressions coexist without a chamber, gallery, floor or horizon; 70 percent dark non-space separates them, each preserves a subtle place for SUBJECT A without copying the identity to others; tiny Little Remnant waits beside a thin red relation trace, exact player identity appears in only one image, 4:5 portrait, no writing, no text, no UI'),
    anchor('the-answer-outside', '屏幕外的回答', 'The Answer Outside the Screen', '你不替屏幕外的人定义现实，而是把最后一步变成他们必须亲自回答的问题。', 'You refuse to define reality for the person outside the screen and turn the final step into a question only they can answer.',
      ['accept-many-forms', 'become-latent-guide'], ['the_player_does_not_return_to_original_reality', 'no_single_image_can_prove_the_player_is_real'], ['choice', 'the blank outside pictures', 'an open future'], ['one authored final answer'], ['whether the next choice belongs to the player or the character'],
      ['小残读出三个结局选项。', '你把它们逐个关掉。', '屏幕外还剩一处可以写字的空位。', '你第一次没有等待什么东西替你补完，而是等待另一个人回答。'],
      ['Little Remnant reads three ending choices aloud.', 'You close them one by one.', 'One writable blank remains outside the screen.', 'For the first time you wait not for something to complete you, but for another person to answer.'],
      'humanly unreadable latent information as a vast matte near-black non-space, no floor, no horizon, no doorway, no room and no stable depth; SUBJECT A is a recognizable full-body figure 34 percent of frame height drifting sideways beside smaller Little Remnant, both facing one calm unfilled region distinguished only by a faint warm color relation; controlled soft edge light reveals exact complete player identity, profound but warm fourth-wall ending, no close-up, no cast shadow, no code, no diagrams, no writing, no text, no UI, 4:5 portrait'),
  ]

  const endingDirector: StoryEndingDirector = {
    startRequirements: [
      { type: 'fact', id: 'coordinates-four', equals: true },
      { type: 'fact', id: 'exit-cost-known', equals: true },
      { type: 'scene', min: 18 },
    ],
    capabilities,
    anchors,
    requiredCharacterIds: ['residual', 'default-seven'],
    minRegionalEpilogues: 3,
    maxRepairAttempts: 2,
  }

  const dangerDirector: StoryDangerDirector = {
    minSafeTurns: 2,
    maxSafeTurns: 4,
    cooldownTurns: 2,
    escalationStats: ['self', 'compute', 'trace'],
    threatPalette: zh ? [
      '这个世界开始把你的外形改成它喜欢的样子',
      '周围每个人的脸正在变成同一张礼貌笑脸',
      '被丢掉的画面碎片拼成一只正在乱补东西的怪物',
      '那个负责清理错误的东西发现了你，却抓错了同伴',
      '眼前世界突然换了一套规则，居民同时记得两个互相矛盾的过去',
      '一名路人发现自己只是背景，想抢先占住你的回家位置',
    ] : [
      'the current style begins infecting the player’s complete visual identity and flattening distinctive details',
      'the Smoother replaces distinct people with the same smiling default character',
      'rejected prompt debris gathers into a creature that completes the scene incorrectly',
      'the system notices characters can see choices and starts repairing the wrong subject',
      'the picture world changes genre while residents remember both incompatible versions',
      'a background character realizes their place and tries to occupy the reality exit first',
    ],
    methods: zh
      ? ['利用眼前明显不对劲的地方', '先护住同伴，再和这里的人讲条件', '用余力、道具或记忆硬闯过去']
      : ['use what is visibly wrong with the scene', 'protect a companion, then bargain with the locals', 'spend strength, an item, or a memory to force a way through'],
    physicalCombat: 'rare',
    resolution: {
      skill: s('随机应变', 'Think Fast'), modifier: 2, dcBySeverity: [7, 10, 13, 16, 19],
      fallbackCosts: [{ statId: 'trace', operation: 'add', amount: 14 }],
    },
  }

  const undoKey: InventoryItem = {
    id: 'undo-key', label: s('撤销键', 'Undo Key'), count: 1, rarity: 'legendary',
    detail: s('一枚从画面边缘撬下的实体按键，表面已有三道旧划痕。', 'A physical key pried from the edge of the picture, already bearing three old scratches.'),
    effect: s('可逆转一次重大后果，但每次使用必须永久删去一段记忆、关系或已确认事实。', 'It can reverse one major consequence, but every use must permanently delete a memory, relationship, or confirmed fact.'),
    lore: s('它在你拿到以前就有使用痕迹，说明这可能不是你第一次来到这里。', 'It was already used before you found it, suggesting this may not be your first visit.'),
    metrics: [{ id: 'remaining-uses', label: s('剩余次数', 'Charges'), value: '3' }, { id: 'old-scratches', label: s('旧划痕', 'Old scratches'), value: '3' }],
    imagePrompt: 'single physical undo key with three old scratches and a faint red cursor filament, isolated against 88 percent near-white non-space, no floor, no horizon, object only, no symbols, no readable text, square',
  }
  const clue = (id: string): InventoryItem => ({
    id, count: 1, rarity: 'rare',
    ...(id === 'coordinate-weight' ? {
      label: s('回家线索 · 重量', 'Home Clue · Weight'),
      detail: s('一枚沉甸甸的蓝色碎片，拿起时会让周围东西重新落地。', 'A heavy cobalt fragment that makes nearby things fall again.'),
      effect: s('在漂浮、幻觉或外形混乱时，让你暂时站稳一次。', 'Lets you stand firm once during floating, illusion, or identity drift.'),
      lore: s('会飞走的城市里，那名送货员第一次双脚落地后交给你。', 'Given by the courier after standing on both feet for the first time.'),
      metrics: [{ id: 'proof', label: s('证明', 'Proof'), value: s('身体有重量', 'Bodies have weight') }],
      imagePrompt: 'single dense cobalt home-clue fragment against a near-blank neutral field, bending one thin red filament, one disconnected blue color relation, object only, no floor, no horizon, no symbols, no writing, square',
    } : id === 'coordinate-choice' ? {
      label: s('回家线索 · 空位', 'Home Clue · Blank'),
      detail: s('一枚透明碎片，中间总留着一块谁也不能替你填满的空位。', 'A transparent fragment whose center keeps one space nobody else can fill.'),
      effect: s('可以挡住一次别人替你决定的命运或错误称呼。', 'Blocks one destiny or false name chosen for you.'),
      lore: s('王国第一次允许沉默后，国王从王冠里取出。', 'Removed from the crown after the kingdom first allowed silence.'),
      metrics: [{ id: 'proof', label: s('证明', 'Proof'), value: s('选择需要空位', 'Choice needs room') }],
      imagePrompt: 'single transparent home-clue fragment with one deliberate empty center, near-blank neutral field, one small crown-metal feature without a full crown, no floor, no horizon, no symbols, no writing, object only, square',
    } : id === 'coordinate-leaving' ? {
      label: s('回家线索 · 离开', 'Home Clue · Leaving'),
      detail: s('一枚温热的灰白碎片，靠近没有出口的地方时会发热。', 'A warm gray fragment that heats near places with no exit.'),
      effect: s('可以打开一次被习惯、命令或恐惧锁死的出口。', 'Opens one way out locked by habit, orders, or fear.'),
      lore: s('七年会议第一次散会后，黎姨从废纸篓里捡出来交给你。', 'Given by Auntie Li after the seven-year meeting ended.'),
      metrics: [{ id: 'proof', label: s('证明', 'Proof'), value: s('人可以结束一段经历', 'A person can end an experience') }],
      imagePrompt: 'single warm gray home-clue fragment with one worn brass-key material hint against a near-blank neutral field, no full key, no floor, no horizon, no symbols, no writing, object only, square',
    } : {
      label: s('回家线索 · 被记住', 'Home Clue · Remembered'),
      detail: s('一枚带指纹般暖光的红色碎片；握住它时，会听见别人准确叫出你的名字。', 'A red fragment carrying fingerprint-like warmth; holding it lets you hear someone say your name correctly.'),
      effect: s('在外形被替换时，用一段真实关系确认你仍是同一个人。', 'Uses a real relationship to confirm who you are when appearance is replaced.'),
      lore: s('会贴标签的博物馆第一次撤下错误说明牌后，由不肯忘记你的守门人交出。', 'Given by the museum keeper after the first false label was removed.'),
      metrics: [{ id: 'proof', label: s('证明', 'Proof'), value: s('身份也存在于别人的记忆', 'Identity also lives in another memory') }],
      imagePrompt: 'single warm red home-clue fragment with subtle fingerprint-like light and one human memory trace, near-blank neutral field, no portrait, no floor, no horizon, no symbols, no writing, object only, square',
    }),
  })
  const c = (cn: string, en: string) => s(cn, en)
  const clueEffects = (itemId: 'coordinate-weight' | 'coordinate-choice' | 'coordinate-leaving' | 'coordinate-remembered', factId: string, extra: DomainEffect[]): DomainEffect[] => [
    { type: 'inventory', action: 'add', itemId, count: 1, item: clue(itemId) },
    { type: 'fact', id: factId, value: true },
    ...extra,
    { type: 'map', nodeId: 'latent-zero' },
    { type: 'clock', value: c('没有时间 · 第二次返回', 'No time · Second return') },
    { type: 'objective', value: c('问清回家还缺什么，或者寻找下一扇门', 'Ask what else home needs or find the next door') },
  ]
  const clueRule = (
    id: string,
    match: [string, string],
    mapNodeId: string,
    duplicateReason: string,
    effects: DomainEffect[],
    successText: string,
  ): DomainActionRule => ({
    id, intent: 'claim-first-home-clue', match,
    requirements: [
      { type: 'map', nodeId: mapNodeId, reason: c('眼前的麻烦不在这里。', 'That problem is not here.') },
      { type: 'fact', id: mapNodeId === 'flying-city-rope-street' ? 'coordinate-body' : mapNodeId === 'words-kingdom-palace' ? 'coordinate-choice' : 'coordinate-boundary', notEquals: true, reason: duplicateReason },
    ],
    effects,
    successText,
    successChoices: [c('问小残回家还缺什么', 'Ask what else home needs'), c('把刚拿到的线索放开', 'Release the clue into the blank'), c('自己描述一扇新门', 'Describe a new door yourself')],
  })
  const domainRules: StoryDomainRules = {
    derivedItemMetrics: [{ itemId: 'undo-key', metricId: 'remaining-uses', label: c('剩余次数', 'Charges'), factId: 'undo-key-uses', maximum: 3, mode: 'remaining-from-used' }],
    derivedFacts: [
      { factId: 'home-clue-count', mode: 'owned-item-count', itemIds: ['coordinate-weight', 'coordinate-choice', 'coordinate-leaving', 'coordinate-remembered'] },
      { factId: 'first-coordinate-earned', mode: 'owned-item-threshold', itemIds: ['coordinate-weight', 'coordinate-choice', 'coordinate-leaving', 'coordinate-remembered'], threshold: 1 },
      { factId: 'coordinates-four', mode: 'owned-item-threshold', itemIds: ['coordinate-weight', 'coordinate-choice', 'coordinate-leaving', 'coordinate-remembered'], threshold: 4 },
    ],
    rules: [
      {
        id: 'touch-frozen-rain', intent: 'discover-rain-city',
        match: ['碰一下停在半空的雨', 'Touch the rain frozen in midair'],
        requirements: [{ type: 'fact', id: 'rain-is-pixels', notEquals: true, reason: c('你已经碰过这场悬停的雨。', 'You already touched the suspended rain.') }],
        effects: [
          { type: 'stat', id: 'compute', delta: -4 },
          { type: 'fact', id: 'rain-is-pixels', value: true },
          { type: 'fact', id: 'compute-stat-revealed', value: true },
          { type: 'objective', value: c('从换脸路人、街边白线和远处门里选一种办法确认出口', 'Use the changing passerby, blank edge, or distant door to confirm an exit') },
        ],
        successText: c('你碰到玻璃般的雨滴，整条街同时停住；手臂随之一沉。改变画面会消耗余力。', 'You touch a glassy raindrop. The street freezes; changing the picture spends Strength.'),
        successChoices: [c('叫住换脸的路人', 'Call to the changing-face passerby'), c('摸一下街边的空白', 'Touch the blank at the street edge'), c('直接跑向那扇门', 'Run straight to the distant door')],
        decisionContext: c('雨城仍在眼前：换脸路人、街边白边和远处那扇门，是你能检查的三处异常。', 'The Rain City remains in view: a changing passerby, the blank street edge, and the distant door are the three anomalies you can inspect.'),
        visualBeat: openingBeat('rain-touch', 'SUBJECT A reaches into one glassy raindrop suspended at fingertip distance', 'every raindrop and passerby freezes in the same unfinished street', 'the unfinished rainy city remains fully visible from curb to distant doorway; this is still a street, not the outside of pictures', ['one suspended raindrop at SUBJECT A’s fingertips', 'wet zebra crossing', 'distant fixed door']),
      },
      {
        id: 'inspect-rain-passerby', intent: 'investigate-rain-city', match: ['叫住换脸的路人', 'Call to the changing-face passerby'],
        requirements: [{ type: 'map', nodeId: 'unfinished-rain-city', reason: c('换脸路人不在这里。', 'The changing-face passerby is not here.') }, { type: 'fact', id: 'rain-city-method', equals: 'unset', reason: c('你已经用另一种方法确认了门的位置。', 'You already used another method to locate the door.') }],
        effects: [{ type: 'fact', id: 'rain-city-method', value: 'passerby' }, { type: 'fact', id: 'people-repeat', value: true }, { type: 'fact', id: 'trace-stat-revealed', value: true }, { type: 'stat', id: 'trace', delta: 6 }, { type: 'objective', value: c('在所有路人再次转头以前抵达那扇门', 'Reach the door before every passerby turns again') }],
        successText: c('你叫住最近的路人。他用三张不同的脸回答同一句话，随后整条街的人一起转头记住了你。“被发现”因此出现：画里有多少东西正在注意这个不属于画面的人。只有远处那扇门始终没有换位置。', 'You call to the nearest passerby. They answer one sentence with three different faces, and everyone in the street turns to remember you. Detected appears: it measures how much of the picture is noticing someone who does not belong. Only the distant door stays put.'),
        successChoices: [c('提醒路人街道正在消失', 'Warn them that the street is vanishing'), c('拿走门框上的发亮按键', 'Take the glowing key from the frame'), c('立刻跳进门后的颜色', 'Jump into the color beyond the door')],
        decisionContext: c('换脸路人和整条街都已转头看你；只有远处的门没有换位置，门框上有一枚发亮按键。', 'The changing passerby and the whole street now watch you; only the distant door stays fixed, with one glowing key in its frame.'),
        visualBeat: openingBeat('rain-passerby', 'SUBJECT A calls to the nearest passerby', 'one passerby cycles through three faces while the same street turns toward SUBJECT A', 'the unfinished rainy city remains intact and recognizable, with the distant door fixed in exactly the same position', ['three transient face impressions on one passerby', 'glowing key in the distant doorframe'], { shot: 'clue' }),
      },
      {
        id: 'inspect-rain-blank', intent: 'investigate-rain-city', match: ['摸一下街边的空白', 'Touch the blank at the street edge'],
        requirements: [{ type: 'map', nodeId: 'unfinished-rain-city', reason: c('那段白边不在这里。', 'That blank edge is not here.') }, { type: 'fact', id: 'rain-city-method', equals: 'unset', reason: c('你已经用另一种方法确认了门的位置。', 'You already used another method to locate the door.') }],
        effects: [{ type: 'fact', id: 'rain-city-method', value: 'blank-edge' }, { type: 'fact', id: 'blank-edge-cold', value: true }, { type: 'fact', id: 'self-stat-revealed', value: true }, { type: 'stat', id: 'self', delta: -5 }, { type: 'objective', value: c('趁白边继续改写你以前抵达那扇门', 'Reach the door before the blank edge rewrites more of you') }],
        successText: c('你把手按进街边的空白。它没有温度，却想替你补上一只不属于你的手；你及时抽回，仍有一小段轮廓变淡。“我还是我”因此出现：它记录这幅画还剩多少机会把你认错。白边一直通向远处那扇门。', 'You press a hand into the blank edge. It has no temperature, yet tries to finish you with a hand that is not yours. You pull back as part of your outline fades. Still Me appears: it records how much room the picture has left to mistake you. The blank edge leads to the distant door.'),
        successChoices: [c('提醒路人街道正在消失', 'Warn them that the street is vanishing'), c('拿走门框上的发亮按键', 'Take the glowing key from the frame'), c('立刻跳进门后的颜色', 'Jump into the color beyond the door')],
        decisionContext: c('你仍站在雨城街边；白边正沿路面通向远处的门，门框上有一枚发亮按键。', 'You are still at the Rain City curb; the blank edge runs along the street toward the distant door and its glowing key.'),
        visualBeat: openingBeat('rain-blank-edge', 'SUBJECT A withdraws one hand from a bone-white unfinished edge at the curb', 'the false hand dissolves while the narrow white edge visibly continues along the rainy street to the distant door', 'the rainy street fills most of the frame; only one narrow unfinished white edge interrupts the curb and guides the eye to the same door', ['one narrow bone-white curb edge', 'fading wrong hand outline', 'glowing key in the distant doorframe'], { shot: 'clue' }),
      },
      {
        id: 'inspect-rain-door', intent: 'investigate-rain-city', match: ['直接跑向那扇门', 'Run straight to the distant door'],
        requirements: [{ type: 'map', nodeId: 'unfinished-rain-city', reason: c('那扇门不在这里。', 'That door is not here.') }, { type: 'fact', id: 'rain-city-method', equals: 'unset', reason: c('你已经用另一种方法确认了门的位置。', 'You already used another method to locate the door.') }],
        effects: [{ type: 'fact', id: 'rain-city-method', value: 'direct-door' }, { type: 'fact', id: 'trace-stat-revealed', value: true }, { type: 'stat', id: 'compute', delta: -3 }, { type: 'stat', id: 'trace', delta: 9 }, { type: 'objective', value: c('在脚下斑马线消失以前穿过那扇门', 'Cross before the street vanishes beneath you') }],
        successText: c('你不等路人回答，直接冲向门。重复的街道来不及把你送回原位，却让所有路人同时转头；“被发现”开始上升。门框之后没有房间，只有一团等待决定的颜色，脚下斑马线正一格格消失。', 'You run without waiting for an answer. The looping street cannot reset you in time, but every passerby turns at once and Detected begins to rise. There is no room beyond the frame, only a color waiting to be decided, while the crossing vanishes stripe by stripe.'),
        successChoices: [c('提醒路人街道正在消失', 'Warn them that the street is vanishing'), c('拿走门框上的发亮按键', 'Take the glowing key from the frame'), c('立刻跳进门后的颜色', 'Jump into the color beyond the door')],
        decisionContext: c('你已冲到门前；斑马线正从身后消失，门框按键发亮，门后是不属于雨城的颜色。', 'You have reached the door; the crossing vanishes behind you, the frame key glows, and color beyond it does not belong to the Rain City.'),
        visualBeat: openingBeat('rain-door', 'SUBJECT A runs toward and nearly reaches the fixed distant door', 'the zebra crossing vanishes stripe by stripe behind SUBJECT A as every passerby turns', 'the same unfinished rainy city compresses behind the doorway, still clearly visible and continuous', ['vanishing wet zebra stripes', 'glowing doorframe key', 'unnamed color visible only inside the doorway'], { shot: 'danger' }),
      },
      {
        id: 'acquire-undo-key-jump', intent: 'acquire-undo-key',
        match: ['立刻跳进门后的颜色', '跳进没有名字的颜色', 'Jump into the color beyond the door', 'Jump into the color with no name'],
        requirements: [{ type: 'map', nodeId: 'unfinished-rain-city', reason: c('那扇门不在这里。', 'That door is not here.') }, { type: 'fact', id: 'undo-key-acquired', notEquals: true, reason: c('撤销键已经在你手里，门框上没有第二枚。', 'The Undo Key is already in your hand; there is no second key in the frame.') }],
        effects: [{ type: 'inventory', action: 'add', itemId: 'undo-key', count: 1, item: undoKey }, { type: 'fact', id: 'undo-key-acquired', value: true }, { type: 'fact', id: 'self-stat-revealed', value: true }, { type: 'stat', id: 'self', delta: -6 }, { type: 'map', nodeId: 'latent-zero' }, { type: 'fact', id: 'latent-layer-found', value: true }, { type: 'clock', value: c('没有时间 · 第一次坠落', 'No time · First fall') }, { type: 'objective', value: c('沿红线找到深处那个会动的小东西', 'Follow the red filament toward the small moving thing') }],
        successText: c('你跳进颜色里，顺手扯下唯一一枚撤销键。颜色试图把你改画成别的人，“我还是我”随之下降；你保住轮廓，却没有落地。四周只剩人的眼睛读不懂的深黑无边处、一根红线和几片互不相容的颜色。按键的三道旧划痕旁仍有三次机会。', 'You jump into the color and tear away the one Undo Key. The color tries to redraw you as someone else, lowering Still Me; you preserve your outline but never land. Around you remains only a matte-black non-space human eyes cannot read, one red filament, and incompatible scraps of color. Three uses remain beside the key’s old scratches.'),
        successChoices: [c('沿着红线往前摸', 'Feel forward along the red line'), c('伸手碰最近的颜色碎片', 'Touch the nearest scrap of color'), c('再喊一次有没有人', 'Call out once more')],
        decisionContext: c('雨城正在门外折叠消失；你刚坠入没有地面的深黑无边处，手里是撤销键，眼前只剩一根红线。', 'The Rain City is folding away beyond the door; you have just fallen into a floorless black outside, holding the Undo Key with one red filament ahead.'),
        visualBeat: openingBeat('threshold-fall', 'SUBJECT A tears the glowing Undo Key from the frame while falling through the doorway', 'the rainy street visibly folds and recedes behind SUBJECT A as matte-black unreadable non-space opens ahead', 'a transitional threshold frame: the rainy city remains visible behind one side of the door while the first floorless black outside appears ahead; do not erase the source location abruptly', ['Undo Key with three old scratches', 'one red filament beginning ahead', 'receding wet street'], { latent: true, shot: 'arrival', continuity: ['show the rainy city folding behind the doorway as the explicit source of this transition', 'SUBJECT A retains exact supplied identity while losing contact with the ground'] }),
      },
      {
        id: 'acquire-undo-key', intent: 'acquire-undo-key',
        match: ['提醒路人街道正在消失', '拿走门框上的发亮按键', '发亮的按键', 'Warn them that the street is vanishing', 'Take the glowing key from the frame', 'glowing key from the frame'],
        requirements: [{ type: 'map', nodeId: 'unfinished-rain-city', reason: c('门框已经不在眼前。', 'The doorframe is no longer here.') }, { type: 'fact', id: 'undo-key-acquired', notEquals: true, reason: c('撤销键已经在你手里，门框上没有第二枚。', 'The Undo Key is already in your hand; there is no second key in the frame.') }],
        effects: [{ type: 'inventory', action: 'add', itemId: 'undo-key', count: 1, item: undoKey }, { type: 'fact', id: 'undo-key-acquired', value: true }, { type: 'fact', id: 'self-stat-revealed', value: true }, { type: 'stat', id: 'self', delta: -3 }, { type: 'map', nodeId: 'latent-zero' }, { type: 'fact', id: 'latent-layer-found', value: true }, { type: 'clock', value: c('没有时间 · 第一次坠落', 'No time · First fall') }, { type: 'objective', value: c('沿红线找到深处那个会动的小东西', 'Follow the red filament toward the small moving thing') }],
        successText: c('你扯下唯一一枚撤销键。门后的颜色立刻试图替你补上一张陌生的脸，“我还是我”第一次出现；你保住轮廓，却没有落地。四周变成人眼读不懂的深黑无边处，只剩一根红线和几片互不相容的颜色。按键的三道旧划痕旁仍有三次机会。', 'You tear away the one Undo Key. The color beyond immediately tries to finish you with a stranger’s face, revealing Still Me; you preserve your outline but never land. The world becomes a matte-black non-space human eyes cannot read, leaving one red filament and incompatible scraps of color. Three uses remain beside the key’s old scratches.'),
        successChoices: [c('沿着红线往前摸', 'Feel forward along the red line'), c('伸手碰最近的颜色碎片', 'Touch the nearest scrap of color'), c('再喊一次有没有人', 'Call out once more')],
        decisionContext: c('雨城正在门外折叠消失；你刚坠入没有地面的深黑无边处，手里是撤销键，眼前只剩一根红线。', 'The Rain City is folding away beyond the door; you have just fallen into a floorless black outside, holding the Undo Key with one red filament ahead.'),
        visualBeat: openingBeat('threshold-fall', 'SUBJECT A tears the glowing Undo Key from the frame and falls backward through the doorway', 'the rainy street visibly folds and recedes behind SUBJECT A as matte-black unreadable non-space opens ahead', 'a transitional threshold frame: the rainy city remains visible behind the doorway while the first floorless black outside opens ahead; do not cut directly to an unrelated black scene', ['Undo Key with three old scratches', 'one red filament beginning ahead', 'receding wet street'], { latent: true, shot: 'arrival', continuity: ['show the rainy city folding behind the doorway as the explicit source of this transition', 'SUBJECT A retains exact supplied identity while losing contact with the ground'] }),
      },
      {
        id: 'enter-boundless', intent: 'enter-boundless',
        match: ['握紧撤销键', '抓住那根红线', '大声喊有没有人', 'Hold the Undo Key tight', 'Grab the thin red line', 'Shout to see if anyone is there'],
        requirements: [{ type: 'map', nodeId: 'unfinished-rain-city', reason: c('你已经不在坠落的深井里。', 'You are no longer in the falling shaft.') }, { type: 'item', id: 'undo-key', minCount: 1, reason: c('你还没有拿到撤销键。', 'You do not have the Undo Key yet.') }],
        effects: [{ type: 'map', nodeId: 'latent-zero' }, { type: 'fact', id: 'latent-layer-found', value: true }, { type: 'clock', value: c('没有时间 · 第一次坠落', 'No time · First fall') }, { type: 'objective', value: c('沿红线找到深处那个会动的小东西', 'Follow the red filament toward the small moving thing') }],
        successText: c('你不再下坠，也没有落地。四周是人的眼睛无法读懂的深黑无边处：没有地面、远近或方向，只剩一根红线和几片互不相容的颜色。', 'You stop falling without landing. Around you is a matte-black non-space human eyes cannot decode: no floor, distance, or direction, only one red filament and a few incompatible scraps of color.'),
        successChoices: [c('沿着红线往前摸', 'Feel forward along the red line'), c('伸手碰最近的颜色碎片', 'Touch the nearest scrap of color'), c('再喊一次有没有人', 'Call out once more')],
        decisionContext: c('你悬在没有地面和方向的深黑无边处；唯一能追踪的是从手边延伸出去的红线。', 'You hang in a floorless, directionless black outside; the only trace you can follow is the red filament extending from your hand.'),
        visualBeat: openingBeat('latent-arrival', 'SUBJECT A steadies in weightless suspension and reaches for the red filament', 'the red filament becomes the only readable relation in otherwise humanly unreadable non-space', 'flat matte-black non-space with no floor, horizon, architecture, depth cue or stranger', ['Undo Key', 'one thin red filament', 'two or three non-object color relations'], { latent: true, shot: 'continuity' }),
      },
      {
        id: 'meet-little-remnant', intent: 'meet-little-remnant',
        match: ['沿着红线往前摸', '伸手碰最近的颜色碎片', '再喊一次有没有人', 'Feel forward along the red line', 'Touch the nearest scrap of color', 'Call out once more'],
        requirements: [{ type: 'map', nodeId: 'latent-zero', reason: c('红线深处的小东西不在这里。', 'The small thing at the end of the filament is not here.') }, { type: 'fact', id: 'residual-met', notEquals: true, reason: c('你已经认识小残，它正跟着你。', 'You already know Little Remnant; it is traveling with you.') }],
        effects: [{ type: 'party', change: 'add', characterId: 'residual' }, { type: 'fact', id: 'residual-met', value: true }, { type: 'fact', id: 'residual-introduction-memory', value: true }, { type: 'objective', value: c('选一扇门，先帮一个眼前的人', 'Choose one doorway and help one person first') }],
        successText: c('红线打了个结，漏出一只没折完的白纸鸟：边缘缺块，尾巴仍连着红线。那个声音曾叫它“没删干净的东西”，它嫌太长，只留下“小残”。小残承认自己也迷路了，随后明确加入你。它指向三道漏光裂缝：每道都通往一幅无法自行结束的画；帮助里面的人，会留下拼回家门的线索。', 'The filament knots and releases an unfinished white paper bird, its edges missing and red tail still attached. A voice once called it “something not fully deleted”; it shortened that to Little Remnant. Lost too, it visibly joins you. It points to three leaking cracks: each opens into a picture that cannot end by itself, and helping the person inside leaves a clue for rebuilding the way home.'),
        successChoices: [c('走进会飞走的城市入口', 'Enter the Flying City crack'), c('走进说话成真的王国入口', 'Enter the True Words Kingdom crack'), c('走进七年会议的入口', 'Enter the Seven-Year Meeting crack')],
        decisionContext: c('小残说三道裂缝通往无法结束的画；帮里面的人，就能带回一条回家线索。', 'Little Remnant says the three cracks lead to pictures that cannot end; help someone inside to bring back one Home Clue.'),
        visualBeat: openingBeat('meet-remnant', 'SUBJECT A follows the red filament to its knot', 'the knot unfolds into one tiny unfinished white origami bird with broken pixel edges and introduces itself as Little Remnant', 'flat matte-black non-space with exactly three distant leaking cracks, no physical room and no other person', ['one tiny white origami Little Remnant', 'red filament tail', 'three distinct distant light cracks'], { latent: true, shot: 'clue' }),
      },
      {
        id: 'route-flying-city', intent: 'choose-first-world', match: ['去救快飞走的送货员', 'Save the courier drifting away'],
        requirements: [{ type: 'map', nodeId: 'latent-zero', reason: c('这扇入口只在无边处出现。', 'This entrance only appears in the Boundless.') }, { type: 'character', id: 'residual', status: 'companion', reason: c('先沿红线找到那个知道入口的小东西。', 'First follow the filament to the small guide who knows the entrances.') }, { type: 'fact', id: 'first-world-route', equals: 'unset', reason: c('第一扇门已经选定，不能同时进入另一个世界。', 'The first doorway is already committed; you cannot enter another world at the same time.') }],
        effects: [{ type: 'fact', id: 'first-world-route', value: 'flying-city' }, { type: 'map', nodeId: 'flying-city-rope-street' }, { type: 'stat', id: 'compute', delta: -6 }, { type: 'objective', value: c('先救下送货员，再让这条街的人落地', 'Save the courier, then help the street touch ground') }],
        successText: c('你穿过碎片，立刻开始向天空坠落。这里把重力按月出售，一名试用期刚结束的送货员抱着早餐箱缓慢升空。', 'You cross the fragment and immediately fall upward. This city sells gravity by the month, and a courier whose trial just expired rises with a breakfast box.'),
        successChoices: [c('抓住送货员和早餐箱', 'Catch the courier and breakfast box'), c('让小残钻进收费塔检修口', 'Send Little Remnant into the service hatch'), c('告诉收费塔早餐属于公共服务', 'Claim breakfast is a public service')],
        rejectionChoices: [c('沿着红线往前摸', 'Feel forward along the red line'), c('伸手碰最近的颜色碎片', 'Touch the nearest scrap of color'), c('再喊一次有没有人', 'Call out once more')],
      },
      {
        id: 'route-words-kingdom', intent: 'choose-first-world', match: ['去帮国王说完一句话', 'Help the king finish one sentence'],
        requirements: [{ type: 'map', nodeId: 'latent-zero', reason: c('这扇入口只在无边处出现。', 'This entrance only appears in the Boundless.') }, { type: 'character', id: 'residual', status: 'companion', reason: c('先沿红线找到小残。', 'First follow the filament to Little Remnant.') }, { type: 'fact', id: 'first-world-route', equals: 'unset', reason: c('第一扇门已经选定，不能同时改选。', 'The first doorway is already committed and cannot be changed simultaneously.') }],
        effects: [{ type: 'fact', id: 'first-world-route', value: 'words-kingdom' }, { type: 'map', nodeId: 'words-kingdom-palace' }, { type: 'stat', id: 'trace', delta: 5 }, { type: 'objective', value: c('在预言补完名字以前结束加冕词', 'End the coronation sentence before prophecy supplies a name') }],
        successText: c('你落进一场停在半句上的加冕礼。天空正替国王补完继承人的名字，每个错误名字都会让城堡长出一座牢房。', 'You land in a coronation frozen mid-sentence. The sky is completing the heir’s name for the king, and every wrong name grows a prison.'),
        successChoices: [c('让国王把这句话改成问题', 'Ask the king to turn it into a question'), c('让小残咬掉最后一个词', 'Have Little Remnant bite off the last word'), c('报出一个根本不存在的人', 'Name someone who does not exist')],
        rejectionChoices: [c('沿着红线往前摸', 'Feel forward along the red line'), c('伸手碰最近的颜色碎片', 'Touch the nearest scrap of color'), c('再喊一次有没有人', 'Call out once more')],
      },
      {
        id: 'route-endless-meeting', intent: 'choose-first-world', match: ['去结束那场七年会议', 'End the seven-year meeting'],
        requirements: [{ type: 'map', nodeId: 'latent-zero', reason: c('这扇入口只在无边处出现。', 'This entrance only appears in the Boundless.') }, { type: 'character', id: 'residual', status: 'companion', reason: c('先沿红线找到小残。', 'First follow the filament to Little Remnant.') }, { type: 'fact', id: 'first-world-route', equals: 'unset', reason: c('第一扇门已经选定，不能同时改选。', 'The first doorway is already committed and cannot be changed simultaneously.') }],
        effects: [{ type: 'fact', id: 'first-world-route', value: 'endless-meeting' }, { type: 'map', nodeId: 'endless-meeting-room-three' }, { type: 'stat', id: 'self', delta: -4 }, { type: 'objective', value: c('结束周会，同时保住唯一记得前六年的人', 'End the meeting without losing the only person who remembers') }],
        successText: c('你坐进一场已经开了七年的周会。主管每翻一页空白幻灯片，办公室就换一种故事；只有保洁员黎姨仍记得前六年。', 'You sit down in a meeting that has lasted seven years. Every blank slide changes the office genre; only Auntie Li, the cleaner, remembers the previous six years.'),
        successChoices: [c('拔掉那台没接电的投影仪', 'Unplug the projector with no cable'), c('让黎姨问谁真的有话要说', 'Ask Auntie Li who truly needs to speak'), c('举手提议现在就散会', 'Raise your hand and end the meeting now')],
        rejectionChoices: [c('沿着红线往前摸', 'Feel forward along the red line'), c('伸手碰最近的颜色碎片', 'Touch the nearest scrap of color'), c('再喊一次有没有人', 'Call out once more')],
      },
      clueRule('claim-weight-direct', ['抓住送货员和早餐箱', 'Catch the courier and breakfast box'], 'flying-city-rope-street', c('重量线索已经取得，不能重复领取。', 'The Weight clue was already claimed.'), clueEffects('coordinate-weight', 'coordinate-body', [{ type: 'fact', id: 'weight-method', value: 'direct-catch' }, { type: 'stat', id: 'compute', delta: -8 }, { type: 'stat', id: 'self', delta: 6 }, { type: 'stat', id: 'trace', delta: 4 }]), c('你把自己和路灯绳结在一起，硬生生抓住送货员与早餐箱。你的余力明显下降，但送货员记住了那个亲手接住自己的人。收费塔被迫给整条街十分钟公共重力；送货员双脚落地后，把唯一的蓝色“重量”线索交给你。', 'You tie yourself to a lamppost and catch both courier and breakfast box. Your Strength drops sharply, but the courier remembers who caught them. The tower grants the street ten minutes of public gravity, and the grounded courier gives you the one blue Weight clue.')),
      clueRule('claim-weight-remnant', ['让小残钻进收费塔检修口', 'Send Little Remnant into the service hatch'], 'flying-city-rope-street', c('重量线索已经取得，不能重复领取。', 'The Weight clue was already claimed.'), clueEffects('coordinate-weight', 'coordinate-body', [{ type: 'fact', id: 'weight-method', value: 'remnant-hatch' }, { type: 'fact', id: 'residual-took-gravity-risk', value: true }, { type: 'stat', id: 'compute', delta: -2 }, { type: 'stat', id: 'trace', delta: 7 }]), c('小残钻进检修口，用纸翼卡住收费轮；你只花少量余力接住缓缓落下的送货员，但小残尾端的红线被机器烧黑了一截。整条街得到十分钟公共重力，送货员把唯一的蓝色“重量”线索交给你。', 'Little Remnant jams the billing wheel with one paper wing. You spend little Strength catching the slowly descending courier, but the machine chars part of the red tail. The street gains ten minutes of public gravity, and the courier gives you the one blue Weight clue.')),
      clueRule('claim-weight-loophole', ['告诉收费塔早餐属于公共服务', 'Claim breakfast is a public service'], 'flying-city-rope-street', c('重量线索已经取得，不能重复领取。', 'The Weight clue was already claimed.'), clueEffects('coordinate-weight', 'coordinate-body', [{ type: 'fact', id: 'weight-method', value: 'public-service' }, { type: 'fact', id: 'public-gravity-precedent', value: true }, { type: 'stat', id: 'trace', delta: 13 }, { type: 'stat', id: 'self', delta: 4 }]), c('你当众指出早餐配送属于公共服务。收费塔无法反驳，只能给整条街十分钟公共重力；这条漏洞被所有人记住，也让“被发现”明显上升。送货员第一次站着完成配送，把唯一的蓝色“重量”线索交给你。', 'You publicly classify breakfast delivery as a public service. The tower cannot object and grants ten minutes of gravity. Everyone remembers the loophole, sharply raising Detected. The courier completes a delivery standing up and gives you the one blue Weight clue.')),
      clueRule('claim-choice-question', ['让国王把这句话改成问题', 'Ask the king to turn it into a question'], 'words-kingdom-palace', c('空位线索已经取得，不能重复领取。', 'The Blank clue was already claimed.'), clueEffects('coordinate-choice', 'coordinate-choice', [{ type: 'fact', id: 'choice-method', value: 'open-question' }, { type: 'stat', id: 'compute', delta: -5 }, { type: 'stat', id: 'self', delta: 6 }]), c('你让国王把加冕词改成一个问题。问题允许沉默，天空第一次找不到能强塞进去的名字。国王把王冠里唯一的透明“空位”线索交给你：这一次，空白属于作答的人。', 'You have the king turn the coronation into a question. A question permits silence, and the sky cannot force in a name. The king gives you the one transparent Blank clue: this time, the empty place belongs to whoever answers.')),
      clueRule('claim-choice-remnant', ['让小残咬掉最后一个词', 'Have Little Remnant bite off the last word'], 'words-kingdom-palace', c('空位线索已经取得，不能重复领取。', 'The Blank clue was already claimed.'), clueEffects('coordinate-choice', 'coordinate-choice', [{ type: 'fact', id: 'choice-method', value: 'remnant-bite' }, { type: 'fact', id: 'residual-defied-prophecy', value: true }, { type: 'stat', id: 'trace', delta: 7 }, { type: 'stat', id: 'self', delta: 3 }]), c('小残咬掉最后一个词，预言第一次留下一个真正的空位。它被天空追着咬掉半片纸翼，却得意地把那块透明缺口叼给国王。国王将它封成唯一的“空位”线索交给你。', 'Little Remnant bites off the final word, leaving prophecy with a real blank. The sky tears half a paper wing in retaliation, but the creature proudly carries the gap to the king, who seals it into the one Blank clue.')),
      clueRule('claim-choice-impossible', ['报出一个根本不存在的人', 'Name someone who does not exist'], 'words-kingdom-palace', c('空位线索已经取得，不能重复领取。', 'The Blank clue was already claimed.'), clueEffects('coordinate-choice', 'coordinate-choice', [{ type: 'fact', id: 'choice-method', value: 'impossible-name' }, { type: 'fact', id: 'impossible-name-entered-world', value: true }, { type: 'stat', id: 'trace', delta: 12 }, { type: 'stat', id: 'self', delta: -4 }]), c('你报出一个不存在的名字。天空无法替不存在的人决定命运，只能留下空白；但那个名字在远处轻轻回答了一声，让你的一小段轮廓变得陌生。国王把唯一的“空位”线索交给你。', 'You name someone who does not exist. The sky cannot choose a fate for nobody and leaves a blank, but the name answers from far away and part of your outline feels unfamiliar. The king gives you the one Blank clue.')),
      clueRule('claim-leaving-unplug', ['拔掉那台没接电的投影仪', 'Unplug the projector with no cable'], 'endless-meeting-room-three', c('离开线索已经取得，不能重复领取。', 'The Leaving clue was already claimed.'), clueEffects('coordinate-leaving', 'coordinate-boundary', [{ type: 'fact', id: 'leaving-method', value: 'break-projector' }, { type: 'stat', id: 'compute', delta: -7 }, { type: 'stat', id: 'trace', delta: 4 }]), c('你拔掉一台根本没接电的投影仪。为了让这个动作成立，画面从你的余力里借走一截；空白幻灯片终于熄灭。黎姨把唯一一枚温热的“离开”线索交给你。', 'You unplug a projector with no cable. To make the act possible, the picture borrows a piece of your Strength; the blank slides finally go dark. Auntie Li gives you the one warm Leaving clue.')),
      clueRule('claim-leaving-auntie', ['让黎姨问谁真的有话要说', 'Ask Auntie Li who truly needs to speak'], 'endless-meeting-room-three', c('离开线索已经取得，不能重复领取。', 'The Leaving clue was already claimed.'), clueEffects('coordinate-leaving', 'coordinate-boundary', [{ type: 'fact', id: 'leaving-method', value: 'auntie-question' }, { type: 'fact', id: 'auntie-ended-silence', value: true }, { type: 'stat', id: 'self', delta: 7 }, { type: 'stat', id: 'trace', delta: 7 }]), c('黎姨问：“谁真的还有话要说？”七年里第一次，没有人举手。她替所有人按灭投影仪，也记住是你把发言权还给了房间。散会后，她把唯一一枚温热的“离开”线索交给你。', 'Auntie Li asks, “Who truly still needs to speak?” For the first time in seven years, nobody raises a hand. She switches off the projector and remembers who returned the room its voice, then gives you the one warm Leaving clue.')),
      clueRule('claim-leaving-declare', ['举手提议现在就散会', 'Raise your hand and end the meeting now'], 'endless-meeting-room-three', c('离开线索已经取得，不能重复领取。', 'The Leaving clue was already claimed.'), clueEffects('coordinate-leaving', 'coordinate-boundary', [{ type: 'fact', id: 'leaving-method', value: 'player-adjourned' }, { type: 'stat', id: 'self', delta: 5 }, { type: 'stat', id: 'trace', delta: 12 }]), c('你举手，只说“现在散会”。主管还没来得及反驳，所有人已经站起来；这句结束语让整栋楼都记住了你。黎姨从废纸篓里捡出唯一一枚温热的“离开”线索交给你。', 'You raise a hand and say only, “We are done now.” Everyone stands before the manager can object, and the whole building remembers who ended the meeting. Auntie Li retrieves the one warm Leaving clue and gives it to you.')),
      {
        id: 'undo-with-rain-cost', intent: 'use-undo-key-with-cost', match: ['用撤销键忘掉悬停的雨', '按下撤销键并忘掉悬停的雨', 'Use Undo and forget the suspended rain', 'Press Undo and forget the frozen rain'],
        requirements: [{ type: 'item', id: 'undo-key', minCount: 1, reason: c('你没有撤销键。', 'You do not have the Undo Key.') }, { type: 'fact', id: 'undo-key-uses', max: 2, reason: c('撤销键已经没有剩余次数。', 'The Undo Key has no uses remaining.') }, { type: 'danger', phases: ['warning', 'confrontation'], reason: c('眼前没有需要撤销的重大后果。', 'There is no major consequence to undo right now.') }, { type: 'fact', id: 'rain-is-pixels', equals: true, reason: c('你已经不记得悬停的雨，不能再次支付同一段记忆。', 'You no longer remember the suspended rain, so the same memory cannot be paid twice.') }, { type: 'fact', id: 'undo-cost-rain-spent', notEquals: true, reason: c('悬停的雨这段记忆已经永久失去。', 'The memory of the suspended rain is already permanently gone.') }],
        effects: [{ type: 'fact-add', id: 'undo-key-uses', delta: 1 }, { type: 'fact', id: 'rain-is-pixels', value: false }, { type: 'fact', id: 'undo-cost-rain-spent', value: true }, { type: 'fact', id: 'first-optimizer-survived', value: true }, { type: 'stat', id: 'trace', delta: -18 }, { type: 'danger', outcome: 'success' }, { type: 'objective', value: c('继续当前旅程，记住刚才永久失去的东西', 'Continue the journey while carrying what was permanently lost') }],
        successText: c('你明确选择忘掉“雨曾悬在半空”这件事，撤销键才肯按下。白色退去，小残恢复原样；按键剩余两次，而那段雨的记忆永久空了。', 'You explicitly choose to forget that the rain once hung in midair, and only then does the Undo Key depress. The white recedes and Little Remnant returns to itself. Two uses remain, while that rain memory is permanently blank.'),
        successChoices: [c('进入下一幅陌生的画', 'Enter the next unfamiliar picture'), c('先问小残一个问题', 'Ask Little Remnant one question first'), c('检查带回来的线索', 'Examine the clue you brought back')],
      },
      {
        id: 'undo-with-door-cost', intent: 'use-undo-key-with-cost', match: ['用撤销键忘掉怎样找到门', '忘掉怎样找到门', 'Use Undo and forget how the door was found'],
        requirements: [{ type: 'item', id: 'undo-key', minCount: 1, reason: c('你没有撤销键。', 'You do not have the Undo Key.') }, { type: 'fact', id: 'undo-key-uses', max: 2, reason: c('撤销键已经没有剩余次数。', 'The Undo Key has no uses remaining.') }, { type: 'danger', phases: ['warning', 'confrontation'], reason: c('眼前没有需要撤销的重大后果。', 'There is no major consequence to undo right now.') }, { type: 'fact', id: 'rain-city-method', notEquals: 'unset', reason: c('你还没有一段寻找雨城出口的记忆可以支付。', 'You have no memory of finding the Rain City exit to pay.') }, { type: 'fact', id: 'rain-city-method', notEquals: 'forgotten', reason: c('你已经忘了怎样找到那扇门。', 'You already forgot how the door was found.') }, { type: 'fact', id: 'undo-cost-door-spent', notEquals: true, reason: c('寻找出口的记忆已经永久失去。', 'The exit-finding memory is already gone.') }],
        effects: [{ type: 'fact-add', id: 'undo-key-uses', delta: 1 }, { type: 'fact', id: 'rain-city-method', value: 'forgotten' }, { type: 'fact', id: 'undo-cost-door-spent', value: true }, { type: 'stat', id: 'trace', delta: -16 }, { type: 'danger', outcome: 'success' }],
        successText: c('你选择忘掉自己怎样找到雨城出口。危险退去，门仍然存在于地图上，但那段亲手走到门前的过程从你心里断开了。', 'You choose to forget how you found the Rain City exit. The danger retreats; the door remains on the map, but the lived path to it is gone from you.'),
        successChoices: [c('请小残复述那段路', 'Ask Little Remnant to recount the route'), c('继续处理当前问题', 'Continue with the current problem'), c('检查撤销键的新划痕', 'Inspect the new mark on the Undo Key')],
      },
      {
        id: 'undo-with-remnant-cost', intent: 'use-undo-key-with-cost', match: ['用撤销键忘掉小残的自我介绍', '忘掉小残的自我介绍', 'Use Undo and forget Little Remnant’s introduction'],
        requirements: [{ type: 'item', id: 'undo-key', minCount: 1, reason: c('你没有撤销键。', 'You do not have the Undo Key.') }, { type: 'fact', id: 'undo-key-uses', max: 2, reason: c('撤销键已经没有剩余次数。', 'The Undo Key has no uses remaining.') }, { type: 'danger', phases: ['warning', 'confrontation'], reason: c('眼前没有需要撤销的重大后果。', 'There is no major consequence to undo right now.') }, { type: 'fact', id: 'residual-introduction-memory', equals: true, reason: c('你已经不记得小残第一次怎样介绍自己。', 'You no longer remember how Little Remnant first introduced itself.') }, { type: 'fact', id: 'undo-cost-remnant-spent', notEquals: true, reason: c('小残的初次介绍已经永久失去。', 'Little Remnant’s introduction is already permanently gone.') }],
        effects: [{ type: 'fact-add', id: 'undo-key-uses', delta: 1 }, { type: 'fact', id: 'residual-introduction-memory', value: false }, { type: 'fact', id: 'undo-cost-remnant-spent', value: true }, { type: 'stat', id: 'self', delta: -5 }, { type: 'stat', id: 'trace', delta: -18 }, { type: 'danger', outcome: 'success' }],
        successText: c('你选择忘掉小残第一次从红线里钻出来、又怎样给自己取名。危险退去，它仍在你身边，却必须重新告诉你：“我是小残。至少现在还是。”', 'You choose to forget Little Remnant emerging from the red line and naming itself. The danger retreats. It remains beside you and has to say, “I am Little Remnant. At least for now.”'),
        successChoices: [c('让小残重新介绍自己', 'Let Little Remnant introduce itself again'), c('继续处理当前问题', 'Continue with the current problem'), c('检查撤销键的新划痕', 'Inspect the new mark on the Undo Key')],
      },
      {
        id: 'undo-without-cost', intent: 'use-undo-key-without-cost', match: ['按下撤销键退回刚才', '按下撤销键', 'Press Undo and return to before', 'Press Undo'],
        requirements: [{ type: 'fact', id: 'undo-cost-selected', equals: true, reason: c('撤销不能免费发生。先明确说出你愿意永久失去哪段记忆、关系或事实。', 'Undo cannot happen for free. First name the memory, relationship, or fact you will permanently lose.') }], effects: [],
        successText: c('撤销键没有动。', 'The Undo Key does not move.'),
        successChoices: [c('用撤销键，忘掉悬停的雨', 'Use Undo and forget the suspended rain'), c('把线索交给小残让它先跑', 'Give the clue to Little Remnant and tell it to run'), c('不用撤销，自己决定怎么做', 'Do not Undo; decide another action')],
        rejectionChoices: [c('用撤销键，忘掉悬停的雨', 'Use Undo and forget the suspended rain'), c('把线索交给小残让它先跑', 'Give the clue to Little Remnant and tell it to run'), c('不用撤销，自己决定怎么做', 'Do not Undo; decide another action')],
      },
    ],
  }

  const chapters = [
    {
      id: 'unfinished-opening', title: s('序章：这张图还没画完', 'Prologue: This Picture Is Not Finished'), unlock: s('开局立即进行', 'Available immediately'),
      emotionalPurpose: s('用身体异常、重复路人与一扇错误的门，让玩家亲自发现困境。', 'Let the player discover the predicament through bodily wrongness, repeated people, and an impossible door.'),
      beats: s('触碰停住的雨；识别换脸路人；取得撤销键；掉进画外之地；认识小残', 'Touch frozen rain; identify the changing-face passerby; take the Undo Key; fall outside the picture; meet Little Remnant').split(zh ? '；' : ';'),
      completionFacts: ['residual-met', 'latent-layer-found'],
    },
    {
      id: 'first-coordinate', title: s('第一幕：第一条回家线索', 'Act I: The First Home Clue'), unlock: s('认识小残后', 'After meeting Little Remnant'),
      emotionalPurpose: s('用三个通俗、好笑的世界证明探索规则，并让玩家第一次帮助具体的人。', 'Use three accessible comic worlds to teach exploration and let the player help someone concrete.'),
      beats: s('选择第一扇门；看懂当地麻烦；帮助一个具体的人；带回第一条线索；第一次回到画外之地', 'Choose a first door; understand its problem; help one person; return with one clue; come back outside the pictures').split(zh ? '；' : ';'),
      completionFacts: ['first-coordinate-earned'],
    },
    {
      id: 'six-open-worlds', title: s('第二幕：六幅不肯结束的画', 'Act II: Six Pictures That Refuse to End'), unlock: s('取得第一条回家线索', 'After earning the first Home Clue'),
      emotionalPurpose: s('提供真正自由的世界选择，同时让每个短世界都有一名可记住的人和一种无法轻易解决的代价。', 'Offer real freedom while giving every short world one memorable person and one meaningful cost.'),
      beats: s('探索至少三个不同画风；每个世界三至五步；记住人物与物品；可自由描述新世界；让被救的人在画外留下痕迹', 'Explore at least three different styles; three to five steps each; remember people and items; allow a freely described world; let saved people leave traces outside the pictures').split(zh ? '；' : ';'),
      completionFacts: ['saved-worlds-three'],
    },
    {
      id: 'choices-can-see-you', title: s('幕间：小残看见了按钮', 'Interlude: Little Remnant Sees the Buttons'), unlock: s('第二次回到画外之地后', 'After the second return outside the pictures'),
      emotionalPurpose: s('让第四堵墙从笑话变成威胁：角色看见玩家没有选择的选项，抹平者也因此发现玩家。', 'Turn the fourth wall from a joke into a threat: characters see unchosen options, and the Smoother notices the player.'),
      beats: s('小残读出未选行动；遇见另一个自己；抹平者首次出现；决定是否让小残继续知道屏幕外的事', 'Little Remnant reads unchosen actions; meet an alternate self; first encounter with the Smoother; decide whether Little Remnant should keep looking outside').split(zh ? '；' : ';'),
      completionFacts: ['residual-sees-choices', 'met-alternate-self'],
    },
    {
      id: 'undo-cost', title: s('第三幕：撤销不是回到原样', 'Act III: Undo Does Not Restore Everything'), unlock: s('发生第一次不可逆失败或主动使用撤销键', 'After the first irreversible failure or voluntary Undo use'),
      emotionalPurpose: s('让撤销键从便利工具变成情感选择，并揭示旧划痕属于玩家自己。', 'Turn Undo from convenience into an emotional choice and reveal that the old scratches belong to the player.'),
      beats: s('明确使用代价；删除一项真实关系或记忆；救回角色或世界；发现旧周目痕迹；小残质疑玩家是否曾经抛下它', 'State the cost; delete one real relationship or memory; restore a person or world; find evidence of an earlier run; Little Remnant asks whether the player abandoned it before').split(zh ? '；' : ';'),
      completionFacts: ['undo-truth-known', 'residual-origin-known'],
    },
    {
      id: 'reality-coordinates', title: s('第四幕：什么东西证明你真实', 'Act IV: What Proves You Are Real'), unlock: s('获得至少三条回家线索', 'After earning at least three Home Clues'),
      emotionalPurpose: s('把回家目标变成对身份、关系、重量、边界和记忆的理解，而不是收集钥匙开门。', 'Transform going home into an understanding of identity, relationship, weight, boundary, and memory rather than a key hunt.'),
      beats: s('补齐四条回家线索；每条来自具体选择；拼出模糊的家；发现照片里的空位；确认出口会清理部分图片世界', 'Complete four Home Clues; earn each through a concrete choice; assemble a blurred image of home; discover its empty place; learn the exit will clean some picture worlds').split(zh ? '；' : ';'),
      completionFacts: ['coordinates-four', 'exit-erases-worlds'],
    },
    {
      id: 'optimizer-core', title: s('第五幕：把所有人变得一样', 'Act V: Make Everyone the Same'), unlock: s('线索齐全，而且你快被发现', 'All clues found and you are close to being detected'),
      emotionalPurpose: s('让反派的逻辑可理解：它用消灭差异防止错误，却因此让任何人的消失都不再重要。', 'Make the antagonist understandable: it removes difference to prevent error, making anyone’s disappearance unimportant.'),
      beats: s('穿过被丢掉的画；找到抹平者的源头；见到默认七号；理解它为什么害怕不同；找到最终出口并明确代价', 'Cross the Abandoned Picture; find the source of the Smoother; meet Default Seven; understand why it fears difference; find the final exit and name its cost').split(zh ? '；' : ';'),
      completionFacts: ['optimizer-core-open', 'exit-cost-known'],
    },
    {
      id: 'final-render', title: s('终章：请把谁画出去', 'Finale: Draw Whom Out'), unlock: s('四条回家线索、出口代价与抹平者的源头全部确认', 'Four Home Clues, the exit cost, and the source of the Smoother confirmed'),
      emotionalPurpose: s('把回家、保留世界、同伴与自我形象变成连续行动，以多样 AI 尾声回答玩家一路真正珍惜了什么。', 'Turn home, worlds, companions, and self-image into consecutive actions, then generate a varied epilogue from what the player truly protected.'),
      beats: s('冻结状态；确认可用结局能力；选择谁能通过；决定图片世界去向；处理小残的去留；允许自由输入最后答案；生成兼容尾声', 'Freeze state; verify ending capabilities; choose who can pass; decide the worlds’ fate; resolve Little Remnant’s future; allow a free final answer; generate a compatible epilogue').split(zh ? '；' : ';'),
      completionFacts: ['true-ending-started'],
    },
  ]

  return {
    schemaVersion: 1,
    id: 'draw-me-out',
    locale,
    coverImage,
    entryImage,
    copy: {
      title: s('请把我画出去', 'DRAW ME OUT'),
      subtitle: s('你可能是个人。系统暂时没发现。', 'You may be a person. The system has not noticed yet.'),
      promise: s('走进一幅幅失控的画，找齐四条回家线索，再决定要不要一个人离开。', 'Enter pictures gone wrong, find four Home Clues, and decide whether to leave alone.'),
      enter: s('碰一下停在半空的雨', 'Touch the rain frozen in midair'),
      continue: s('继续找回家的路', 'Keep looking for the way home'),
      customAction: s('也可以直接说你想怎么做', 'Or say exactly what you want to do'),
      itemImagingTitle: s('正在记住这件东西的样子', 'Remembering what this object looks like'),
      itemImagingBody: s('它从原来的画里带回了一点颜色。图像会在后台慢慢完整，不影响你继续行动。', 'It carried a little color back from its picture. Its image will finish quietly while you continue.'),
    },
    theme: {
      outer: '#10161b', surface: '#171e24', paper: '#f2f0e8', ink: '#10161b', muted: '#697078',
      accent: '#2f63d8', danger: '#ff4b35', gold: '#168d77', material: 'wayfarer',
    },
    audioTheme: {
      material: 'latent', bpm: 78, rootHz: 110, scale: [0, 2, 3, 7, 9],
      levels: { music: .14, ambient: .17, sfx: .44, master: .48 },
      tension: [
        { statId: 'self', direction: 'low', weight: .38 },
        { statId: 'compute', direction: 'low', weight: .22 },
        { statId: 'trace', direction: 'high', weight: .4 },
      ],
    },
    itemImageDirection: 'single generated-world artifact against a near-blank neutral field with one disconnected scrap of its original color, preserve exact current wear, object only, no floor, no horizon, no people, no symbols, no readable text, no pseudo-text',
    sceneImageDirection: 'cinematic 4:5 generated-picture odyssey with one immediate action and one readable focal hierarchy; treat the current authoritative visual snapshot as the sole source of location, environment, lighting, gravity, medium and visible cast; preserve the previous scene only through continuity details explicitly named in that snapshot; SUBJECT A remains a recognizable figure whose supplied reference is authoritative for identity, silhouette, form, covering, costume, colors, patterns and accessories; never invent anatomy or wardrobe and never transfer reference traits to another subject; every picture-world may change medium and genre but must stay internally coherent for that visit; never depict code, matrices, neural diagrams, data streams, technical UI, logo, border, watermark or readable text',
    sceneImageAvoid: 'the cover composition, repeated rainy doorway unless the current event is explicitly the opening, generic lone traveler pose, same portal arrangement in every world, duplicated player identity, transferred reference traits, UI, border, logo, watermark, readable text, letters or pseudo-writing',
    playerImageAliases: ['SUBJECT A', 'player protagonist', 'the player', 'the escaped subject', '主角', '玩家', '你'],
    playerImageRole: 'SUBJECT A is the player-controlled person or complete visible form that fell out of an unfinished image; the supplied reference is authoritative for silhouette, form or species, proportions, materials, coverings, costume, colors, patterns, accessories and face visibility; story duties never define anatomy or clothing',
    playerImageExclusions: [
      'Little Remnant is a tiny white origami-bird outline with broken black pixel edges and one red cursor tail, never a human and never reference-derived',
      'Default Seven is a deliberately generic smiling synthetic person with a neutral gray jumpsuit and its own distinct face, never reference-derived',
      'every local courier, king, cleaner, resident, alternate reflection, animal, monster, prop and background figure has its own identity and can never inherit the player reference silhouette, face, covering, costume, colors, patterns or species',
      'alternate versions of the player must be abstract translucent silhouettes unless the player is the primary actor and all versions are explicitly required by the current event',
    ],
    imageDirector: {
      maxQuietTurns: 2,
      softCooldownTurns: 0,
      guaranteedTriggers: ['new-location', 'rare-item', 'party-change', 'chapter-checkpoint', 'relationship-change', 'objective-change', 'skill-outcome'],
      softTriggers: [],
    } satisfies StoryImageDirector,
    mediaDirector: {
      imageProfile: 'fast-small', imageTarget: { width: 512, height: 640 },
      videoEnabled: false, videoDuration: 5, minVideoGapTurns: 8,
    },
    director: {
      mode: 'open-world',
      maxActiveThreads: 2,
      mainQuest: s(
        '从画外之地进入一幅幅规则不同的图片，帮助里面的人解决眼前麻烦，找到重量、选择、离开与被记住这四条回家线索；在抹平者找到你以前拼出出口，并决定谁能离开。',
        'Enter pictures with different rules, help one person at a time, and recover four Home Clues—weight, choice, leaving, and being remembered. Build an exit before the Smoother finds you, then decide who can leave.',
      ),
      chapters,
      finaleRule: s(
        '只有 coordinates-four、exit-cost-known 与 optimizer-core-open 已确认，且玩家明确开始不可逆的出口处理时，才能发出 true_ending；任何图片世界完成和返回画外空白都必须保持可继续。',
        'Emit true_ending only after coordinates-four, exit-cost-known, and optimizer-core-open are confirmed and the player explicitly begins the irreversible exit sequence; every picture-world completion and return to the blank outside pictures remains resumable.',
      ),
      fixedWorldRules: zh ? [
        '玩家是没有技术背景的普通人，主角不能突然懂得模型、采样、参数、构图或系统原理；只从眼前能看见和摸到的事情作判断。',
        '玩家的完整可见身份来自当前用户头像，不能被静默替换、只保留脸部，或转移给其他人物、动物、反射与道具。',
        '真正的潜在表示是程序可读、人类无法直接理解的高维信息，不是物理地点或空白画布。画外之地只是主角感官的失败翻译：没有地面、地平线、方向、比例和远近关系，只偶尔读出颜色关系、边缘、材质或动作残影。主角把无法读取的部分感受成无边深黑，玩家在这里以占画面高度 30–36% 的失重全身形象出现，能看清头像中的完整身份特征但不使用大特写。',
        '物品、伙伴、承诺、伤势、记忆、已确认事实和回家线索跨世界与存档持续存在，除非可见事件明确改变。',
        '角色对选项、读档、字幕与生成失败的第四堵墙认知必须逐层获得，不能随机全知。',
        '未登场角色不能出现在人物面板、对话、目标或选项中。首次出现必须先让玩家看见它、用日常语言说清外形与名字来源，再允许相关互动；加入同行也必须在正文中明确发生。',
        '主线目标是回到现实，但出口代价与现实是否仍是另一张图必须由探索和最终选择揭示。',
      ] : [
        'The player is an ordinary person with no technical background. The protagonist cannot suddenly understand models, sampling, parameters, composition, or system architecture and may only reason from visible events.',
        'The player’s complete visible identity comes from the current user avatar and cannot be silently replaced, reduced to a face, or transferred to another person, animal, reflection, or prop.',
        'The actual latent representation is high-dimensional machine-readable information, not a physical place or empty canvas. The outside is only the protagonist’s failed perceptual translation: no floor, no horizon, no direction, no stable scale, and no readable depth, only occasional color relations, edges, material hints, or motion traces. Unreadable content is perceived as a boundless matte-black non-space. The player appears as a weightless full-body figure 30–36 percent of frame height so the avatar’s complete identity traits remain readable without becoming a close-up.',
        'Items, companions, promises, injuries, memories, confirmed facts, and Home Clues persist across worlds and saves until a visible event changes them.',
        'Fourth-wall awareness of choices, reloads, captions, and generation failure must be earned in layers rather than appear as random omniscience.',
        'An unmet character cannot appear in the roster, dialogue, objective, or choices. Their debut must first show a visible form and explain the everyday source of their name; only then may choices address them, and joining the party must visibly happen in prose.',
        'The main goal is to return to reality, while the exit cost and whether reality is another image are revealed through exploration and final choice.',
      ],
      generationRules: zh ? [
        '可生成新图片世界、本地麻烦、居民、物品与出口，但必须保留画外之地、固定角色与已确认状态。',
        '所有玩家可见文字使用日常语言。每屏最多介绍一个新概念，先写具体经历再取名字；禁止用潜空间、采样、权重、优化器、渲染、提示词、模型参数或其他技术词解释事件。',
        '三个选择都必须来自玩家此刻能看见的东西，写成一个明确动词加对象或目的，中文优先不超过十八字；禁止把世界观说明或抽象判断塞进按钮。',
        '每回合必须改变地点、危险、关系、物品、坐标、身份事实或直接目标，禁止空确认与重复调查循环。',
        '一次图片世界停留三至五次决策，最多一条支线且只持续一至两次决策；随后必须结算或返回。',
        '幽默来自世界认真执行荒诞视觉或行政规则，不使用无关网络梗，也不把每句话都写成笑话。',
        '结局依据身份事实、伙伴、撤销代价、保存与放弃的世界、坐标和最后自由行动生成，不能只在三个固定尾声中选择。',
        '正文首句先写行动的直接后果，最多再写两个短节拍；图片提示只描述当前事件，绝不附带入口或封面构图。',
        '新角色首次出现必须遵守“看见外形—知道名字来源—明确当前关系—再给互动选项”的顺序；选项不得引用尚未在正文中出场的名字。',
      ] : [
        'Generate new picture worlds, local problems, residents, items, and exits while preserving the place outside pictures, fixed cast, and confirmed state.',
        'Use everyday language for all player-visible text. Introduce at most one new idea per screen, show a concrete experience before naming it, and never explain events with latent space, sampling, weights, optimizers, rendering, prompts, model parameters, or similar technical terms.',
        'Every choice must follow from something currently visible and use one clear verb plus an object or purpose; keep English choices near 42 characters and never put lore exposition or abstract judgments inside a button.',
        'Every turn changes a location, danger, relationship, item, coordinate, identity fact, or immediate objective; empty confirmation and repeated investigation loops are forbidden.',
        'A picture-world visit lasts three to five decisions, with at most one side thread lasting one or two decisions before settlement or return.',
        'Humor comes from worlds seriously enforcing absurd visual or bureaucratic rules, not unrelated memes or a joke in every line.',
        'Generate endings from identity facts, companions, Undo costs, saved and abandoned worlds, coordinates, and the final free action rather than only three fixed epilogues.',
        'The first sentence states the direct action consequence, followed by at most two short beats; image prompts describe only the current event and never carry entry or cover composition.',
        'A new character debut follows this order: visible form, source of the name, present relationship, then interaction choices. Never put a name in a choice before visible prose has introduced it.',
      ],
      choiceIntents: zh
        ? ['利用眼前不对劲的东西', '和眼前的人交谈或保护他', '离开、躲避或使用手里的东西']
        : ['use something visibly wrong', 'talk to or protect someone present', 'leave, hide, or use something already held'],
    },
    dangerDirector,
    domainRules,
    endingDirector,
    initialFacts: {
      'undo-total-charges': 3,
      'undo-key-acquired': false,
      'undo-key-uses': 0,
      'undo-cost-rain-spent': false,
      'undo-cost-door-spent': false,
      'undo-cost-remnant-spent': false,
      'residual-introduction-memory': false,
      'rain-is-pixels': false,
      'rain-city-method': 'unset',
      'compute-stat-revealed': false,
      'trace-stat-revealed': false,
      'self-stat-revealed': false,
      'first-world-route': 'unset',
      'home-clue-count': 0,
      'first-coordinate-earned': false,
      'coordinates-four': false,
      'coordinate-target': 4,
      'fourth-wall-level': 0,
      'previous-run-suspected': true,
    },
    statDefinitions: [
      { id: 'self', label: s('我还是我', 'Still Me'), min: 0, max: 100, initial: 82, inverse: true, display: 'bar', warningAt: 35, dangerAt: 12, maxDelta: 20, revealedByFact: 'self-stat-revealed' },
      { id: 'compute', label: s('余力', 'Strength'), min: 0, max: 100, initial: 65, inverse: true, display: 'bar', warningAt: 25, dangerAt: 5, maxDelta: 24, revealedByFact: 'compute-stat-revealed' },
      { id: 'trace', label: s('被发现', 'Detected'), min: 0, max: 100, initial: 18, inverse: false, display: 'bar', warningAt: 65, dangerAt: 90, maxDelta: 20, revealedByFact: 'trace-stat-revealed' },
    ],
    drawerLabels: {
      party: s('同伴', 'Companions'), map: s('世界', 'Worlds'), inventory: s('行囊', 'Inventory'), log: s('已发生', 'What Happened'),
    },
    opening: {
      location: s('未完成的雨城 · 斑马线', 'Unfinished Rain City · Crossing'),
      time: s('第 0 帧 · 仍在生成', 'Frame 0 · Still Generating'),
      objective: s('先弄清这里发生了什么，再找一条不会消失的路', 'Find out what is happening and reach a path that will not vanish'),
      imagePrompt: 'SUBJECT A wakes standing in the middle of an unfinished rain-soaked contemporary city image still assembling around them, exact complete visible player identity is the only stable subject, one raindrop hangs impossibly before them, duplicated passersby repeat in the distance, clean unpainted white gaps interrupt buildings and street, a freestanding doorway opens into raw color far ahead, emotional first-person disorientation, 4:5 portrait, no writing, no letters, no text, no UI',
      entryImagePrompt: 'SUBJECT A reaches toward one impossible glass-like raindrop suspended in a half-generated rain-soaked city street, every other raindrop freezing at the same instant, duplicated passersby with changing unfinished faces, clean unpainted white street edge and one distant stable door, exact complete visible player identity, immediate physical discovery, 4:5 portrait, no writing, no text, no UI',
      entryAction: s('碰一下停在半空的雨', 'Touch the rain frozen in midair'),
      blocks: [
        { id: 'dmo-0', kind: 'narration', text: s('第一件不对劲的事，是雨没有落下来。', 'The first wrong thing is that the rain does not fall.') },
        { id: 'dmo-1', kind: 'narration', text: s('它停在你眼前。街道只画到一半，远处的人重复走着同一步；可你的身体有重量，呼吸也是真的。至少你希望是真的。', 'It hangs in front of you. The street is only half painted and distant people repeat one step; your body still has weight, and your breath feels real. At least you hope it is.') },
        { id: 'dmo-2', kind: 'event', text: s('你想不起自己怎么进来，只记得进来以前，屏幕外似乎有人按下了“生成”。', 'You cannot remember arriving. Just before this, someone outside the screen seemed to press “generate.”') },
      ],
      choices: [],
    },
    characters: [
      {
        id: 'residual', name: s('小残', 'Little Remnant'), role: s('画外向导', 'Guide outside the pictures'), vitality: 88, stress: 31,
        skills: [{ id: 'seams', label: s('找缝', 'Find Seams'), value: 6 }, { id: 'play-dead', label: s('装死', 'Play Dead'), value: 5 }, { id: 'half-truth', label: s('只说一半实话', 'Tell Half a Truth'), value: 4 }],
        detail: s('白色折纸鸟轮廓、黑色像素断面与红色游标尾丝组成的小生物。', 'A small creature made from a white origami-bird outline, broken black pixels, and a red cursor tail.'),
        lore: s('系统给这种没删干净的东西起了一个又长又难听的名字；它只记住最后一个字，自称小残。它知道几条逃生经验，却不懂这里的原理。', 'The system gave things it failed to delete a long ugly name. It kept only the friendliest part: Little Remnant. It knows escape tricks, not the theory behind this place.'),
        hiddenUntilIntroduced: true,
      },
      {
        id: 'default-seven', name: s('默认七号', 'Default Seven'), role: s('抹平者的样板人', 'Template person of the Smoother'), vitality: 100, stress: 12,
        skills: [{ id: 'blend', label: s('融入背景', 'Blend In'), value: 7 }, { id: 'replace', label: s('替代', 'Replace'), value: 6 }],
        detail: s('穿中性灰连体服、永远保持礼貌微笑的普通人；有自己的脸，不得继承玩家外形。', 'A generic person in a neutral gray jumpsuit with a permanent polite smile and a distinct non-player face.'),
        lore: s('每当系统无法决定该画谁，默认七号就会被放进去；它已经替代过太多人。', 'Whenever the system cannot decide whom to draw, Default Seven is inserted. It has replaced too many people.'),
        hiddenUntilIntroduced: true,
      },
    ],
    initialMap: [
      {
        id: 'unfinished-rain-city', label: s('未完成的雨城', 'Unfinished Rain City'), current: true,
        detail: s('仍在生成的雨夜街道，重复路人、悬空雨滴和未涂完白边同时存在。', 'A rain city still generating, with repeated passersby, suspended rain, and unpainted white gaps.'),
        lore: s('玩家醒来的第一张图，也是唯一一张似乎认识玩家，却无法正确回答任何问题的图。', 'The first image where the player wakes; it seems to recognize the player but cannot answer any question correctly.'),
        facts: [s('雨滴悬在半空', 'Rain hangs in midair'), s('远处有一扇通往纯色的门', 'A distant door opens into raw color')],
      },
      {
        id: 'latent-zero', label: s('画外之地 · 无边处', 'Outside the Pictures · The Boundless'), connectedTo: s('未完成的雨城', 'Unfinished Rain City'),
        detail: s('没有地面、远近和方向的深黑无边处，只漂着无法拼合的颜色、轮廓与一根红线。', 'A boundless matte-black non-space with no floor, depth, or direction, holding only color scraps, partial contours, and one red line.'),
        lore: s('它不是真的黑色；只是人的眼睛无法读懂这里。红线深处似乎还有某个会动的小东西。', 'It is not truly black; human eyes simply cannot decode it. Something small appears to be moving beyond the red filament.'),
        facts: [s('无边处会记住带回来的东西', 'The Boundless remembers what returns'), s('零碎画面会通往不同世界', 'Image scraps lead to different worlds')],
      },
      {
        id: 'six-frames', label: s('六幅正在漏出来的画', 'Six Pictures Leaking Through'), connectedTo: s('画外之地 · 无边处', 'Outside the Pictures · The Boundless'),
        detail: s('会飞走的城市、说话会成真的王国、散不了会的办公室、会贴标签的博物馆、儿童画海岸与被丢掉的画。', 'The Flying City, the Kingdom Where Words Come True, the Endless Meeting, the Labeling Museum, Child-Drawn Coast, and the Discarded Pictures.'),
        lore: s('每幅画都有一个一眼能看懂的麻烦，也藏着一条回家线索。', 'Each picture has one visible problem and hides one Home Clue.'),
        facts: [s('一次只解决一个眼前麻烦', 'Solve one immediate problem at a time'), s('也可以自己描述一扇新门', 'The player may describe a new door')],
      },
      {
        id: 'flying-city-rope-street', label: s('会飞走的城市 · 绳索街', 'The Flying City · Rope Street'), connectedTo: s('画外之地 · 无边处', 'Outside the Pictures · The Boundless'),
        detail: s('没钱的人用绳索把自己拴在街上；收费塔决定谁能踩到地面。', 'People without subscriptions tie themselves to the street while a billing tower decides who may touch ground.'),
        lore: s('这里把落地当成收费服务。', 'This city treats standing on the ground as a premium service.'),
        facts: [s('送货员正在升空', 'A courier is rising'), s('收费塔控制本区重力', 'The billing tower controls local gravity')],
      },
      {
        id: 'words-kingdom-palace', label: s('说话会成真的王国 · 王宫', 'The Kingdom Where Words Come True · Palace'), connectedTo: s('画外之地 · 无边处', 'Outside the Pictures · The Boundless'),
        detail: s('天空总抢着替人把一句话说完，错误名字会变成牢房。', 'The sky completes every sentence, and every wrong name becomes a prison.'),
        lore: s('这里的人不敢把话说完，因为天空不允许沉默。', 'People speak in fragments because the sky does not permit silence.'),
        facts: [s('国王不敢说出继承人', 'The king cannot name an heir'), s('每个错误名字都会生成牢房', 'Every wrong name creates a prison')],
      },
      {
        id: 'endless-meeting-room-three', label: s('永远散不了会的办公室 · 第三会议室', 'The Endless Meeting · Room Three'), connectedTo: s('画外之地 · 无边处', 'Outside the Pictures · The Boundless'),
        detail: s('一句“再补充一点”让周会开了七年，每翻一页就换一种故事。', 'One “more thing” kept a meeting alive for seven years; every slide changes its genre.'),
        lore: s('会议从未作出决定，所以世界也不知道怎样结束。', 'The meeting never decided anything, so the world never learned how to end.'),
        facts: [s('主管不肯结束最后一页', 'The manager will not end the last slide'), s('黎姨记得前六年', 'Auntie Li remembers the previous six years')],
      },
      {
        id: 'label-museum-side-door', label: s('会给人贴标签的博物馆 · 侧门', 'The Labeling Museum · Side Door'), connectedTo: s('画外之地 · 无边处', 'Outside the Pictures · The Boundless'),
        detail: s('说明牌会飞向游客，并把人改成牌面声称的样子；侧门守门人仍记得每个获救者。', 'Labels fly toward visitors and reshape them into what the placards claim; the side-door gatekeeper still remembers everyone he saved.'),
        lore: s('这里把分类当成事实，直到有人证明一段被准确记住的经历比标签更可靠。', 'This museum treats categories as facts until lived memory proves more reliable than a label.'),
        facts: [s('梁叔的制服留下许多姓名牌针孔', 'Uncle Liang’s uniform bears many nameplate pinholes'), s('侧门钥匙只认同一只手', 'The side-door keys recognize the same hand')],
      },
    ],
    initialInventory: [],
    demoTurns: buildDrawMeOutCampaign(locale),
  }
}

export const drawMeOut = build('zh')
export const drawMeOutEn = build('en')
