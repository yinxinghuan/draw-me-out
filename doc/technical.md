# 《请把我画出去》技术文档

## 1. 技术栈

- 前端：React 18 + TypeScript，使用 Vite 5 构建，`base: './'`，可部署在任意子路径。
- 样式：Less；默认界面为 Cinematic Civic 竖版舞台，`?ui=living` 可切换到保留的对话流分支用于对照。
- 状态：纯 TypeScript reducer、协议解析器、战役导演与领域规则裁判。四个主线世界、四条线索、终局揭示和永久代价由本地原子事务更新；开放行动才交给 AI，因此必要因果不依赖模型是否遵守协议。
- 叙事：演示模式使用本地双语剧情切片；正式 AlterU 模式仅为主线外的开放行动调用 `https://chat.aiwaves.tech/aigram/api/game-chat`，每次附带压缩后的世界合同和持久状态。
- 图片：统一调用 AlterU Media Service `https://game.aiwaves.tech/alteru-media/api/v1/images/generations`。首页使用独立 1024×576 无人物建立镜头；运行时剧情场景为 512×640。玩家主导画面使用 `edit` + 原始公开头像 URL；环境、物品和 NPC 主导画面使用无参考的 `text`。
- 视频：客户端已接入统一媒体服务的 5 秒、9:16 任务合同，但本游戏当前关闭自动视频；现有 4:5 剧情图不能作为合规的 9:16 首尾帧直接提交。后续只有准备独立 9:16 里程碑帧后才启用。
- 存档：游戏永久 UUID 为 `c699e284-58a9-43ca-8edf-223cd69588c9`。平台内同步 AIGram 游戏存档，平台外使用 localStorage 回退。
- 音频：Web Audio 合成器；第一次用户交互后启动，根据材质、BPM、三项状态和事件类型生成环境、选择、危险与奖励反馈。
- 国际化：轻量 `zh/en` 双语，优先显式 `?lang=`、已保存语言和 `game_locale`，再按浏览器系统语言判断。

## 2. 目录结构

- `src/story/cartridges/drawMeOut.ts`：中英文世界合同、数值、章节、危险导演、结局能力、角色、地图、视觉与音频方向。
- `src/story/cartridges/drawMeOutCampaign.ts`：开场五幕与第一次图片世界往返的本地可玩切片。
- `src/story/engine/campaignDirector.ts`：四世界主线与终局闸门；把当前战役阶段、具体行动、可见后果、唯一线索和下一组合法行动组织成可重载的确定性回合。
- `src/story/engine/executeTurn.ts`：与 React、DOM、媒体和存储解耦的服务端普通回合权威边界，保持 campaign → domain → model 的优先级。
- `src/story/engine/reducer.ts`：唯一状态更新入口；维护物品、伙伴、地图、关系、事实、场景图和结局状态；`ensureEndingImageBlock` 将终局提示幂等地转换为一张可恢复的结局图片块。
- `src/story/engine/domainRules.ts`：自由文本意图匹配、前置条件裁判、原子效果、固定后续选择、派生线索事实与道具次数显示。
- `src/story/engine/protocol.ts`：解析 `[choices]`、`[widget]`、`[inventory]`、`[fact]`、`[party_change]` 等结构化命令，并清除括号完整或缺失的 `image_prompt / image_subject` 传输元数据。
- `src/story/engine/stageNarrative.ts`：从当前场景选择真正有信息量的情境字幕；过滤内部协议和“请做出选择 / What will you do next”类冗余元提示。
- `src/story/engine/worldContext.ts`：把固定规则、章节目标、持久事实和近期故事压缩为 AI 上下文。
- `src/story/engine/dangerDirector.ts`：2–4 安全回合、2 回合冷却、危险强度、检定和兜底代价。
- `src/story/engine/imageDirector.ts`：视觉节拍调度与权威场景快照提示；只从最终地点、动作、后果、主体、道具、环境、光线和连续性约束构造主线画面，不采信 AI 自述的 `image_prompt`。
- `src/story/engine/imageIdentity.ts`：`SUBJECT A` 完整视觉身份合同与 2400 字符提示上限。
- `src/story/engine/endingDirector.ts`、`endingAdapter.ts`：冻结终局快照、计算可用能力、约束 AI 生成兼容尾声。
- `src/story/adapters/`：本地演示、AIGram 正式叙事，以及兼容旧 `chat_id` 入口的适配器；两种正式入口都只调用稳定的 AlterU game-chat 网关，不依赖模型提供商或测试机地址。AIGram 适配器对本游戏额外注入“普通玩家语言合同”，将内部 ID 与玩家可见词汇隔离。
- `src/shared/runtime/media.ts`：统一媒体服务 v1 客户端、尺寸拟合、幂等请求、任务轮询与结构化错误。
- `src/shared/runtime/useGenImage.ts`：图片请求状态、重复请求 ID 管理、60 秒任务上限和独立媒体服务内的超时恢复；不跨服务回退。
- `src/shared/runtime/useGenVideo.ts`：统一媒体服务 9:16、5 秒视频任务客户端；本游戏默认不启用。
- `src/shared/save/useGameSave.ts`：AIGram 与 localStorage 双路径存档。
- `public/alteru-storage-scope.js`、`src/alteru-storage-scope.d.ts`：按当前部署 UUID 隔离浏览器存储，防止同域游戏和 Remix 互相读取本地状态。
- `worker/index.js`：自托管部署的最小健康检查入口；不保存剧情、身份或媒体数据，也不创建第二套后端状态。
- `src/shared/runtime/game-id.ts`：从 Remix 后的当前 UUID 生成同源 `/<GAME_ID>` API base；当前只为可选健康检查保留合同，不参与平台存档、叙事或媒体请求。
- `src/story/StoryShell.tsx`：入口、恢复存档、三阶段信息顺序、Civic 舞台、抽屉、分页、选项和输入；结局态从持久图片块渲染 4:5 主视觉、加载/失败重试和分层尾声。
- `src/story/story.less`：Civic/Living 两种表现层、响应式布局、状态和动效；结局页的终局图、显影底板、52 px 文末 CTA 与 20 px 箭头均在此约束。
- `src/story/audio/`：合成音乐与音效。
- `src/story/img/worlds/`：运行时方形封面与独立 16:9 无人物入口建立镜头。
- `public/poster.png`：正式 1024×1024 英文上架海报；`poster-source.png` 保留平台 transit 原始输出，`poster-source-v1.webp` 仅归档被替换的第一版。
- `doc/requirements.md`、`doc/visual.md`、`doc/world-brief.json`：玩法、视觉和机器可校验世界蓝图。
- `_qa/`：协议、危险、结局、普通玩家语言、领域规则恶意输出、开场分支、逐回合重载的四世界战役测试，以及 390×844 / 320×568 完整浏览器游玩证据；`generate-ending-image-sample.ts` 使用正式媒体服务复验终局 `edit` 请求。

## 3. 核心模块

`executeStoryTurn()` 把 `resolveCampaignAction → resolveDomainAction → model` 的原优先级和最终 reducer 提交抽成 Story Session 可调用的纯边界；受管 campaign/domain 行动仍完全绕过模型。`_qa/server-turn-pipeline.ts` 验证开场领域事务、输入不变性和自由模型提议。电影式 `decision → resolving → result → decision` 仍由 `StoryShell.tsx` 呈现，终局快照/生成仍是独立第二阶段事务。当前仅为源码 canary，正式写入仍等待后端可验证的 AlterU 玩家身份。

### 状态与叙事循环

`useStoryEngine` 持有当前存档。入口由纯函数 `enterStory` 把点击直接结算为第一场景与第一条事实；后续动作先尝试领域裁判，只有未命中的自由动作才交给适配器，再通过 `parseStoryProtocol` 与 `applyParsedScene` 原子更新状态。界面阶段固定为 `decision → resolving → result → decision`：提交后立即隐藏旧问题与选项，文字结果不等待图片。所有多页结果都必须在结果卡内向前读到最后一页，主 CTA 才能进入下一组选择；每幕结果阅读器用 block id 独立挂载，避免上一幕的末页状态污染下一幕。进入选择态后，存档中的 `decisionContext` 以“眼前”短字幕保留地点、人物/物体和共同问题，不能只剩无前因的按钮。旧存档若没有该字段，规范化时以当前目标补齐。旧存档中遗留的图片协议文本会在规范化时清除。生成选项先经过可见人物、地点、物品和目标接地检查；若全部失效或响应没有形成可用选项，平静态不再补通用菜单，而是保留自由输入。危险态只恢复绑定当前威胁的确定性应对。

世界状态包括三项数值、自定义事实、地图、行囊、固定/生成角色、队伍 ID、关系事件、危险周期、图片块和结局快照。角色 ID、物品 ID 与地图节点跨语言共用；中英文仅改变可见文案。

关键剧情分成两层：入口与通用世界规则继续由 `drawMeOut.ts` 的 `domainRules` 声明；四世界主线则由 `campaignDirector.ts` 根据 `campaign.currentEpisode / phase / completedEpisodes` 裁判。每个世界固定经历“进入并看见矛盾 → 检查具体问题 → 选择解法 → 在原世界取得唯一线索 → 主动返回画外之地 → 确认锚位后再选门”。`resolution` 只提交线索与原世界线索镜，并把阶段切到 `return`；`return` 再原子提交 `latent-zero` 地图、返回次数、固定中转镜和下一组入口，因此世界之间不存在直接跳切。任一受管行动都把双语正文、数值/事实/地图/物品效果、视觉节拍和合法后续选择一次提交，完全不调用模型，也不叠加独立危险事件。模型遗漏命令、重复奖励或把后果写轻，都不能改写主线权威状态。

`campaign.hubReturnCount` 记录已经在中转站可见确认的线索数，`lastCompletedEpisode` 记录最近离开的世界。旧存档若已经有线索但没有这两个字段，会在仍停留 hub/旧 return 状态时回退到一次安全的 `return` 阶段：保留物品、事实和篇章完成度，只补演最近一次画外之地落位镜；已经进入终局调查或正在未完成世界中的存档不倒退。

四条线索齐全后，战役导演依次揭示“默认七号/抹平者来源”和“出口会抹除仍在生长的世界”两项事实，玩家确认后才把 `finale.status` 置为 `ready` 并冻结结局入口。这个闸门替代了“场景数够了就自动结束”的脆弱推断。完整机械测试在每个回合后序列化并重新加载存档，确保跨刷新仍能从唯一阶段继续。

三项状态支持 `revealedByFact`：首次触碰后显示余力，玩家造成暴露后显示被发现，身份受损或取得撤销键后显示我还是我。场景 3 之后为旧存档显示全部状态，避免老进度缺少新揭示事实时永远看不到 HUD。

撤销键只存一个物品与 `undo-key-uses=0..3`；“剩余次数”由 `3 - uses` 重建。付费撤销的选项由当前仍存在、且尚未支付的真实记忆动态生成，不再显示无效代价，也不会因为支付一次代价错误结束整个会话。`home-clue-count`、`first-coordinate-earned` 与 `coordinates-four` 只从四个稳定线索物品 ID 派生，不再让物品和事实各写一遍。旧存档若把撤销键保存为数量 3，会规范化为数量 1；旧的无 metric id “剩余次数”条目会按本地化标签认领稳定 id，避免重复显示。

故事内部仍可使用 `coordinate-*`、`optimizer-*`、`residual` 等稳定协议 ID，保证旧存档和结局条件不失效；这些 ID 不得直接出现在玩家可见文字。可见映射固定为“回家线索、抹平者、小残、我还是我、余力、被发现”。每个场景最多引入一个新概念，三个行动必须对应当前最后一个问题，并写成具体动词加眼前对象。

角色定义可用 `hiddenUntilIntroduced` 声明“剧本固定、玩家尚未认识”。这类角色不会进入初始存档和人物面板；收到可见的 `character_update` / `party_change` 后才创建。旧存档规范化时，也会删除从旧版本错误预载、但从未在正文、队伍或关系记录中真正出现的隐藏角色。AI 导演与本地切片都执行“外形—名字来源—当前关系—互动选项”的首次登场顺序。

### 屏幕与响应式

默认 Civic 页面以 `100dvh` 组织固定状态区、可向上延伸的 4:5 舞台、内容自适应结果层和横向选项。首次入口单独使用 16:9 建立镜头，避免把竖版剧情图硬裁成宽幅。文字按语义分页，不使用省略号截断。320×568 的短屏保持画面、当前一句、至少一项选择和自由输入可达；桌面端限制舞台宽度并保持竖版构图，而不是拉伸到全屏。

### 玩家视觉身份与生图

`usePlayerProfile` 等待当前 AIGram 用户资料；`useAvatarImageReference` 直接保留原始公开 HTTPS 头像，不做方形裁切上传。产品回退是项目发布者随源码维护并打包在 `public/alteru-default-avatar.jpg` 的默认头像，不臆造平台身份字段；它会被绝对化为当前部署的 HTTPS URL。任何标记 `playerVisible=true` 的图片在头像引用尚不可用时留在队列中，禁止先无参考生成随机人物。开场前两张玩家主导图仍支持慢速资料等待和旧错误图片的有界修复。

旧生产存档不会被迫重开。提示版本 11 保留开场 `image-1` 至 `image-4` 的既有领域规则修复，并额外检查玩家当前可见的后半段权威快照：旧快照先升级为镜头方案 v2，重新判定动作拥有者、主体、道具与镜位，再清除该当前图 URL 并排入重绘队列。迁移只失效当前错误图片，不批量重画历史，也不改变场景号、数值、物品、伙伴、选择和战役阶段。

主线每个关键相变都由 `StoryVisualBeat` 保存一份独立视觉快照。开场也不再例外：雨滴、换脸路人、街边白边、远门、门槛坠落、无边处与小残登场各有地点专属快照。通用美术方向只定义镜头清晰度和身份连续性；雨城的街道/天气与无边处的深黑/失重规则只能由当前快照加入，因此“摸白边”仍明确保留雨城，“取撤销键”则用同一画面展示雨城在门后折叠、深黑在前方开始的过渡。图片导演只读取最终快照，不再把整段叙事交给生图模型自行猜测“要画哪一刻”；提示词前部固定写入当前地点与动作、镜位、全局跨幕排除项，并在非雨城镜头显式禁止雨、水滴、湿街和开场门框。图片块同时保存 `visualSnapshot`、`visualPhase`、`planVersion` 与 `camera`，便于复验某张图是否确实对应当时的权威状态。

`StoryShell` 解析当前图片与上一张 ready 图片的 `visualSnapshot.locationId`。只有两者相同才允许把上一镜降暗作为生成占位；跨世界、进入无边处或离开无边处时，立即切换到不含具体场景语义的 CSS 显影底板。这一层与提示词排除项共同防止“新文字已经进入博物馆，画面仍是雨街水滴”的分裂。

图片导演仅在玩家是当前主动作的主要可见主体时附带头像参考。身份提示位于场景提示最前，要求完整保存头像中可见的轮廓、形态/物种、比例、材质、覆盖物、面部可见性、服装、颜色、纹样与配件；头像未显示的脸、皮肤、头发和肢体不得被补画。小残、默认七号、本地人物、动物、反射和道具都有排除合同，不能继承玩家身份。

画外之地遵守非空间视觉合同：底层概念是程序可读、人类不可直接感知的高维表示；画面只表现主角感知失败后的平坦深黑无边处和 1–4 组互不相容的发光痕迹。所有相关提示必须明确无地面、无地平线、无透视、无建筑、无可读距离、无渐变/暗角/投影，并让玩家全身占画面高度 30–36%。受控轮廓光需保留头像中的完整轮廓、形态、覆盖物、服装、颜色、纹样与配件；禁止大特写、过小符号化人物、代码、矩阵、神经网络图和数据流。近白场只允许用于明确的抹平者攻击。

场景图队列优先生成玩家当前看到的最新场景；较早的未完成图保留在后台，当前图完成后再补齐。页面刷新、WebView 被系统回收或存档恢复时，失去原浏览器请求的 `generating` 图会自动恢复为 `queued`，不会永久停在生成中。单次任务以 60 秒为上限；超时后显示明确重试状态，同时保留相同幂等请求 ID，让用户重试时优先找回原任务，而不是重复生成。最终失败时保留上一张图，故事仍可继续。物品在写入行囊后独立后台显影，图片失败不会撤销物品状态。

结局图复用同一队列与完整身份合同。结局文本提交时，`ensureEndingImageBlock` 用稳定 `ending.id` 创建唯一 `purpose=finale` 图片块并标记玩家为主动作主体；重复规范化不会复制。旧存档已经有完整结局但没有该块时会补排一次；旧版本结局图只在提示版本落后时重新排队。结局图片失败只改变图片块状态，文字结局、得失清单和“继续尾声”始终可用；显式重试仍遵守媒体客户端的请求 ID 与结构化错误规则。

### 危险、音频与结局

危险导演在连续 2–4 个安全回合后安排警告/对抗，并在处理后冷却 2 回合。战斗只偶尔出现，主要用世界规则、交涉和代价解决；兜底后果为“被发现” +14，而非死亡删档。

音频根据画外主题生成低频脉冲、倒放纸笔质感和不同事件的短音；状态张力实时改变密度。AudioContext 只在用户交互后恢复，静音与音频失败不影响操作。

主线终局由战役闸门明确开放；旧版结局导演仍兼容自由叙事存档和 8 个结局锚点。它冻结快照后计算相容能力，再让 AI 生成具体人物与地区尾声；输出必须包含不可逆代价、保留/失去/未解决事项和英文 `finalImagePrompt`，且不能引入快照之外的关键物品或伙伴。界面先显示终局图与标题，再显示 4–6 个场景、三栏得失和人物/地区去向；文末按钮不使用 sticky/fixed，因此不会中途遮住内容。

### 存档与恢复

平台内通过 session UUID 读写 AIGram 游戏存档；浏览器直开使用 `stateful-story-draw-me-out-save` 与归档键回退，所有浏览器键在真实存储中自动加上 `alteru:<当前部署 UUID>:` 前缀。有进度再次进入时只出现一次“继续游戏 / 重新开始”；继续直接进入当前场景，重新开始二次确认并清除本世界存档。

## 4. 扩展点

- 调整四世界主线顺序、每阶段选择、结果、线索、中转站锚位或终局闸门：编辑 `src/story/engine/campaignDirector.ts`；保持 `resolution → return → hub/finale` 三段状态合同，并运行 `npm run test:campaign-director` 与 `_qa/playthrough.mjs`（Playwright 需要 Node.js 20+）。
- 调整通用世界规则、三项数值、危险频率、章节和结局能力：编辑 `src/story/cartridges/drawMeOut.ts`。
- 调整入口动作、方法代价、稀缺资源、路线锁、一次性奖励、撤销代价或派生里程碑：优先编辑 `drawMeOut.ts` 的 `domainRules`，保持中英文 stable id 相同，并运行 `npm run test:opening`、`npm run test:domain`、`npm run test:campaign` 与浏览器脚本；只有 schema 无法表达新机制时才改 `engine/domainRules.ts`。
- 增加或改写本地试玩分支：编辑 `src/story/cartridges/drawMeOutCampaign.ts`；每个选择标签应能匹配唯一后续结果。
- 修改玩家可见叙事词汇时，同时更新 `src/story/adapters/aigram.ts` 的本游戏语言合同，并运行 `npm run test:plain-language`；测试会拦截术语泄漏、过长中文选项、缺失选择和旧式画外空间构图。
- 增加图片世界：先在 `campaignDirector.ts` 定义稳定矛盾、四阶段事务和权威视觉快照，再在 cartridge 补地图与世界合同；图片提示只能描述当前事务提交后的状态。
- 调整头像身份合同或主动作判断：编辑 `src/story/engine/imageIdentity.ts`、`imageDirector.ts` 和 cartridge 的 `playerImageRole/playerImageExclusions`，并重新运行普通头像与无脸非人测试图验证。
- 调整图片尺寸、频率、队列优先级或启用里程碑视频：修改 cartridge 的 `imageDirector/mediaDirector` 与 `useStoryEngine.ts`；队列改动必须运行 `npm run test:image-queue`。视频启用前必须提供真实 9:16 首尾帧、5 秒动作和声音提示，不能拉伸 4:5 图片。
- 调整结局图提示、迁移版本或结局页层级：分别修改 `endingAdapter.ts` / cartridge 的 `finalImagePrompt`、`reducer.ts` 的 `ENDING_IMAGE_PROMPT_VERSION`、`StoryShell.tsx` 与 `story.less`；运行 `npm run test:ending`、双尺寸 `_qa/playthrough.mjs` 和按需执行 `npm run qa:ending-media`。
- 改 UI 排序、阶段或抽屉：编辑 `StoryShell.tsx`；改字幕价值判断编辑 `engine/stageNarrative.ts` 并运行 `npm run test:stage-narrative`；改视觉 token、短屏高度、按钮和分页行为编辑 `story.less`。
- 改文字、语言检测和系统提示：编辑 `src/story/i18n.ts`；剧情双语文案仍放在 cartridge/campaign。
- 改音色、BPM、张力权重：先修改 cartridge 的 `audioTheme`，需要新合成手法时再改 `src/story/audio/`。
- 改媒体或存档后端：只修改 `src/shared/runtime/media.ts` 或 `src/shared/save/useGameSave.ts` 的稳定平台合同；游戏代码中不得出现模型提供商地址、密钥或私有部署逻辑。
- 更换正式海报：同名覆盖 `public/poster.png`，同时保留平台 transit 原始输出和请求记录；海报只允许英文且需检查 1024 原图与 160 缩略图。当前采用请求 `be8586a7-2333-4e68-a611-5a547de686a1`，原始 URL 为 `https://cdn.aiwaves.tech/prod/telegram/avatar/643177116/1786472139978696.png`。

## 行动权威影子审计（2026-08-20）

`engine/authorityShadow.ts` 只观察当前阶段已经显示的选择，以现有确定性 `domainRules` 分类 `accepted / rejected / open` 并报告非终局空 tray。它不改 cinematic 阶段流、不补选项、不写存档或上传数据；页面内存最多保留 100 条，`?authority_shadow=0` 可关闭。运行 `npm run test:authority-shadow` 验证选择零改写。
## 2026-08-23 混合音频升级

本作保留 `latent` 自适应合成材质，并叠加专属超现实主题与空间环境声。生成式长音频负责世界质感，Web Audio 继续负责精确交互、潜层张力和数值反馈；手势解锁、静音、页面可见性、一次性环境生命周期与失败降级由统一播放器管理。

普通选择只有一次轻确认；普通正文、常规数值和图片完成静音，检定、稀有物、关系、危险、抵达与结局节点才追加结果提示。Cartridge 合成反馈上限为 `0.045`，引擎再乘 `0.52`；`180 ms` 内合并，合成/录制短音效并发上限为 6/2。

## 2026-08-23 阅读优先 A/B 配乐

低密度潜层底乐 A 负责常规阅读，旧版较饱满主题作为 B，仅用于关键发现、关系转折和阶段小结。B 播放时 A 暂停、环境层继续，结束后 A 恢复；同源 B 冷却 180 秒，`latent` 程序化反馈仍独立响应即时状态。

## 2026-08-23 一次性环境与事件音

空间环境声每次地点访问只播一遍，真实切换画外世界或地点后才允许再播。短事件音按已提交阶段事件只播一次，静音、恢复、重渲染和读档不补播。`_qa/one-shot-audio.ts` 在保留 `latent` 特殊音色的前提下验证该合同。
