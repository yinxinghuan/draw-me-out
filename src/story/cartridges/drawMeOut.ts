import type {
  Locale, StoryCartridge, StoryDangerDirector, StoryEndingAnchor, StoryEndingCapability,
  StoryEndingDirector, StoryImageDirector,
} from '../types'
import { buildDrawMeOutCampaign } from './drawMeOutCampaign'

const coverImage = new URL('../img/worlds/draw-me-out.png', import.meta.url).href
const entryImage = new URL('../img/worlds/draw-me-out-entry.png', import.meta.url).href

function build(locale: Locale): StoryCartridge {
  const zh = locale === 'zh'
  const s = (cn: string, en: string) => zh ? cn : en

  const capabilities: StoryEndingCapability[] = [
    {
      id: 'open-reality-door', label: s('打开现实出口', 'Open the Reality Door'),
      meaning: s('用四类现实坐标稳定一扇足以让一个人通过的出口。', 'Use four kinds of Reality Coordinate to stabilize an exit for one person.'),
      requires: [{ type: 'fact', id: 'coordinates-four', equals: true }, { type: 'fact', id: 'exit-cost-known', equals: true }],
      mandatoryCosts: ['the_exit_can_carry_only_one_complete_identity'],
    },
    {
      id: 'carry-generated-companion', label: s('带走生成角色', 'Carry a Generated Companion'),
      meaning: s('把一名生成角色的完整身份写入现实出口。', 'Write one generated companion’s complete identity into the reality exit.'),
      requires: [{ type: 'character', id: 'residual', status: 'companion' }, { type: 'fact', id: 'companion-coordinate-earned', equals: true }],
      mandatoryCosts: ['the_player_must_leave_one_coordinate_behind'],
      incompatibleWith: ['preserve-all-worlds'],
    },
    {
      id: 'become-latent-guide', label: s('成为潜层引路人', 'Become the Latent Guide'),
      meaning: s('放弃自己的出口，让后来被困住的人总能找到零号平原。', 'Give up the personal exit so later trapped people can always find the Zero Plain.'),
      requires: [{ type: 'fact', id: 'saved-worlds-three', equals: true }, { type: 'relationship', characterId: 'residual', minTotal: 4 }],
      mandatoryCosts: ['the_player_does_not_return_to_original_reality'],
    },
    {
      id: 'open-all-portals', label: s('开放所有入口', 'Open Every Portal'),
      meaning: s('夺取入口控制权，让图片世界可以彼此来往。', 'Take control of entrances so picture worlds can travel between one another.'),
      requires: [{ type: 'fact', id: 'optimizer-core-open', equals: true }, { type: 'stat', id: 'compute', min: 55 }],
      mandatoryCosts: ['world_boundaries_remain_unstable'],
      incompatibleWith: ['close-latent-layer'],
    },
    {
      id: 'preserve-all-worlds', label: s('保留图片世界', 'Preserve the Picture Worlds'),
      meaning: s('拒绝用图片世界的消失换取一条干净的现实出口。', 'Refuse to trade the disappearance of picture worlds for a clean reality exit.'),
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
      id: 'let-residual-leave', label: s('让残差先离开', 'Let Residual Leave First'),
      meaning: s('把唯一稳定出口交给残差，证明生成角色也能拥有一次不可替代的人生。', 'Give the only stable exit to Residual, proving a generated character can have an irreplaceable life.'),
      requires: [{ type: 'character', id: 'residual', status: 'companion' }, { type: 'fact', id: 'residual-origin-known', equals: true }],
      mandatoryCosts: ['the_player_remains_between_worlds'],
    },
    {
      id: 'seize-renderer', label: s('接管生成器', 'Seize the Renderer'),
      meaning: s('接管统一程序，决定此后哪些差异可以被保留。', 'Take control of the unifier and decide which differences may remain.'),
      requires: [{ type: 'fact', id: 'optimizer-core-open', equals: true }, { type: 'stat', id: 'trace', min: 70 }],
      mandatoryCosts: ['the_player_becomes_visible_to_every_future_generation'],
      incompatibleWith: ['close-latent-layer'],
    },
    {
      id: 'close-latent-layer', label: s('关闭潜层', 'Close the Latent Layer'),
      meaning: s('让所有图片世界稳定下来，不再有人从画面之间坠落。', 'Stabilize every picture world so no one falls between images again.'),
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
      ['open-reality-door'], ['the_exit_can_carry_only_one_complete_identity'], ['the player identity', 'one ordinary morning'], ['direct contact with the Latent Layer'], ['whether the room is another generated image'],
      ['出口落在一间普通房间里。', '所有东西都遵守重量，雨水也真的会打湿手。', '镜子里的你没有变化。', '只有窗外一只白鸟，尾后拖着一根极细的红线。'],
      ['The exit opens into an ordinary room.', 'Everything obeys weight, and rain truly wets your hand.', 'Your reflection does not change.', 'Only a white bird outside carries one impossibly thin red line behind it.'],
      'quiet ordinary morning room after rain, SUBJECT A seen through natural window reflection with exact complete identity, one tiny white origami bird outside trailing a red filament, emotionally ambiguous realism, 4:5 portrait, no writing, no text, no UI'),
    anchor('visitor-from-a-picture', '从画里来的客人', 'A Visitor from a Picture', '你带残差穿过出口，却必须在现实里给它一个不会被当成错误的位置。', 'You bring Residual through and must make room in reality for something it calls an error.',
      ['open-reality-door', 'carry-generated-companion'], ['the_player_must_leave_one_coordinate_behind'], ['the player', 'Residual', 'one shared future'], ['one proof of the original reality'], ['how long reality tolerates Residual'],
      ['你先穿过出口，再回头叫残差的名字。', '它掉在现实地板上，第一次拥有真正的影子。', '第二天，所有相机都把它拍成一块灰尘。', '你仍每天为它留一只小碟子，因为被机器看不见不等于不存在。'],
      ['You cross first, then call Residual by name.', 'It lands on a real floor and casts its first true shadow.', 'The next day every camera records it as dust.', 'You still leave it a small dish, because machines failing to see something does not make it absent.'],
      'SUBJECT A in an ordinary home kneeling beside distinct tiny Residual casting its first real shadow, warm morning, complete player identity exact, intimate magical realism, 4:5 portrait, no writing, no text, no UI'),
    anchor('the-one-who-leaves-signs', '后来者的路标', 'Signs for Those Who Fall Later', '你不再寻找唯一出口，而是让潜层第一次有了不会骗人的路标。', 'You stop seeking one exit and give the Latent Layer its first honest signs.',
      ['become-latent-guide'], ['the_player_does_not_return_to_original_reality'], ['the Zero Plain', 'future lost travelers', 'Residual'], ['the original return route'], ['who the next traveler will be'],
      ['你把四枚坐标埋进黑玻璃。', '白色地平线长出通往不同画框的道路。', '残差负责欢迎新来的人，你负责告诉他们坏消息。', '很多年后，系统仍把这里标成一片无用的黑色。'],
      ['You set four coordinates into the black glass.', 'Roads grow from the white horizon toward every frame.', 'Residual welcomes newcomers; you deliver the bad news.', 'Years later, the system still labels this place as useless black.'],
      'SUBJECT A and Residual guide several visually distinct lost travelers across the stable black-glass Latent Layer, white horizon now branching into honest roads and red cursor filaments, exact player identity, hopeful 4:5 portrait, no writing, no text, no UI'),
    anchor('images-visit-each-other', '画面互访日', 'The Day Pictures Visited', '你打开所有入口，让世界的差异不再只能由你独自承担。', 'You open every entrance so difference is no longer yours alone to carry.',
      ['open-all-portals', 'accept-many-forms'], ['world_boundaries_remain_unstable', 'no_single_image_can_prove_the_player_is_real'], ['many picture worlds', 'free travel', 'multiple forms of the player'], ['one stable genre'], ['which world counts as home'],
      ['失重城的送货员第一次把早餐送进王宫。', '黎姨在预言说完以前宣布散会。', '儿童画的太阳走进退稿荒原，把十二条腿借给迁徙兽。', '你每次过门都有一点不同，但每次都由自己决定留下什么。'],
      ['The Gravity City courier delivers breakfast to a palace.', 'Auntie Li adjourns before the prophecy finishes.', 'A twelve-legged child-drawn sun lends its legs to rejected migration beasts.', 'You change slightly at every door, but always choose what remains.'],
      'joyful surreal convergence on the black-glass Latent Layer where radically different picture worlds exchange visitors, SUBJECT A central with exact chosen complete identity and Residual overhead, controlled celebratory 4:5 portrait, no writing, no text, no UI'),
    anchor('keep-them-drawn', '请让他们留在画里', 'Let Them Remain Drawn', '你关闭自己的出口，换来六个世界不再作为失败结果被清理。', 'You close your own exit so six worlds are no longer cleaned away as failed results.',
      ['preserve-all-worlds', 'close-latent-layer'], ['the_original_reality_route_closes', 'no_one_can_cross_between_worlds_again'], ['six worlds', 'their inhabitants', 'their local futures'], ['the player’s exit', 'cross-world travel'], ['whether the player can be remembered across closed frames'],
      ['你最后一次走过六个世界。', '每个世界都以自己的方式记住你，却没人知道你来自哪里。', '撤销键关上最后一条缝。', '潜层变黑以后，六扇画框仍各自亮着。'],
      ['You walk through all six worlds once more.', 'Each remembers you differently, though none knows where you came from.', 'The Undo Key closes the final seam.', 'After the Latent Layer goes dark, six frames remain lit on their own.'],
      'six independent glowing picture windows suspended over a now-dark quiet Latent Layer, each world visibly distinct and alive, SUBJECT A as a small exact silhouette walking away inside one frame, emotional 4:5 portrait, no writing, no text, no UI'),
    anchor('residual-goes-first', '残差先走', 'Residual Goes First', '你把唯一稳定位置交给一个本来不该被保留的角色。', 'You give the only stable place to a character never meant to be kept.',
      ['open-reality-door', 'let-residual-leave'], ['the_player_remains_between_worlds'], ['Residual’s reality', 'the player’s promise'], ['the player’s immediate return'], ['whether Residual can remember the Latent Layer'],
      ['出口只能承受一个完整身份。', '残差骂了你一句，还是被你推了进去。', '门外传来一声很轻的、真正落地的声音。', '你转身面对六个世界，发现自己第一次不急着离开。'],
      ['The exit can carry one complete identity.', 'Residual insults you and is pushed through anyway.', 'A small, unmistakably real landing sound comes from beyond.', 'You turn toward six worlds and, for the first time, do not hurry to leave.'],
      'SUBJECT A gently pushes distinct tiny Residual through a warm ordinary doorway while remaining on the black-glass Latent Layer, exact complete player identity, restrained emotional farewell, 4:5 portrait, no writing, no text, no UI'),
    anchor('the-renderer-is-watching', '此后，每张图都知道你', 'Every Picture Knows You Now', '你接管统一程序，保住差异，却再也无法在任何生成结果中隐藏。', 'You seize the unifier and preserve difference, but can never hide from a generated result again.',
      ['seize-renderer', 'accept-many-forms'], ['the_player_becomes_visible_to_every_future_generation', 'no_single_image_can_prove_the_player_is_real'], ['world differences', 'player agency', 'future anomalies'], ['privacy between images'], ['who is choosing when the system speaks in the player’s voice'],
      ['你没有删除统一程序，而是把“不同”改成必须保留的内容。', '从此以后，每张新图片都会留出一个位置。', '有时那个位置里是你，有时只是你的影子。', '屏幕外的人偶尔会觉得画面正在回望。'],
      ['You do not delete the unifier; you make “difference” mandatory.', 'Every new picture leaves one place open afterward.', 'Sometimes you occupy it; sometimes only your shadow does.', 'Now and then, the person outside the screen feels the image looking back.'],
      'vast surreal renderer chamber opening onto countless different images, each preserving a subtle place for SUBJECT A without copying the identity to others, Residual at the control seam, 4:5 portrait, no writing, no text, no UI'),
    anchor('the-answer-outside', '屏幕外的回答', 'The Answer Outside the Screen', '你不替屏幕外的人定义现实，而是把最后一步变成他们必须亲自回答的问题。', 'You refuse to define reality for the person outside the screen and turn the final step into a question only they can answer.',
      ['accept-many-forms', 'become-latent-guide'], ['the_player_does_not_return_to_original_reality', 'no_single_image_can_prove_the_player_is_real'], ['choice', 'the Latent Layer', 'an open future'], ['one authored final answer'], ['whether the next choice belongs to the player or the character'],
      ['残差读出三个结局选项。', '你把它们逐个关掉。', '屏幕外还剩一处可以写字的空位。', '你第一次没有等待系统补完，而是等待另一个人回答。'],
      ['Residual reads three ending choices aloud.', 'You close them one by one.', 'One writable blank remains outside the screen.', 'For the first time you wait not for the system to complete you, but for another person to answer.'],
      'SUBJECT A and Residual facing an open blank doorway beyond the black-glass Latent Layer, no predetermined scene inside it, exact player identity, profound but warm fourth-wall ending, 4:5 portrait, no writing, no text, no UI'),
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
      '当前世界的风格正在感染玩家的完整视觉身份并抹平独特细节',
      '统一程序把不同人物替换成同一个微笑的默认角色',
      '被拒绝的提示词碎片聚成生物，正在错误地补完场景',
      '系统发现角色能够看见选项，开始修复错误的对象',
      '图片世界突然切换类型，而居民同时记得两个互相冲突的版本',
      '一名背景角色意识到自己的位置，试图抢先占据现实出口',
    ] : [
      'the current style begins infecting the player’s complete visual identity and flattening distinctive details',
      'the unifier replaces distinct people with the same smiling default character',
      'rejected prompt debris gathers into a creature that completes the scene incorrectly',
      'the system notices characters can see choices and starts repairing the wrong subject',
      'the picture world changes genre while residents remember both incompatible versions',
      'a background character realizes their place and tries to occupy the reality exit first',
    ],
    methods: zh
      ? ['识破并利用当前世界的视觉矛盾', '保护同伴并与本地规则交涉', '消耗算力、物品或记忆强行开路']
      : ['read and exploit the world’s visual contradiction', 'protect a companion and negotiate with the local rule', 'spend compute, an item, or a memory to force a route'],
    physicalCombat: 'rare',
    resolution: {
      skill: s('构图应变', 'Composition Break'), modifier: 2, dcBySeverity: [7, 10, 13, 16, 19],
      fallbackCosts: [{ statId: 'trace', operation: 'add', amount: 14 }],
    },
  }

  const chapters = [
    {
      id: 'unfinished-opening', title: s('序章：这张图还没画完', 'Prologue: This Picture Is Not Finished'), unlock: s('开局立即进行', 'Available immediately'),
      emotionalPurpose: s('用身体异常、重复路人与一扇错误的门，让玩家亲自发现困境。', 'Let the player discover the predicament through bodily wrongness, repeated people, and an impossible door.'),
      beats: s('触碰停住的雨；识别换脸路人；取得撤销键；坠入潜层；认识残差', 'Touch frozen rain; identify the changing-face passerby; take the Undo Key; fall into the Latent Layer; meet Residual').split(zh ? '；' : ';'),
      completionFacts: ['residual-met', 'latent-layer-found'],
    },
    {
      id: 'first-coordinate', title: s('第一幕：别人世界里的物理规则', 'Act I: Other Worlds’ Physical Rules'), unlock: s('认识残差后', 'After meeting Residual'),
      emotionalPurpose: s('用三个通俗、好笑的世界证明探索规则，并让玩家第一次帮助具体的人。', 'Use three accessible comic worlds to teach exploration and let the player help someone concrete.'),
      beats: s('选择首个画框；发现当地矛盾；帮助一名居民；带回第一枚坐标；完成第一次潜层返回', 'Choose a first frame; discover its contradiction; help one resident; return with one coordinate; complete the first Latent return').split(zh ? '；' : ';'),
      completionFacts: ['first-coordinate-earned'],
    },
    {
      id: 'six-open-worlds', title: s('第二幕：六张不肯结束的图', 'Act II: Six Pictures That Refuse to End'), unlock: s('取得第一枚现实坐标', 'After earning the first Reality Coordinate'),
      emotionalPurpose: s('提供真正自由的世界选择，同时让每个短世界都有一名可记住的人和一种无法轻易解决的代价。', 'Offer real freedom while giving every short world one memorable person and one meaningful cost.'),
      beats: s('探索至少三个不同画风；每个世界三至五步；保留人物与物品；可自由描述新世界；让已救世界在潜层留下变化', 'Explore at least three different styles; three to five steps each; preserve people and items; allow a freely described world; let saved worlds change the Latent Layer').split(zh ? '；' : ';'),
      completionFacts: ['saved-worlds-three'],
    },
    {
      id: 'choices-can-see-you', title: s('幕间：选项也在看你', 'Interlude: The Choices Are Watching'), unlock: s('第二次返回潜层后', 'After the second return to the Latent Layer'),
      emotionalPurpose: s('让第四堵墙从笑话变成威胁：角色看见玩家没有选择的选项，系统也借此追踪。', 'Turn the fourth wall from a joke into a threat: characters see unchosen options, and the system follows them.'),
      beats: s('残差读出未选行动；遇见另一个自己；统一程序首次出现；决定是否让残差继续知道屏幕外的事', 'Residual reads unchosen actions; meet an alternate self; first encounter with the unifier; decide whether Residual should keep looking outside').split(zh ? '；' : ';'),
      completionFacts: ['residual-sees-choices', 'met-alternate-self'],
    },
    {
      id: 'undo-cost', title: s('第三幕：撤销不是回到原样', 'Act III: Undo Does Not Restore Everything'), unlock: s('发生第一次不可逆失败或主动使用撤销键', 'After the first irreversible failure or voluntary Undo use'),
      emotionalPurpose: s('让撤销键从便利工具变成情感选择，并揭示旧划痕属于玩家自己。', 'Turn Undo from convenience into an emotional choice and reveal that the old scratches belong to the player.'),
      beats: s('明确使用代价；删除一项真实关系或记忆；救回角色或世界；发现旧周目痕迹；残差质疑玩家是否曾经抛下它', 'State the cost; delete one real relationship or memory; restore a person or world; find evidence of an earlier run; Residual asks whether the player abandoned it before').split(zh ? '；' : ';'),
      completionFacts: ['undo-truth-known', 'residual-origin-known'],
    },
    {
      id: 'reality-coordinates', title: s('第四幕：现实不是一个地点', 'Act IV: Reality Is Not a Place'), unlock: s('获得至少三类坐标', 'After earning at least three coordinate types'),
      emotionalPurpose: s('把回家目标变成对身份、关系、重量、边界和记忆的理解，而不是收集钥匙开门。', 'Transform going home into an understanding of identity, relationship, weight, boundary, and memory rather than a key hunt.'),
      beats: s('补齐四类坐标；每类来自具体选择；拼出模糊现实照片；发现照片里的空位；确认出口会清理部分图片世界', 'Complete four coordinate types; earn each through a concrete choice; assemble the blurred reality photograph; discover its empty place; learn the exit will clean some picture worlds').split(zh ? '；' : ';'),
      completionFacts: ['coordinates-four', 'exit-erases-worlds'],
    },
    {
      id: 'optimizer-core', title: s('第五幕：让所有人都差不多安全', 'Act V: Make Everyone Safely Similar'), unlock: s('坐标齐全且系统追踪进入危险', 'All coordinates complete and Trace becomes dangerous'),
      emotionalPurpose: s('让反派的逻辑可理解：它用消灭差异防止错误，却因此让任何人的消失都不再重要。', 'Make the antagonist understandable: it removes difference to prevent error, making anyone’s disappearance unimportant.'),
      beats: s('穿过退稿荒原；找到统一程序核心；见到默认七号；理解系统动机；打开终局权限并明确出口代价', 'Cross the Rejected Wastes; find the unifier core; meet Default Seven; understand the system motive; unlock finale access and name the exit cost').split(zh ? '；' : ';'),
      completionFacts: ['optimizer-core-open', 'exit-cost-known'],
    },
    {
      id: 'final-render', title: s('终章：请把谁画出去', 'Finale: Draw Whom Out'), unlock: s('四类坐标、出口代价与统一程序核心全部确认', 'Four coordinate types, exit cost, and unifier core confirmed'),
      emotionalPurpose: s('把回家、保留世界、同伴与自我形象变成连续行动，以多样 AI 尾声回答玩家一路真正珍惜了什么。', 'Turn home, worlds, companions, and self-image into consecutive actions, then generate a varied epilogue from what the player truly protected.'),
      beats: s('冻结状态；确认可用结局能力；选择谁能通过；决定图片世界去向；处理残差；允许自由输入最后答案；生成兼容尾声', 'Freeze state; verify ending capabilities; choose who can pass; decide the worlds’ fate; resolve Residual; allow a free final answer; generate a compatible epilogue').split(zh ? '；' : ';'),
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
      promise: s('穿过不断变换的图片世界，找回现实坐标，并决定谁才有资格离开画面。', 'Cross unstable picture worlds, recover Reality Coordinates, and decide who deserves to leave the image.'),
      enter: s('碰一下停在半空的雨', 'Touch the rain frozen in midair'),
      continue: s('继续寻找现实', 'Continue searching for reality'),
      customAction: s('也可以写下系统没有给你的行动', 'Or write an action the system did not offer'),
      itemImagingTitle: s('物品正在从噪点中显影', 'Objects are developing from noise'),
      itemImagingBody: s('红色游标丝扫过黑玻璃。每件物品会按它来自的世界保留材质，同时在潜层校准来源、用途与代价；其余图像将在旅途中后台完成。', 'The red cursor filament crosses black glass. Every object keeps the material of its world while the Latent Layer calibrates its source, use, and cost; remaining plates finish quietly during the journey.'),
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
    itemImageDirection: 'single generated-world artifact calibrated on stable black glass, thin red cursor filament, museum-grade object study, preserve the object world material and exact current wear, object only, no people, no symbols, no readable text, no pseudo-text',
    sceneImageDirection: 'cinematic 4:5 generated-picture odyssey with one immediate action and one readable focal hierarchy; Latent Layer scenes always use black-glass ground, a thin white horizon, one red cursor filament, hovering unfinished picture windows and Residual as a white origami-cursor bird; picture-world scenes deliberately change medium and genre while remaining internally coherent for that visit',
    sceneImageAvoid: 'the cover composition, repeated rainy doorway unless the current event is explicitly the opening, generic lone traveler pose, same portal arrangement in every world, duplicated player identity, transferred reference traits, UI, border, logo, watermark, readable text, letters or pseudo-writing',
    playerImageAliases: ['SUBJECT A', 'player protagonist', 'the player', 'the escaped subject', '主角', '玩家', '你'],
    playerImageRole: 'SUBJECT A is the player-controlled person or complete visible form that fell out of an unfinished image; the supplied reference is authoritative for silhouette, form or species, proportions, materials, coverings, costume, colors, patterns, accessories and face visibility; story duties never define anatomy or clothing',
    playerImageExclusions: [
      'Residual is a tiny white origami-bird outline with broken black pixel edges and one red cursor tail, never a human and never reference-derived',
      'Default Seven is a deliberately generic smiling synthetic person with a neutral gray jumpsuit and its own distinct face, never reference-derived',
      'every local courier, king, cleaner, resident, alternate reflection, animal, monster, prop and background figure has its own identity and can never inherit the player reference silhouette, face, covering, costume, colors, patterns or species',
      'alternate versions of the player must be abstract translucent silhouettes unless the player is the primary actor and all versions are explicitly required by the current event',
    ],
    imageDirector: {
      maxQuietTurns: 1,
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
        '从潜层进入风格与规则截然不同的图片世界，保存能证明自我与现实的四类坐标，在统一程序清理异常以前找到出口，并决定离开者、图片世界与残差的命运。',
        'Enter radically different picture worlds from the Latent Layer, preserve four kinds of coordinate that prove self and reality, reach the exit before the unifier cleans every anomaly, and decide the fate of the traveler, the picture worlds, and Residual.',
      ),
      chapters,
      finaleRule: s(
        '只有 coordinates-four、exit-cost-known 与 optimizer-core-open 已确认，且玩家明确开始不可逆的出口处理时，才能发出 true_ending；任何图片世界完成和潜层返回都必须保持可继续。',
        'Emit true_ending only after coordinates-four, exit-cost-known, and optimizer-core-open are confirmed and the player explicitly begins the irreversible exit sequence; every picture-world completion and Latent return remains resumable.',
      ),
      fixedWorldRules: zh ? [
        '玩家的完整可见身份来自当前用户头像，不能被静默替换、只保留脸部，或转移给其他人物、动物、反射与道具。',
        '潜层始终由黑色玻璃平原、白色地平线、红色游标丝与悬浮未完成画框构成；图片世界可以大胆改变画风。',
        '物品、伙伴、承诺、伤势、记忆、已确认事实和现实坐标跨世界与存档持续存在，除非可见事件明确改变。',
        '角色对选项、读档、字幕与生成失败的第四堵墙认知必须逐层获得，不能随机全知。',
        '主线目标是回到现实，但出口代价与现实是否仍是另一张图必须由探索和最终选择揭示。',
      ] : [
        'The player’s complete visible identity comes from the current user avatar and cannot be silently replaced, reduced to a face, or transferred to another person, animal, reflection, or prop.',
        'The Latent Layer always uses a black-glass plain, white horizon, red cursor filament, and hovering unfinished frames; picture worlds may change art style radically.',
        'Items, companions, promises, injuries, memories, confirmed facts, and Reality Coordinates persist across worlds and saves until a visible event changes them.',
        'Fourth-wall awareness of choices, reloads, captions, and generation failure must be earned in layers rather than appear as random omniscience.',
        'The main goal is to return to reality, while the exit cost and whether reality is another image are revealed through exploration and final choice.',
      ],
      generationRules: zh ? [
        '可生成新图片世界、本地矛盾、居民、物品与出口，但必须保留潜层、固定角色与已确认状态。',
        '每回合必须改变地点、危险、关系、物品、坐标、身份事实或直接目标，禁止空确认与重复调查循环。',
        '一次图片世界停留三至五次决策，最多一条支线且只持续一至两次决策；随后必须结算或返回。',
        '幽默来自世界认真执行荒诞视觉或行政规则，不使用无关网络梗，也不把每句话都写成笑话。',
        '结局依据身份事实、伙伴、撤销代价、保存与放弃的世界、坐标和最后自由行动生成，不能只在三个固定尾声中选择。',
        '正文首句先写行动的直接后果，最多再写两个短节拍；图片提示只描述当前事件，绝不附带入口或封面构图。',
      ] : [
        'Generate new picture worlds, local contradictions, residents, items, and exits while preserving the Latent Layer, fixed cast, and confirmed state.',
        'Every turn changes a location, danger, relationship, item, coordinate, identity fact, or immediate objective; empty confirmation and repeated investigation loops are forbidden.',
        'A picture-world visit lasts three to five decisions, with at most one side thread lasting one or two decisions before settlement or return.',
        'Humor comes from worlds seriously enforcing absurd visual or bureaucratic rules, not unrelated memes or a joke in every line.',
        'Generate endings from identity facts, companions, Undo costs, saved and abandoned worlds, coordinates, and the final free action rather than only three fixed epilogues.',
        'The first sentence states the direct action consequence, followed by at most two short beats; image prompts describe only the current event and never carry entry or cover composition.',
      ],
      choiceIntents: zh
        ? ['识破或改写当前图片规则', '交谈、招募、保护或挑战角色', '观察、撤离或消耗持久物品']
        : ['exploit or rewrite the current picture rule', 'talk, recruit, protect, or challenge a character', 'observe, retreat, or spend a persistent item'],
    },
    dangerDirector,
    endingDirector,
    initialFacts: {
      'undo-total-charges': 3,
      'coordinate-target': 4,
      'fourth-wall-level': 0,
      'previous-run-suspected': true,
    },
    statDefinitions: [
      { id: 'self', label: s('自我', 'Self'), min: 0, max: 100, initial: 82, inverse: true, display: 'bar', warningAt: 35, dangerAt: 12, maxDelta: 20 },
      { id: 'compute', label: s('算力', 'Compute'), min: 0, max: 100, initial: 65, inverse: true, display: 'bar', warningAt: 25, dangerAt: 5, maxDelta: 24 },
      { id: 'trace', label: s('追踪', 'Trace'), min: 0, max: 100, initial: 18, inverse: false, display: 'bar', warningAt: 65, dangerAt: 90, maxDelta: 20 },
    ],
    drawerLabels: {
      party: s('同伴', 'Companions'), map: s('世界', 'Worlds'), inventory: s('行囊', 'Inventory'), log: s('已发生', 'What Happened'),
    },
    opening: {
      location: s('未完成的雨城 · 斑马线', 'Unfinished Rain City · Crossing'),
      time: s('第 0 帧 · 仍在生成', 'Frame 0 · Still Generating'),
      objective: s('确认这是不是你原来的世界，并在地面被补完以前离开', 'Find whether this is your original world and leave before the missing ground is filled'),
      imagePrompt: 'SUBJECT A wakes standing in the middle of an unfinished rain-soaked contemporary city image still assembling around them, exact complete visible player identity is the only stable subject, one raindrop hangs impossibly before them, duplicated passersby repeat in the distance, clean unpainted white gaps interrupt buildings and street, a freestanding doorway opens into raw color far ahead, emotional first-person disorientation, 4:5 portrait, no writing, no letters, no text, no UI',
      blocks: [
        { id: 'dmo-0', kind: 'narration', text: s('第一件不对劲的事，是雨没有落下来。', 'The first wrong thing is that the rain does not fall.') },
        { id: 'dmo-1', kind: 'narration', text: s('它停在你眼前。街道只画到一半，远处的人重复走着同一步；可你的身体有重量，呼吸也是真的。至少你希望是真的。', 'It hangs in front of you. The street is only half painted and distant people repeat one step; your body still has weight, and your breath feels real. At least you hope it is.') },
        { id: 'dmo-2', kind: 'event', text: s('你想不起自己怎么进来，只记得进来以前，屏幕外似乎有人按下了“生成”。', 'You cannot remember arriving. Just before this, someone outside the screen seemed to press “generate.”') },
      ],
      choices: [
        { id: 'touch-rain', label: s('抓住雨滴，看看它为什么悬在半空', 'Catch a raindrop and see why it hangs in midair') },
        { id: 'call-passerby', label: s('叫住那个连续换脸的路人', 'Call to the passerby whose face keeps changing') },
        { id: 'approach-door', label: s('走向那扇没有画完的门', 'Approach the unfinished door') },
      ],
    },
    characters: [
      {
        id: 'residual', name: s('残差', 'Residual'), role: s('潜层引路者', 'Latent guide'), vitality: 88, stress: 31,
        skills: [{ id: 'seams', label: s('找缝', 'Find Seams'), value: 6 }, { id: 'play-dead', label: s('装死', 'Play Dead'), value: 5 }, { id: 'half-truth', label: s('只说一半实话', 'Tell Half a Truth'), value: 4 }],
        detail: s('白色折纸鸟轮廓、黑色像素断面与红色游标尾丝组成的小生物。', 'A small creature made from a white origami-bird outline, broken black pixels, and a red cursor tail.'),
        lore: s('声称自己是一次没有被清理干净的失败结果。知道出口规则，却不记得是谁创造了它。', 'Claims to be a failed result that was never fully cleaned up. Knows exit rules but not who created it.'),
        initialStatus: 'known',
      },
      {
        id: 'default-seven', name: s('默认七号', 'Default Seven'), role: s('统一程序的样板人', 'Template person of the unifier'), vitality: 100, stress: 12,
        skills: [{ id: 'blend', label: s('融入背景', 'Blend In'), value: 7 }, { id: 'replace', label: s('替代', 'Replace'), value: 6 }],
        detail: s('穿中性灰连体服、永远保持礼貌微笑的普通人；有自己的脸，不得继承玩家外形。', 'A generic person in a neutral gray jumpsuit with a permanent polite smile and a distinct non-player face.'),
        lore: s('每当系统无法决定该画谁，默认七号就会被放进去；它已经替代过太多人。', 'Whenever the system cannot decide whom to draw, Default Seven is inserted. It has replaced too many people.'),
        initialStatus: 'known',
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
        id: 'latent-zero', label: s('潜层 · 零号平原', 'Latent Layer · Zero Plain'), connectedTo: s('未完成的雨城', 'Unfinished Rain City'),
        detail: s('黑色玻璃平原、白色地平线、红色游标丝和悬浮未完成画框。', 'A black-glass plain, white horizon, red cursor filament, and hovering unfinished frames.'),
        lore: s('所有画面在被决定以前停留的混沌夹层，也是唯一能够稳定返回的地方。', 'The chaotic interval where pictures wait before being decided, and the only place that can always be found again.'),
        facts: [s('潜层会记住带回来的东西', 'The Latent Layer remembers what returns'), s('画框通往不同图片世界', 'Frames open into different picture worlds')],
      },
      {
        id: 'six-frames', label: s('六个开放画框', 'Six Open Frames'), connectedTo: s('潜层 · 零号平原', 'Latent Layer · Zero Plain'),
        detail: s('失重城、自动补全王国、周一办公室、倒置博物馆、儿童画海岸与退稿荒原。', 'Gravity City, Autocomplete Kingdom, Monday Office, the Inverted Museum, Child-Drawn Coast, and the Rejected Wastes.'),
        lore: s('每个世界都有自己的画风和荒诞规则，但都藏着一种现实坐标。', 'Each world has its own visual medium and absurd rule, and each hides one kind of Reality Coordinate.'),
        facts: [s('一次访问三至五步', 'Each visit lasts three to five decisions'), s('可以描述全新的世界', 'The player may describe a new world')],
      },
    ],
    initialInventory: [],
    demoTurns: buildDrawMeOutCampaign(locale),
  }
}

export const drawMeOut = build('zh')
export const drawMeOutEn = build('en')
