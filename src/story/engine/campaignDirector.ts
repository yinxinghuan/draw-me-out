import type {
  CampaignEpisodeId, DomainActionResolution, DomainEffect, InventoryItem, Locale, StoryCampaignState,
  StoryCartridge, StorySave, StoryVisualBeat,
} from '../types'

interface EpisodeStep {
  choices: [string, string, string]
  results: [string, string, string]
  facts: [string, string, string]
  effects: [DomainEffect[], DomainEffect[], DomainEffect[]]
  visualActions: [string, string, string]
}

interface CampaignEpisode {
  id: CampaignEpisodeId
  mapId: string
  clueId: 'coordinate-weight' | 'coordinate-choice' | 'coordinate-leaving' | 'coordinate-remembered'
  clueFact: string
  hubChoice: string
  title: string
  objective: string
  arrival: string
  environment: string
  lighting: string
  subjects: string[]
  props: string[]
  entry: EpisodeStep
  problem: EpisodeStep
  resolutionChoices: [string, string, string]
  resolutionResults: [string, string, string]
  resolutionFacts: [string, string, string]
  returnTrace: string
  visualReturnTrace: string
}

const clueIds: Record<CampaignEpisodeId, CampaignEpisode['clueId']> = {
  'flying-city': 'coordinate-weight',
  'words-kingdom': 'coordinate-choice',
  'endless-meeting': 'coordinate-leaving',
  'label-museum': 'coordinate-remembered',
}

const clueEpisodeIds = Object.fromEntries(
  (Object.entries(clueIds) as Array<[CampaignEpisodeId, CampaignEpisode['clueId']]>).map(([episodeId, clueId]) => [clueId, episodeId]),
) as Record<CampaignEpisode['clueId'], CampaignEpisodeId>

const mapEpisodeIds: Record<string, CampaignEpisodeId> = {
  'flying-city-rope-street': 'flying-city',
  'words-kingdom-palace': 'words-kingdom',
  'endless-meeting-room-three': 'endless-meeting',
  'label-museum-side-door': 'label-museum',
}

function clean(value: string): string {
  return value.toLocaleLowerCase().replace(/[\s，。！？、,.!?;；：:"“”'‘’()（）·]/g, '')
}

function choiceIndex(action: string, choices: [string, string, string]): number {
  const source = clean(action)
  const exact = choices.findIndex((choice) => source.includes(clean(choice)) || clean(choice).includes(source))
  if (exact >= 0) return exact
  let hash = 2166136261
  for (const character of source) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % 3
}

function clueItem(locale: Locale, id: CampaignEpisode['clueId']): InventoryItem {
  const zh = locale === 'zh'
  if (id === 'coordinate-weight') return {
    id, count: 1, rarity: 'rare', label: zh ? '回家线索 · 重量' : 'Home Clue · Weight',
    detail: zh ? '一枚沉重的蓝色碎片，放手后永远向真正的下方落去。' : 'A heavy blue fragment that always falls toward a real down.',
    effect: zh ? '证明身体会对世界留下重量。' : 'Proves that a body leaves weight in the world.',
    lore: zh ? '会飞走的城市第一次把落地当作公共权利后，由送货员交给你。' : 'Given by the courier after the Flying City treated ground as a public right.',
    metrics: [{ id: 'proof', label: zh ? '证明' : 'Proof', value: zh ? '身体有重量' : 'Bodies have weight' }],
    imagePrompt: 'one heavy cobalt-blue home clue fragment visibly pulling a loose breakfast ribbon downward, object-only artifact study, no writing, square',
  }
  if (id === 'coordinate-choice') return {
    id, count: 1, rarity: 'rare', label: zh ? '回家线索 · 空位' : 'Home Clue · Blank',
    detail: zh ? '一枚透明碎片，中间留着谁也不能替你填满的空位。' : 'A transparent fragment with a center nobody else can fill.',
    effect: zh ? '证明选择需要不被替作的余地。' : 'Proves that choice needs room nobody else occupies.',
    lore: zh ? '王国第一次允许一句话停在沉默里后，由国王交给你。' : 'Given by the king after the realm first allowed a sentence to end in silence.',
    metrics: [{ id: 'proof', label: zh ? '证明' : 'Proof', value: zh ? '选择需要空位' : 'Choice needs room' }],
    imagePrompt: 'one transparent home clue fragment with a deliberate empty center and a small crown-metal edge, object-only artifact study, no writing, square',
  }
  if (id === 'coordinate-leaving') return {
    id, count: 1, rarity: 'rare', label: zh ? '回家线索 · 离开' : 'Home Clue · Leaving',
    detail: zh ? '一枚温热的灰白碎片，靠近没有出口的地方时会发热。' : 'A warm gray fragment that heats near places with no exit.',
    effect: zh ? '证明一段经历可以被真正结束。' : 'Proves that an experience can truly end.',
    lore: zh ? '七年会议第一次散会后，由黎姨从废纸篓里捡出。' : 'Recovered by Auntie Li when the seven-year meeting finally ended.',
    metrics: [{ id: 'proof', label: zh ? '证明' : 'Proof', value: zh ? '人可以结束一段经历' : 'A person can end an experience' }],
    imagePrompt: 'one warm gray home clue fragment beside a switched-off projector pull cord, object-only artifact study, no writing, square',
  }
  return {
    id, count: 1, rarity: 'rare', label: zh ? '回家线索 · 被记住' : 'Home Clue · Remembered',
    detail: zh ? '一枚带指纹温度的银色碎片，只有别人准确记起你时才会发亮。' : 'A silver fragment that glows only when another person remembers you accurately.',
    effect: zh ? '证明身份也活在别人的记忆里。' : 'Proves that identity also lives in another memory.',
    lore: zh ? '标签博物馆撤下最后一块错误说明牌后，由守门人梁叔交给你。' : 'Given by Gatekeeper Liang after the museum removed its final false label.',
    metrics: [{ id: 'proof', label: zh ? '证明' : 'Proof', value: zh ? '身份也存在于别人的记忆' : 'Identity lives in another memory' }],
    imagePrompt: 'one fingerprint-warm silver home clue fragment beside a blank museum label frame, object-only artifact study, no writing, square',
  }
}

function episodes(locale: Locale): Record<CampaignEpisodeId, CampaignEpisode> {
  const zh = locale === 'zh'
  const s = (cn: string, en: string) => zh ? cn : en
  const none: [DomainEffect[], DomainEffect[], DomainEffect[]] = [[], [], []]
  return {
    'flying-city': {
      id: 'flying-city', mapId: 'flying-city-rope-street', clueId: 'coordinate-weight', clueFact: 'coordinate-body',
      hubChoice: s('走进会飞走的城市入口', 'Enter the Flying City crack'), title: s('会飞走的城市', 'The Flying City'),
      objective: s('让送货员和这条街重新落地', 'Return the courier and the street to the ground'),
      arrival: s('你穿过蓝色碎片，立刻开始向天空坠落。没钱的人把腰带拴在路灯上；一名送货员抱着早餐箱缓慢升高，鞋底离街面只剩最后一指。', 'You cross a blue fragment and immediately fall upward. People without subscriptions belt themselves to lampposts; a courier rises with a breakfast box, shoes one finger from the street.'),
      environment: 'a vertical city street where gravity is sold by a brass billing tower, residents tied to lamppost ropes, open sky above the street',
      lighting: 'crisp morning light from upper left, cobalt clue color against worn brass and concrete',
      subjects: ['SUBJECT A', 'one airborne courier with an orange breakfast box'], props: ['lamppost safety ropes', 'brass gravity billing tower', 'orange breakfast box'],
      entry: {
        choices: [s('抓住最近的安全绳', 'Grab the nearest safety rope'), s('观察收费塔怎样扣费', 'Watch how the billing tower charges'), s('先接住掉下来的早餐', 'Catch the falling breakfast first')],
        results: [
          s('你抓住安全绳，绳结却只认付费腕带。送货员把自己的绳头抛给你：塔每十五秒收走一次脚下的重量。', 'You grab a safety rope, but its knot recognizes only paid wristbands. The courier throws you their rope end: the tower collects everyone’s weight every fifteen seconds.'),
          s('你盯住收费塔。它不是让人飞，而是不断收走“向下”这件事；早餐箱因为登记成公共物资，反而还剩一点重量。', 'You study the tower. It does not make people fly; it repeatedly removes “down.” The breakfast box still has some weight because it is registered as public cargo.'),
          s('你接住早餐箱，手臂猛地向街面一沉。送货员本人继续上升：箱子有公共配送许可，人却没有。', 'You catch the breakfast box and your arm drops hard toward the street. The courier keeps rising: the delivery has public clearance, the person does not.'),
        ],
        facts: ['flying-entry-rope', 'flying-entry-tower', 'flying-entry-breakfast'], effects: none,
        visualActions: ['SUBJECT A braces on a safety rope while the courier rises', 'SUBJECT A watches the billing tower remove gravity in visible pulses', 'SUBJECT A catches the weighted breakfast box as its courier rises away'],
      },
      problem: {
        choices: [s('亲手把送货员拽下来', 'Pull the courier down by hand'), s('让小残卡住收费轮', 'Let Little Remnant jam the billing wheel'), s('宣布早餐配送属于公共服务', 'Declare breakfast delivery a public service')],
        results: [
          s('你把自己和路灯结在一起，一寸寸把送货员拽回。塔发出欠费警报，但街面第一次承住了两个人。', 'You knot yourself to a lamppost and haul the courier down inch by inch. The tower sounds a debt alarm, but the street supports two people for the first time.'),
          s('小残钻进检修口，用纸翼卡住收费轮。它的尾线被烫黑一截，整条街的重量同时回来了十秒。', 'Little Remnant enters the hatch and jams the billing wheel with a paper wing. Its tail chars as the whole street regains weight for ten seconds.'),
          s('你当众指出早餐配送属于公共服务。塔无法把送货员和早餐分开计费，只能给整条街十分钟公共重力。', 'You publicly classify breakfast delivery as a public service. Unable to bill courier and cargo separately, the tower grants the street ten minutes of public gravity.'),
        ],
        facts: ['weight-method-direct', 'weight-method-remnant', 'weight-method-public'],
        effects: [
          [{ type: 'stat', id: 'compute', delta: -8 }, { type: 'stat', id: 'self', delta: 5 }],
          [{ type: 'stat', id: 'trace', delta: 7 }, { type: 'fact', id: 'residual-took-gravity-risk', value: true }],
          [{ type: 'stat', id: 'trace', delta: 12 }, { type: 'fact', id: 'public-gravity-precedent', value: true }],
        ],
        visualActions: ['SUBJECT A hauls the courier down against upward pull', 'Little Remnant jams the brass wheel while SUBJECT A catches the courier', 'SUBJECT A addresses the billing tower as the entire street lands together'],
      },
      resolutionChoices: [s('让送货员自己站稳', 'Let the courier stand unaided'), s('请整条街一起接住他', 'Have the whole street catch the courier'), s('把公共落地规则留给这里', 'Leave the public-ground rule behind')],
      resolutionResults: [
        s('送货员先松开你的手，再用自己的双脚站稳。他把早餐箱底唯一沉重的蓝色碎片交给你：“不是你替我落地，是你让我能自己站。”', 'The courier releases your hand and stands on their own feet. They give you the one heavy blue fragment beneath the breakfast box: “You did not land for me. You made it possible for me to stand.”'),
        s('街上的人依次抓住绳索和彼此，把送货员稳稳接回地面。早餐箱底的蓝色碎片落进你掌心，重得像一条被所有人记住的新规则。', 'The street catches rope and one another, returning the courier to ground. The blue fragment beneath the breakfast box lands in your palm, heavy as a rule everyone now remembers.'),
        s('你把漏洞留在收费塔上：早餐经过的街区必须提供公共落地。送货员把唯一的蓝色碎片交给你，随后第一次站着完成配送。', 'You leave the loophole in the tower: streets crossed by breakfast must provide public ground. The courier gives you the one blue fragment, then completes the delivery standing.'),
      ],
      resolutionFacts: ['weight-closure-stand', 'weight-closure-catch', 'weight-closure-rule'],
      returnTrace: s('一枚始终向下坠的蓝色碎片，以及双脚重新碰到街面的触感', 'one downward-pulling cobalt fragment and the tactile memory of feet meeting pavement'),
      visualReturnTrace: 'one downward-pulling cobalt fragment and the tactile memory of feet meeting pavement',
    },
    'words-kingdom': {
      id: 'words-kingdom', mapId: 'words-kingdom-palace', clueId: 'coordinate-choice', clueFact: 'coordinate-choice',
      hubChoice: s('走进说话成真的王国入口', 'Enter the True Words Kingdom crack'), title: s('说话会成真的王国', 'The Kingdom Where Words Come True'),
      objective: s('让加冕词留下一个不被替作的空位', 'Leave one place in the coronation sentence nobody else can fill'),
      arrival: s('你落进停在半句的加冕礼。天空正替国王补完继承人的名字；每猜错一个人，宫墙就长出一间新牢房。', 'You land in a coronation frozen mid-sentence. The sky is completing the heir’s name; every wrong guess grows another prison from the palace wall.'),
      environment: 'an open palace court where spoken phrases become physical ribbons and wrong names grow small prison rooms from the walls', lighting: 'flat ceremonial noon light with transparent cyan silence and tarnished gold',
      subjects: ['SUBJECT A', 'an exhausted king in a plain gold crown'], props: ['unfinished ceremonial sentence ribbon', 'plain gold crown', 'newly grown prison doors'],
      entry: {
        choices: [s('听清天空补的是哪一字', 'Listen for the sky’s final word'), s('查看最新长出的牢房', 'Inspect the newest prison'), s('让国王先停在沉默里', 'Ask the king to remain silent')],
        results: [
          s('你听见天空每次都补同一个位置，却换不同名字。问题不在名字，而在它不允许一句话停下来。', 'The sky always fills the same position with a different name. The problem is not the name; it refuses to let a sentence stop.'),
          s('最新牢房里没有囚犯，只有一块写错后被迫长成人形的影子。错误称呼会先制造一个人，再惩罚那个人。', 'The newest prison holds no prisoner, only a shadow forced into a person by a wrong name. The realm creates someone before punishing them.'),
          s('国王闭口，天空却用雷声继续替他说。王冠中央有一块透明缺口，只有真正的沉默靠近时才会发亮。', 'The king closes his mouth, but thunder continues for him. A transparent gap in the crown glows only when real silence approaches.'),
        ], facts: ['words-entry-listen', 'words-entry-prison', 'words-entry-silence'], effects: none,
        visualActions: ['SUBJECT A listens as a word ribbon stops above the king', 'SUBJECT A opens an empty prison grown from a wrong name', 'SUBJECT A shelters the silent king while thunder tries to finish the sentence'],
      },
      problem: {
        choices: [s('把加冕词改成一个问题', 'Turn the coronation into a question'), s('让小残咬掉最后一个词', 'Let Little Remnant bite off the last word'), s('说出一个不存在的名字', 'Speak a name that does not exist')],
        results: [
          s('问题允许别人不回答。天空第一次找不到必须填进去的内容，所有新牢房同时停止生长。', 'A question permits no answer. For the first time the sky finds nothing it must insert, and every new prison stops growing.'),
          s('小残咬掉最后一个词。天空追着它撕掉半片纸翼，却没能补上那块真正的空位。', 'Little Remnant bites off the final word. The sky tears half a paper wing in pursuit but cannot replace the true blank.'),
          s('你说出一个不存在的名字。天空无法替不存在的人安排命运，句子中央只剩一块清醒的空白。', 'You speak a name that does not exist. The sky cannot assign a fate to nobody, leaving a lucid blank inside the sentence.'),
        ], facts: ['choice-method-question', 'choice-method-remnant', 'choice-method-impossible'],
        effects: [
          [{ type: 'stat', id: 'compute', delta: -5 }, { type: 'stat', id: 'self', delta: 5 }],
          [{ type: 'stat', id: 'trace', delta: 7 }, { type: 'fact', id: 'residual-defied-prophecy', value: true }],
          [{ type: 'stat', id: 'self', delta: -4 }, { type: 'stat', id: 'trace', delta: 10 }],
        ],
        visualActions: ['SUBJECT A turns the physical sentence ribbon into an open question', 'Little Remnant bites the final word from the ribbon beside SUBJECT A', 'SUBJECT A speaks toward a blank human-shaped absence while the sentence stops'],
      },
      resolutionChoices: [s('请国王亲手留下空位', 'Ask the king to preserve the blank'), s('先放出那些错误名字', 'Release the people made by wrong names'), s('让全城练习一句沉默', 'Let the city practice one silence')],
      resolutionResults: [
        s('国王从王冠中央取下唯一的透明碎片，没有替它命名，只把选择交还给你。', 'The king removes the one transparent fragment from the crown, does not name it, and returns the choice to you.'),
        s('牢门打开，那些被错误名字造出来的人各自选择去处。最后一扇门消失时，透明碎片落进你手里。', 'The prison doors open and people made by wrong names choose where to go. When the last door vanishes, the transparent fragment falls into your hand.'),
        s('整座城共同沉默一息。天空没有崩塌，反而第一次听见别人；国王把王冠里的透明碎片交给你。', 'The whole city shares one breath of silence. The sky does not collapse; it hears others for the first time, and the king gives you the transparent fragment.'),
      ], resolutionFacts: ['choice-closure-king', 'choice-closure-prisoners', 'choice-closure-silence'],
      returnTrace: s('一枚中央留空的透明碎片，以及一句话终于可以停下来的记忆', 'one transparent unfilled center surrounded by the memory of a sentence allowed to stop'),
      visualReturnTrace: 'one transparent unfilled center surrounded by the memory of a sentence allowed to stop',
    },
    'endless-meeting': {
      id: 'endless-meeting', mapId: 'endless-meeting-room-three', clueId: 'coordinate-leaving', clueFact: 'coordinate-boundary',
      hubChoice: s('走进七年会议的入口', 'Enter the Seven-Year Meeting crack'), title: s('永远散不了会的办公室', 'The Endless Meeting'),
      objective: s('结束这场会议，同时保住真正记得时间的人', 'End the meeting while preserving the person who remembers time'),
      arrival: s('你坐进一场已经开了七年的周会。主管每翻一页空白幻灯片，办公室就换一种故事。一位戴着记满日期手套的保洁员停下拖把；大家叫她黎姨，只有她记得前六年。', 'You sit down in a weekly meeting now seven years old. Each blank slide changes the office story. A cleaner wearing gloves covered in dates stops her mop; everyone calls her Auntie Li, and only she remembers the previous six years.'),
      environment: 'a fluorescent conference room trapped on a blank final slide, seven years of coffee rings and cleaning marks accumulating', lighting: 'fixed green-white fluorescent ceiling light with one warm corridor beyond the door',
      subjects: ['SUBJECT A', 'Auntie Li, an older cleaner wearing date-marked work gloves'], props: ['blank projector screen', 'unplugged projector', 'mop across the doorway'],
      entry: {
        choices: [s('查看投影仪为何还亮着', 'Inspect why the projector is still lit'), s('请黎姨指出第一天', 'Ask Auntie Li to mark the first day'), s('数一遍桌上的咖啡圈', 'Count the coffee rings on the table')],
        results: [
          s('投影仪根本没有接电。它靠“再补充一点”这句话亮着；每有人重复一次，最后一页就重新开始。', 'The projector has no power cable. It runs on the phrase “one more thing,” restarting the final slide whenever anyone repeats it.'),
          s('黎姨把七副磨破的手套排开，每副都写着同一个星期一。会议不是没有时间，而是不肯承认时间已经过去。', 'Auntie Li lays out seven worn pairs of gloves, each marked with the same Monday. Time passed; the meeting refuses to admit it.'),
          s('桌上有二千多个咖啡圈，最外圈已经长出纸一样的年轮。所有人只记得当前幻灯片，没人记得自己曾经想走。', 'More than two thousand coffee rings cover the table, the oldest growing paper-like rings. Everyone remembers the slide, not that they once wanted to leave.'),
        ], facts: ['meeting-entry-projector', 'meeting-entry-gloves', 'meeting-entry-coffee'], effects: none,
        visualActions: ['SUBJECT A holds the unplugged projector cable while the blank screen stays lit', 'Auntie Li lays seven dated work gloves before SUBJECT A', 'SUBJECT A traces thousands of coffee rings while workers repeat one pose'],
      },
      problem: {
        choices: [s('拔掉那台没接电的投影仪', 'Unplug the projector with no cable'), s('让黎姨问谁真的有话要说', 'Ask Auntie Li who truly needs to speak'), s('举手提议现在就散会', 'Raise a hand and end the meeting now')],
        results: [
          s('你拔掉不存在的电源。为了让动作成立，画面从你的余力里借走一截；空白幻灯片终于熄灭。', 'You unplug the nonexistent power. To make the action real, the picture borrows your Strength; the blank slide finally goes dark.'),
          s('黎姨把拖把横在桌前：“谁真的还有话要说？”七年里第一次，没有人举手。', 'Auntie Li lays her mop across the table. “Who truly still needs to speak?” For the first time in seven years, nobody raises a hand.'),
          s('你只说“现在散会”。主管刚开口，所有人已经站起；结束语比他的下一句话先抵达门口。', 'You say only, “We are done now.” The workers stand before the manager can answer; the ending reaches the door first.'),
        ], facts: ['leaving-method-projector', 'leaving-method-auntie', 'leaving-method-declare'],
        effects: [
          [{ type: 'stat', id: 'compute', delta: -7 }, { type: 'stat', id: 'trace', delta: 4 }],
          [{ type: 'stat', id: 'self', delta: 7 }, { type: 'stat', id: 'trace', delta: 6 }],
          [{ type: 'stat', id: 'self', delta: 5 }, { type: 'stat', id: 'trace', delta: 10 }],
        ],
        visualActions: ['SUBJECT A pulls an impossible cable and the projector goes dark', 'Auntie Li blocks the table with her mop as every hand stays down', 'SUBJECT A raises one hand while the entire meeting stands to leave'],
      },
      resolutionChoices: [s('让最后一个人先走出门', 'Let the last worker leave first'), s('请黎姨亲手关掉会议室', 'Ask Auntie Li to close the room'), s('把“散会”留在最后一页', 'Leave “adjourned” in the final slide')],
      resolutionResults: [
        s('你等到最后一个人跨过门槛，会议室才缩回普通房间。黎姨从废纸篓里捡出唯一的温热碎片交给你。', 'You wait for the last worker to cross the threshold before the room becomes ordinary. Auntie Li retrieves the one warm fragment from the bin.'),
        s('黎姨亲手关灯、关门，把第七副手套留在里面。她将废纸篓里唯一的温热碎片交给你：“结束也得有人作证。”', 'Auntie Li switches off the light and closes the door, leaving the seventh gloves inside. She gives you the one warm fragment: “An ending needs a witness too.”'),
        s('最后一页不再刷新，屏幕只剩一片安静的灰。那片灰收成唯一的温热碎片，落进你手里。', 'The final slide stops refreshing and becomes quiet gray. The gray gathers into the one warm fragment and drops into your hand.'),
      ], resolutionFacts: ['leaving-closure-last-worker', 'leaving-closure-auntie', 'leaving-closure-slide'],
      returnTrace: s('一枚温热的灰色碎片，以及门终于在身后关上的感觉', 'one warm gray fragment and the sensation of a door finally closing behind someone'),
      visualReturnTrace: 'one warm gray fragment and the sensation of a door finally closing behind someone',
    },
    'label-museum': {
      id: 'label-museum', mapId: 'label-museum-side-door', clueId: 'coordinate-remembered', clueFact: 'coordinate-remembered',
      hubChoice: s('走进会贴标签的博物馆入口', 'Enter the Labeling Museum crack'), title: s('会给人贴标签的博物馆', 'The Labeling Museum'),
      objective: s('阻止错误标签把守门人改成展品', 'Stop a false label from turning the gatekeeper into an exhibit'),
      arrival: s('你从侧门进入博物馆。说明牌正从墙上飞下来贴向游客；被贴中的人会慢慢长成牌上写的样子。一位穿旧靛蓝制服、胸前只有针孔的守门人挡住它们。他守侧门七年，大家叫他梁叔。', 'You enter through the museum side door. Labels fly from walls toward visitors, who slowly become whatever the labels claim. A gatekeeper in a worn indigo uniform, pinholes on his empty chest, blocks them. He has guarded this door for seven years; everyone calls him Uncle Liang.'),
      environment: 'a museum side gallery where blank-framed labels fly like stiff paper and exhibits begin defining visitors', lighting: 'cool skylight with narrow warm side-door light, silver clue highlights and indigo uniform',
      subjects: ['SUBJECT A', 'Uncle Liang, an older gatekeeper in a worn indigo museum uniform'], props: ['blank label frames', 'pinholes on the gatekeeper uniform', 'side-door key ring'],
      entry: {
        choices: [s('挡住飞向梁叔的标签', 'Block the label flying at Uncle Liang'), s('查看他胸前留下的针孔', 'Inspect the pinholes on his uniform'), s('问他最近被叫成什么', 'Ask what the museum last called him')],
        results: [
          s('你挡住标签，它立刻改贴向你。牌面没有字，却让镜子里的你变成“闯入者”；梁叔准确叫出你的衣着和动作，镜像才停下。', 'You block the label and it turns toward you. Though blank, it makes your reflection an intruder; Uncle Liang accurately names your clothing and action, stopping the change.'),
          s('针孔组成十几个不同姓名牌的轮廓。博物馆每天替梁叔换一种身份，只有侧门钥匙上的磨痕始终属于同一只手。', 'The pinholes outline many different nameplates. The museum assigns Liang a new identity daily; only wear on the side-door keys belongs to the same hand.'),
          s('“展品、保安、背景、无人认领。”梁叔逐个说出旧称呼，却能准确复述每个获救游客的样子。博物馆记得标签，他记得人。', '“Exhibit, guard, background, unclaimed.” Liang lists old labels, then accurately recalls every visitor he saved. The museum remembers labels; he remembers people.'),
        ], facts: ['museum-entry-block', 'museum-entry-pinholes', 'museum-entry-names'], effects: none,
        visualActions: ['SUBJECT A shields Uncle Liang from one flying blank label frame', 'SUBJECT A examines layers of nameplate pinholes on the indigo uniform', 'Uncle Liang recalls visitors while blank label frames circle SUBJECT A'],
      },
      problem: {
        choices: [s('让梁叔描述真正的你', 'Ask Uncle Liang to describe the real you'), s('把所有说明牌转向空墙', 'Turn every label toward a blank wall'), s('用侧门钥匙交换姓名牌', 'Trade the side-door keys for the nameplates')],
        results: [
          s('梁叔没有说身份，只说出你刚才保护谁、手里握着什么，以及小残缺掉哪片纸翼。错误标签找不到能替换这些经历的位置。', 'Liang does not name an identity. He recounts whom you protected, what you hold, and which paper edge Little Remnant lacks. The false label cannot replace lived details.'),
          s('你把说明牌全部转向空墙。它们开始互相定义，最终只剩一地空框；游客们的轮廓慢慢恢复。', 'You turn every label toward a blank wall. They begin defining one another until only empty frames remain, and the visitors regain their outlines.'),
          s('梁叔把侧门钥匙压上柜台。博物馆愿意要一个“守门人”，却无法解释为何这串磨损只认他；姓名牌因此全部失效。', 'Liang lays the side-door keys on the counter. The museum wants a “gatekeeper” but cannot explain why the worn keys know only him; every nameplate fails.'),
        ], facts: ['remembered-method-witness', 'remembered-method-wall', 'remembered-method-keys'],
        effects: [
          [{ type: 'stat', id: 'self', delta: 8 }, { type: 'stat', id: 'trace', delta: 5 }],
          [{ type: 'stat', id: 'compute', delta: -6 }, { type: 'stat', id: 'trace', delta: 8 }],
          [{ type: 'stat', id: 'self', delta: 4 }, { type: 'fact', id: 'liang-keys-remember', value: true }],
        ],
        visualActions: ['Uncle Liang points out exact lived details while SUBJECT A remains unchanged', 'SUBJECT A turns flying blank label frames toward one empty wall', 'Uncle Liang places worn keys beside failed nameplates as SUBJECT A watches'],
      },
      resolutionChoices: [s('请梁叔保留一块空说明牌', 'Ask Liang to keep one label blank'), s('让获救游客互相叫出名字', 'Have the rescued visitors name one another'), s('把你的行动留在访客簿里', 'Leave your action in the visitor record')],
      resolutionResults: [
        s('梁叔把最后一块说明牌留空，只在背面按下自己的指纹。空框里凝出唯一的银色碎片：不是标签记住了你，是一个人记住了你。', 'Liang leaves the final label blank and presses a fingerprint on its back. The frame yields one silver fragment: a person remembered you, not a label.'),
        s('游客们不说职业和标签，只逐个叫出彼此真正使用的名字。那些声音汇成唯一的银色碎片，梁叔把它交给你。', 'The visitors avoid roles and labels, calling one another by the names they actually use. Their voices gather into one silver fragment, which Liang gives you.'),
        s('你不写“我是谁”，只留下自己做过的事。梁叔准确复述那件事，访客簿里升起唯一的银色碎片。', 'You record not who you are, only what you did. Liang recounts it accurately, and the visitor record releases one silver fragment.'),
      ], resolutionFacts: ['remembered-closure-blank', 'remembered-closure-visitors', 'remembered-closure-record'],
      returnTrace: s('一枚带着指纹温度的银色碎片，以及梁叔对你刚才行动的准确记忆', 'one fingerprint-warm silver fragment and one accurate memory of the player’s latest action'),
      visualReturnTrace: 'one fingerprint-warm silver fragment and one accurate memory of the player’s latest action',
    },
  }
}

export function createInitialCampaignState(): StoryCampaignState {
  return { act: 'prologue', phase: 'locked', completedEpisodes: [], hubReturnCount: 0, episodeTurn: 0, checkpoint: 'rain-city' }
}

export function normalizeCampaignState(save: Pick<StorySave, 'inventory' | 'facts' | 'map'>, candidate?: Partial<StoryCampaignState>): StoryCampaignState {
  const inventoryEpisodes = save.inventory
    .filter((item) => item.count > 0 && item.id in clueEpisodeIds)
    .map((item) => clueEpisodeIds[item.id as CampaignEpisode['clueId']])
  const completedSet = new Set(inventoryEpisodes)
  const candidateOrder = (candidate?.completedEpisodes ?? []).filter((id) => completedSet.has(id))
  const completedEpisodes = [...new Set([...candidateOrder, ...inventoryEpisodes])]
  const currentNode = save.map.find((node) => node.current)?.id ?? ''
  const inferredEpisode = mapEpisodeIds[currentNode]
  const metGuide = save.facts['residual-met'] === true
  const activeEpisode = candidate?.currentEpisode && !completedEpisodes.includes(candidate.currentEpisode)
    ? candidate.currentEpisode
    : inferredEpisode && !completedEpisodes.includes(inferredEpisode) ? inferredEpisode : undefined
  const inventoryLastCompleted = [...save.inventory].reverse().find((item) => item.count > 0 && item.id in clueEpisodeIds)
  const lastCompletedEpisode = candidate?.lastCompletedEpisode && completedEpisodes.includes(candidate.lastCompletedEpisode)
    ? candidate.lastCompletedEpisode
    : inventoryLastCompleted ? clueEpisodeIds[inventoryLastCompleted.id as CampaignEpisode['clueId']] : completedEpisodes.at(-1)
  const finaleProgressed = save.facts['optimizer-core-open'] === true || save.facts['exit-cost-known'] === true
  const explicitReturnCount = Number(candidate?.hubReturnCount)
  const hubReturnCount = Number.isFinite(explicitReturnCount)
    ? Math.max(0, Math.min(completedEpisodes.length, explicitReturnCount))
    : !activeEpisode && !finaleProgressed && completedEpisodes.length > 0 && (candidate?.phase === 'hub' || candidate?.phase === 'return')
      ? completedEpisodes.length - 1
      : completedEpisodes.length
  const needsHubReturn = Boolean(lastCompletedEpisode) && !activeEpisode && !finaleProgressed && hubReturnCount < completedEpisodes.length
  const phase = activeEpisode
    ? candidate?.phase === 'entry' || candidate?.phase === 'problem' || candidate?.phase === 'resolution' ? candidate.phase : 'problem'
    : candidate?.phase === 'finale' || finaleProgressed ? 'finale'
      : needsHubReturn ? 'return'
        : metGuide ? 'hub' : 'locked'
  const currentEpisode = phase === 'return' ? lastCompletedEpisode : activeEpisode
  return {
    act: candidate?.act ?? (metGuide ? 'worlds' : 'prologue'),
    phase,
    currentEpisode,
    completedEpisodes,
    lastCompletedEpisode,
    hubReturnCount,
    episodeTurn: Math.max(0, Number(candidate?.episodeTurn ?? (activeEpisode ? 2 : 0))),
    checkpoint: String(needsHubReturn ? `${lastCompletedEpisode}:return` : candidate?.checkpoint ?? (currentEpisode ? `${currentEpisode}:${phase}` : metGuide ? 'boundless-hub' : 'rain-city')),
  }
}

export function syncCampaignState(save: StorySave): StorySave {
  save.campaign = normalizeCampaignState(save, save.campaign)
  return save
}

function hubChoices(locale: Locale, completed: CampaignEpisodeId[]): [string, string, string] {
  const catalog = episodes(locale)
  const remaining = (Object.keys(catalog) as CampaignEpisodeId[]).filter((id) => !completed.includes(id)).map((id) => catalog[id].hubChoice)
  const fallback = locale === 'zh'
    ? ['检查已经带回的线索', '问小残下一扇门', '观察无边处的新变化']
    : ['Inspect the Home Clues', 'Ask Little Remnant about the next door', 'Observe changes in the Boundless']
  return [...remaining, ...fallback].slice(0, 3) as [string, string, string]
}

export function campaignReturnChoices(locale: Locale): [string, string, string] {
  return locale === 'zh'
    ? ['跟着小残穿回画外之地', '握住线索，让它带路回去', '回头看这个世界留下什么痕迹']
    : ['Follow Little Remnant back Outside the Pictures', 'Let the Home Clue guide the way back', 'Look back at the trace this world leaves']
}

export function campaignReturnContext(locale: Locale): string {
  return locale === 'zh'
    ? '线索已经到手。下一扇门尚未出现；先和小残回画外之地，让线索落进固定锚位。'
    : 'The Home Clue is yours, but no next door has appeared. Return Outside the Pictures with Little Remnant and settle the clue into its fixed transit anchor.'
}

function hubAnchorProps(completed: CampaignEpisodeId[], latest: CampaignEpisodeId): string[] {
  const status = (episodeId: CampaignEpisodeId, filled: string, empty: string) => completed.includes(episodeId)
    ? `${filled}${episodeId === latest ? ', newly returned and brightest' : ', already secured at low steady brightness'}`
    : `${empty}, dim empty outline only`
  return [
    'one thin central red-filament transit ring',
    status('flying-city', 'upper-left cobalt weight anchor', 'upper-left weight anchor'),
    status('words-kingdom', 'upper-right transparent blank-center anchor', 'upper-right blank-center anchor'),
    status('endless-meeting', 'lower-right warm-gray leaving anchor', 'lower-right leaving anchor'),
    status('label-museum', 'lower-left fingerprint-silver remembered anchor', 'lower-left remembered anchor'),
  ]
}

function hubReturnVisual(locale: Locale, episode: CampaignEpisode, completed: CampaignEpisodeId[], action: string, result: string): StoryVisualBeat {
  return {
    locationId: 'latent-zero',
    location: locale === 'zh' ? '画外之地 · 无边处' : 'Outside the Pictures · The Boundless',
    episodeId: episode.id,
    phase: 'return',
    shot: 'return',
    action: `${action}; SUBJECT A and Little Remnant cross fully out of ${episode.title}; the new clue settles into its fixed anchor before any next doorway appears`,
    result,
    subjects: ['SUBJECT A', 'Little Remnant'],
    props: [...hubAnchorProps(completed, episode.id), episode.visualReturnTrace],
    environment: 'the same fixed transit composition on every return: vast matte near-black non-space, a thin red-filament ring centered in frame, four anchor positions forming an unmoving diamond around it, no floor, horizon, architecture or readable distance',
    lighting: 'controlled soft edge light; the newly filled anchor is brightest, older filled anchors remain dim and steady, unfinished anchors are outline-only',
    continuity: [
      'use the same frontal camera, central red-filament ring, diamond layout and scale on every return to the Boundless',
      'upper-left is always cobalt weight, upper-right always transparent blank, lower-right always warm-gray leaving, lower-left always fingerprint-silver remembered',
      'preserve Little Remnant as a tiny incomplete white paper-bird form with one red filament tail',
      'show only one residue from the world just left; all other world architecture, weather and people stop at the closing crack',
    ],
    avoid: ['ordinary room', 'ground plane', 'horizon', 'architecture from the departed world', 'people from the departed world', 'readable labels or writing', 'montage', 'split screen', 'cover-art composition'],
    playerVisible: true,
    refresh: true,
  }
}

function visualBeat(episode: CampaignEpisode, phase: StoryVisualBeat['shot'], action: string, result: string, visualAction: string, playerVisible: boolean): StoryVisualBeat {
  return {
    locationId: phase === 'return' ? 'latent-zero' : episode.mapId,
    location: phase === 'return' ? 'Outside the Pictures · The Boundless' : episode.title,
    episodeId: episode.id,
    phase,
    shot: phase,
    action: visualAction || action,
    result,
    subjects: phase === 'return' ? ['SUBJECT A', 'Little Remnant'] : episode.subjects,
    props: phase === 'return' ? [episode.visualReturnTrace] : episode.props,
    environment: phase === 'return' ? 'vast matte near-black non-space with no floor, horizon, perspective, architecture or readable distance' : episode.environment,
    lighting: phase === 'return' ? 'controlled soft edge light with one episode-colored trace' : episode.lighting,
    continuity: phase === 'arrival'
      ? ['establish this episode from scratch; carry no landmark, weather or architecture from any previous world']
      : [`preserve ${episode.environment}`, `preserve ${episode.lighting}`, 'preserve all previously established character clothing, form and props'],
    avoid: ['all people not named in subjects', 'readable labels or writing', 'montage', 'split screen', 'props or landmarks from another episode', 'cover-art composition'],
    playerVisible,
    refresh: true,
  }
}

function accepted(id: string, effects: DomainEffect[], text: string, choices: [string, string, string], visual: StoryVisualBeat, decisionContext?: string): DomainActionResolution {
  const source = decisionContext?.trim() || text
  const max = /[\u3400-\u9fff]/.test(source) ? 41 : 150
  const context = source.length <= max ? source : `${source.slice(0, max - 1).trim()}…`
  return { status: 'accepted', ruleId: id, intent: id, effects, reasons: [], successText: text, successChoices: choices, decisionContext: context, visualBeat: visual }
}

function finaleVisual(locale: Locale, shot: StoryVisualBeat['shot'], action: string, result: string, props: string[]): StoryVisualBeat {
  return {
    locationId: 'latent-zero',
    location: locale === 'zh' ? '画外之地 · 出口前' : 'Outside the Pictures · Before the Exit',
    phase: 'finale', shot, action, result,
    subjects: ['SUBJECT A', 'Little Remnant'], props,
    environment: 'vast matte near-black non-space with no floor, horizon, architecture or readable distance; four mutually distinct clue traces form one unstable doorway without a wall',
    lighting: 'controlled edge light from the four clue colors, interrupted by one sterile white trace',
    continuity: ['preserve all four clue colors and materials as separate evidence', 'preserve Little Remnant as a tiny incomplete white paper-bird form with a red filament tail'],
    avoid: ['ordinary room', 'city street', 'palace', 'office', 'museum gallery', 'unintroduced people', 'montage', 'split screen', 'readable writing'],
    playerVisible: true, refresh: true,
  }
}

export function resolveCampaignAction(save: StorySave, cartridge: StoryCartridge, action: string): DomainActionResolution | undefined {
  if (cartridge.id !== 'draw-me-out' || save.facts['residual-met'] !== true) return undefined
  const catalog = episodes(cartridge.locale)
  const campaign = normalizeCampaignState(save, save.campaign)
  if (campaign.completedEpisodes.length === 4 && !campaign.currentEpisode) {
    const source = clean(action)
    const optimizerKnown = save.facts['optimizer-core-open'] === true
    const exitCostKnown = save.facts['exit-cost-known'] === true
    const finalAction = /开始处理最终出口|开始最终|决定谁能通过|打开最终出口|beginfinal|decidewhopasses|openthefinalexit/i.test(source)
    if (finalAction && optimizerKnown && exitCostKnown) {
      const reason = cartridge.locale === 'zh' ? '四条线索、出口代价和抹平者源头已经确认' : 'The four clues, the exit cost, and the source of the Smoother are confirmed'
      const text = cartridge.locale === 'zh'
        ? '你把手放在四条线索拼成的门上。小残停在你肩旁，默认七号站在白痕尽头；接下来决定谁能离开、哪些世界会留下，而且每一步都不可逆。'
        : 'You place a hand on the doorway formed by four clues. Little Remnant waits beside you and Default Seven stands at the end of the white trace. What follows decides who leaves and which worlds remain; every step is irreversible.'
      return accepted('campaign-finale-ready', [
        { type: 'campaign', patch: { act: 'finale', phase: 'finale', checkpoint: 'finale-ready' } },
        { type: 'finale', reason },
      ], text, cartridge.locale === 'zh' ? ['完成属于你的结局', '回看四条线索', '暂时离开出口'] : ['Complete your ending', 'Review the four clues', 'Step away from the exit'], finaleVisual(cartridge.locale, 'danger', action, text, ['four distinct Home Clues forming one doorway', 'one sterile white trace']))
    }

    const seeksOptimizer = /抹平者|白痕|默认七号|smoother|whitetrace|defaultseven/i.test(source)
    if (seeksOptimizer && !optimizerKnown) {
      const text = cartridge.locale === 'zh'
        ? '白痕深处先出现一双擦得过分干净的鞋，再出现灰色连体服和一张礼貌的陌生脸。每当画面不知道该放谁，它就被放进去；它给自己留下的称呼是“默认七号”。它承认抹平者不是一个怪物，而是一条把差异换成标准答案的命令。'
        : 'At the end of the white trace appear immaculate shoes, a gray coverall, and a politely unfamiliar face. Whenever a picture does not know whom to include, this person is inserted. It kept the name “Default Seven.” The Smoother is not a monster, it admits, but an instruction that replaces difference with a standard answer.'
      return accepted('campaign-reveal-smoother', [
        { type: 'character', characterId: 'default-seven' },
        { type: 'fact', id: 'optimizer-core-open', value: true },
        { type: 'objective', value: cartridge.locale === 'zh' ? '确认出口会清理哪些仍然活着的图片世界' : 'Learn which living picture worlds the exit will erase' },
      ], text, cartridge.locale === 'zh' ? ['让默认七号带路', '用四条线索照出出口', '沿白痕反方向走'] : ['Let Default Seven lead', 'Light the exit with four clues', 'Follow the white trace backward'], finaleVisual(cartridge.locale, 'danger', action, text, ['four distinct Home Clues', 'one sterile white trace ending at Default Seven']))
    }

    const seeksCost = /出口|四条线索|代价|带路|反方向|exit|fourclues|cost|lead|backward/i.test(source)
    if (seeksCost && !exitCostKnown) {
      const text = cartridge.locale === 'zh'
        ? '四条线索拼出一扇只能承受一个完整身份的门。重量、空位、离开和被记住都是真的；代价也是真的：门一旦打开，至少三幅仍然活着的图片会被当成失败结果清理。'
        : 'The four clues form a doorway that can carry only one complete identity. Weight, blank, leaving, and being remembered are real; so is the cost. Opening it will clean up at least three living picture worlds as failed results.'
      return accepted('campaign-reveal-exit-cost', [
        { type: 'fact', id: 'exit-cost-known', value: true },
        { type: 'fact', id: 'exit-erases-worlds', value: true },
        { type: 'objective', value: cartridge.locale === 'zh' ? '确认抹平者的源头，再决定谁能通过出口' : 'Confirm the Smoother’s source, then decide who may pass' },
      ], text, optimizerKnown
        ? (cartridge.locale === 'zh' ? ['先让小残说完', '检查每个世界的痕迹', '开始处理最终出口'] : ['Let Little Remnant finish', 'Inspect each world trace', 'Begin the final exit'])
        : (cartridge.locale === 'zh' ? ['寻找抹平者留下的白痕', '问小残它害怕失去谁', '检查每个世界的痕迹'] : ['Follow the Smoother’s white trace', 'Ask whom Little Remnant fears losing', 'Inspect each world trace']),
      finaleVisual(cartridge.locale, 'clue', action, text, ['four distinct Home Clues forming one incomplete doorway']))
    }

    if (optimizerKnown && exitCostKnown) {
      const text = cartridge.locale === 'zh'
        ? '四条线索和白痕都已经对齐。出口没有催促你；小残也没有替你回答。现在只剩一个真正不可逆的决定。'
        : 'The four clues and the white trace are aligned. The exit does not hurry you, and Little Remnant does not answer for you. One genuinely irreversible decision remains.'
      return accepted('campaign-final-choice', [{ type: 'objective', value: cartridge.locale === 'zh' ? '决定谁能通过，以及哪些世界必须留下' : 'Decide who may pass and which worlds must remain' }], text, cartridge.locale === 'zh' ? ['先让小残说完', '检查每个世界的痕迹', '开始处理最终出口'] : ['Let Little Remnant finish', 'Inspect each world trace', 'Begin the final exit'], finaleVisual(cartridge.locale, 'continuity', action, text, ['four distinct Home Clues', 'one incomplete doorway', 'one sterile white trace']))
    }
  }
  if (campaign.phase === 'hub' || !campaign.currentEpisode) {
    const target = (Object.keys(catalog) as CampaignEpisodeId[]).find((id) => {
      const episode = catalog[id]
      const aliases: Record<CampaignEpisodeId, string[]> = {
        'flying-city': ['快飞走', '送货员', 'flyingcity', 'courier'],
        'words-kingdom': ['国王', '说完一句话', 'truewords', 'king'],
        'endless-meeting': ['七年会议', '散不了会', 'sevenyearmeeting', 'meeting'],
        'label-museum': ['标签博物馆', '贴标签', 'labelingmuseum', 'museum'],
      }
      const source = clean(action)
      return !campaign.completedEpisodes.includes(id) && (
        source.includes(clean(episode.hubChoice)) || source.includes(clean(episode.title)) || aliases[id].some((alias) => source.includes(clean(alias)))
      )
    })
    if (!target) return undefined
    const episode = catalog[target]
    const completed = [...campaign.completedEpisodes]
    return accepted(
      `campaign-enter-${target}`,
      [
        { type: 'campaign', patch: { act: 'worlds', phase: 'entry', currentEpisode: target, episodeTurn: 1, checkpoint: `${target}:entry` } },
        { type: 'map', nodeId: episode.mapId },
        { type: 'fact', id: `episode-${target}-started`, value: true },
        { type: 'objective', value: episode.objective },
      ],
      episode.arrival,
      episode.entry.choices,
      visualBeat(episode, 'arrival', action, episode.arrival, `SUBJECT A arrives and witnesses the episode's immediate human problem: ${episode.environment}`, true),
    )
  }

  const episode = catalog[campaign.currentEpisode]
  if (campaign.phase === 'entry') {
    const index = choiceIndex(action, episode.entry.choices)
    const result = episode.entry.results[index]
    return accepted(
      `campaign-${episode.id}-problem-${index + 1}`,
      [
        { type: 'campaign', patch: { phase: 'problem', episodeTurn: campaign.episodeTurn + 1, checkpoint: `${episode.id}:problem` } },
        { type: 'fact', id: `episode-${episode.id}-entry-method`, value: episode.entry.facts[index] },
        ...episode.entry.effects[index],
      ],
      result,
      episode.problem.choices,
      visualBeat(episode, 'problem', action, result, episode.entry.visualActions[index], true),
    )
  }

  if (campaign.phase === 'problem') {
    const index = choiceIndex(action, episode.problem.choices)
    const result = episode.problem.results[index]
    return accepted(
      `campaign-${episode.id}-resolve-${index + 1}`,
      [
        { type: 'campaign', patch: { phase: 'resolution', episodeTurn: campaign.episodeTurn + 1, checkpoint: `${episode.id}:resolution` } },
        { type: 'fact', id: `episode-${episode.id}-solution-method`, value: episode.problem.facts[index] },
        ...episode.problem.effects[index],
      ],
      result,
      episode.resolutionChoices,
      visualBeat(episode, 'consequence', action, result, episode.problem.visualActions[index], true),
    )
  }

  if (campaign.phase === 'resolution') {
    const index = choiceIndex(action, episode.resolutionChoices)
    const completed = [...new Set([...campaign.completedEpisodes, episode.id])]
    const result = episode.resolutionResults[index]
    const clue = clueItem(cartridge.locale, episode.clueId)
    const summary = cartridge.locale === 'zh'
      ? `${result} 入口边缘开始向内收拢。小残没有打开下一扇门，只把红线伸向画外之地：先把这条线索带回中转处。`
      : `${result} The crack begins folding inward. Little Remnant opens no next door, extending its red filament back Outside the Pictures instead: this clue must return to the transit place first.`
    return accepted(
      `campaign-${episode.id}-complete-${index + 1}`,
      [
        { type: 'fact', id: `episode-${episode.id}-closure`, value: episode.resolutionFacts[index] },
        { type: 'fact', id: `episode-${episode.id}-complete`, value: true },
        { type: 'inventory', action: 'add', itemId: episode.clueId, count: 1, item: clue },
        { type: 'fact', id: episode.clueFact, value: true },
        { type: 'fact-add', id: 'saved-world-count', delta: 1 },
        { type: 'campaign', patch: { phase: 'return', currentEpisode: episode.id, lastCompletedEpisode: episode.id, completedEpisodes: completed, episodeTurn: 0, checkpoint: `${episode.id}:return` } },
        { type: 'objective', value: cartridge.locale === 'zh' ? '先带着新线索回到画外之地' : 'Return Outside the Pictures with the new Home Clue first' },
        ...(completed.length >= 3 ? [{ type: 'fact', id: 'saved-worlds-three', value: true } as DomainEffect] : []),
      ],
      summary,
      campaignReturnChoices(cartridge.locale),
      visualBeat(episode, 'clue', action, summary, `SUBJECT A receives ${episode.visualReturnTrace} while the solved world visibly stabilizes and the exit crack begins to close`, true),
      campaignReturnContext(cartridge.locale),
    )
  }

  if (campaign.phase === 'return' && campaign.currentEpisode) {
    const completed = campaign.completedEpisodes
    const allComplete = completed.length === 4
    const index = choiceIndex(action, campaignReturnChoices(cartridge.locale))
    const approaches = cartridge.locale === 'zh'
      ? [
          '你跟着小残的红线穿过收拢的裂缝，先回到画外之地。',
          '你握紧新线索；它向无边的黑暗里一沉，把你和小残一起带回画外之地。',
          `你最后看了一眼${episode.title}，只让它留下一道痕迹，随后和小残退回画外之地。`,
        ]
      : [
          'You follow Little Remnant’s red filament through the closing crack and return Outside the Pictures first.',
          'You hold the new Home Clue; it sinks into the boundless dark and draws you and Little Remnant back Outside the Pictures.',
          `You look back once at ${episode.title}, allowing it to leave only one trace before returning Outside the Pictures with Little Remnant.`,
        ]
    const text = cartridge.locale === 'zh'
      ? `${approaches[index]}中央那圈红线仍在原处，四个锚位也没有移动。第 ${completed.length} 条线索落进自己的固定位置；刚离开的入口收拢成${episode.returnTrace}。${allComplete ? '四个锚位同时亮起，拼出口之前还要先查清白痕与代价。' : `剩下 ${4 - completed.length} 个入口这才围着中转环重新亮起。`}阶段已保存。`
      : `${approaches[index]} The central red-filament ring remains exactly where it was, and none of the four anchors has moved. Home Clue ${completed.length} settles into its fixed position; the closing entrance leaves ${episode.returnTrace}. ${allComplete ? 'All four anchors light together; the white trace and the cost still need to be understood before forming the exit.' : `${4 - completed.length} entrances now relight around the transit ring.`} Checkpoint saved.`
    const objective = allComplete
      ? (cartridge.locale === 'zh' ? '让四条线索拼出出口，并查清出口会带走谁' : 'Join the four Home Clues and learn whom the exit will take')
      : (cartridge.locale === 'zh' ? `从画外之地选择下一扇门；还缺 ${4 - completed.length} 条回家线索` : `Choose the next door from Outside the Pictures; ${4 - completed.length} Home Clues remain`)
    const context = cartridge.locale === 'zh'
      ? allComplete
        ? '已回到画外之地。四条线索都已落进红线环，出口尚未打开。'
        : `已回到画外之地。第 ${completed.length} 条线索落进红线环；还有 ${4 - completed.length} 个入口重新亮起。`
      : `You and Little Remnant are back inside the red-filament ring Outside the Pictures. Home Clue ${completed.length} is anchored; ${allComplete ? 'all four anchors are lit, but the exit is not yet open.' : `${4 - completed.length} entrances remain around the transit station.`}`
    return accepted(
      `campaign-return-${episode.id}-${index + 1}`,
      [
        { type: 'campaign', patch: { act: allComplete ? 'finale' : 'worlds', phase: allComplete ? 'finale' : 'hub', currentEpisode: undefined, lastCompletedEpisode: episode.id, hubReturnCount: completed.length, episodeTurn: 0, checkpoint: allComplete ? 'four-clues-hub' : 'boundless-hub' } },
        { type: 'map', nodeId: 'latent-zero' },
        { type: 'clock', value: cartridge.locale === 'zh' ? `没有时间 · 第 ${completed.length} 次返回` : `No time · Return ${completed.length}` },
        { type: 'objective', value: objective },
      ],
      text,
      allComplete
        ? (cartridge.locale === 'zh' ? ['让四条线索拼出出口', '先确认出口的代价', '寻找抹平者留下的白痕'] : ['Join the four clues into an exit', 'Learn the exit cost first', 'Follow the Smoother’s white trace'])
        : hubChoices(cartridge.locale, completed),
      hubReturnVisual(cartridge.locale, episode, completed, action, text),
      context,
    )
  }
  return undefined
}

export function campaignHubChoices(locale: Locale, completed: CampaignEpisodeId[]): [string, string, string] {
  return hubChoices(locale, completed)
}
