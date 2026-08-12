# 《请把我画出去》技术文档

## 1. 技术栈

- 前端：React 18 + TypeScript，使用 Vite 5 构建，`base: './'`，可部署在任意子路径。
- 样式：Less；默认界面为 Cinematic Civic 竖版舞台，`?ui=living` 可切换到保留的对话流分支用于对照。
- 状态：纯 TypeScript reducer、协议解析器与领域规则裁判。自由叙事仍可使用故事命令；命中 `domainRules` 的稀缺资源、一次性奖励、路线与永久代价由本地原子事务更新。
- 叙事：演示模式使用本地双语剧情切片；正式 AlterU 模式调用 `https://chat.aiwaves.tech/aigram/api/game-chat`，每次附带压缩后的世界合同和持久状态。
- 图片：统一调用 AlterU Media Service `https://game.aiwaves.tech/alteru-media/api/v1/images/generations`。首页使用独立 1024×576 无人物建立镜头；运行时剧情场景为 512×640。玩家主导画面使用 `edit` + 原始公开头像 URL；环境、物品和 NPC 主导画面使用无参考的 `text`。
- 视频：客户端已接入统一媒体服务的 5 秒、9:16 任务合同，但本游戏当前关闭自动视频；现有 4:5 剧情图不能作为合规的 9:16 首尾帧直接提交。后续只有准备独立 9:16 里程碑帧后才启用。
- 存档：游戏永久 UUID 为 `c699e284-58a9-43ca-8edf-223cd69588c9`。平台内同步 AIGram 游戏存档，平台外使用 localStorage 回退。
- 音频：Web Audio 合成器；第一次用户交互后启动，根据材质、BPM、三项状态和事件类型生成环境、选择、危险与奖励反馈。
- 国际化：轻量 `zh/en` 双语，优先显式 `?lang=`、已保存语言和 `game_locale`，再按浏览器系统语言判断。

## 2. 目录结构

- `src/story/cartridges/drawMeOut.ts`：中英文世界合同、数值、章节、危险导演、结局能力、角色、地图、视觉与音频方向。
- `src/story/cartridges/drawMeOutCampaign.ts`：开场五幕与第一次图片世界往返的本地可玩切片。
- `src/story/engine/reducer.ts`：唯一状态更新入口；维护物品、伙伴、地图、关系、事实、场景图和结局状态。
- `src/story/engine/domainRules.ts`：自由文本意图匹配、前置条件裁判、原子效果、固定后续选择、派生线索事实与道具次数显示。
- `src/story/engine/protocol.ts`：解析 `[choices]`、`[widget]`、`[inventory]`、`[fact]`、`[party_change]` 等结构化命令。
- `src/story/engine/worldContext.ts`：把固定规则、章节目标、持久事实和近期故事压缩为 AI 上下文。
- `src/story/engine/dangerDirector.ts`：2–4 安全回合、2 回合冷却、危险强度、检定和兜底代价。
- `src/story/engine/imageDirector.ts`：每步图片调度、当前事件提示、封面描述隔离与玩家是否拥有视觉主动作判断。
- `src/story/engine/imageIdentity.ts`：`SUBJECT A` 完整视觉身份合同与 2400 字符提示上限。
- `src/story/engine/endingDirector.ts`、`endingAdapter.ts`：冻结终局快照、计算可用能力、约束 AI 生成兼容尾声。
- `src/story/adapters/`：本地演示、AIGram 正式叙事，以及兼容旧 `chat_id` 入口的适配器；两种正式入口都只调用稳定的 AlterU game-chat 网关，不依赖模型提供商或测试机地址。AIGram 适配器对本游戏额外注入“普通玩家语言合同”，将内部 ID 与玩家可见词汇隔离。
- `src/shared/runtime/media.ts`：统一媒体服务 v1 客户端、尺寸拟合、幂等请求、任务轮询与结构化错误。
- `src/shared/runtime/useGenImage.ts`：图片请求状态、重复请求 ID 管理、60 秒任务上限和显式旧 transit 回退。
- `src/shared/runtime/useGenVideo.ts`：统一媒体服务 9:16、5 秒视频任务客户端；本游戏默认不启用。
- `src/shared/save/useGameSave.ts`：AIGram 与 localStorage 双路径存档。
- `public/alteru-storage-scope.js`、`src/alteru-storage-scope.d.ts`：按当前部署 UUID 隔离浏览器存储，防止同域游戏和 Remix 互相读取本地状态。
- `worker/index.js`：自托管部署的最小健康检查入口；不保存剧情、身份或媒体数据，也不创建第二套后端状态。
- `src/story/StoryShell.tsx`：入口、恢复存档、三阶段信息顺序、Civic 舞台、抽屉、分页、选项和输入。
- `src/story/story.less`：Civic/Living 两种表现层、响应式布局、状态和动效。
- `src/story/audio/`：合成音乐与音效。
- `src/story/img/worlds/`：运行时方形封面与独立 16:9 无人物入口建立镜头。
- `public/poster.png`：正式 1024×1024 英文上架海报；`poster-source.png` 保留平台 transit 原始输出，`poster-source-v1.webp` 仅归档被替换的第一版。
- `doc/requirements.md`、`doc/visual.md`、`doc/world-brief.json`：玩法、视觉和机器可校验世界蓝图。
- `_qa/`：协议、危险、结局、普通玩家语言、领域规则恶意输出测试与真实浏览器通关证据。

## 3. 核心模块

### 状态与叙事循环

`useStoryEngine` 持有当前存档，把玩家行动交给选定适配器，再通过 `parseStoryProtocol` 与 `applyParsedScene` 原子更新状态。界面阶段固定为 `decision → resolving → result → decision`：提交后立即隐藏旧问题与选项，文字结果不等待图片，结果确认后才出现下一组选择。解析异常时会恢复至少两个与当前叙述相关的行动，不能退化成单一“继续”。

世界状态包括三项数值、自定义事实、地图、行囊、固定/生成角色、队伍 ID、关系事件、危险周期、图片块和结局快照。角色 ID、物品 ID 与地图节点跨语言共用；中英文仅改变可见文案。

关键剧情动作在 `drawMeOut.ts` 的 `domainRules` 中声明稳定意图。当前覆盖撤销键唯一获取、进入无边处、小残首次登场并入队、三条首世界路线、三条首线索结算，以及免费/付费撤销，共 12 条规则。玩家行动先由 `resolveDomainAction` 裁判；若匹配，模型只负责可见叙述，模型输出里的数值、事实、物品、地图、伙伴、危险、目标、时间、章节结束和选择命令都会被丢弃。本地 resolution 一次写入全部效果与三条合法后续选择；任一前置条件失败时零效果并返回当前状态真正可行的恢复选择。未匹配的自由行动继续走原 AI 流程。

撤销键只存一个物品与 `undo-key-uses=0..3`；“剩余次数”由 `3 - uses` 重建。`home-clue-count`、`first-coordinate-earned` 与 `coordinates-four` 只从四个稳定线索物品 ID 派生，不再让物品和事实各写一遍。旧存档若把撤销键保存为数量 3，会规范化为数量 1；旧的无 metric id “剩余次数”条目会按本地化标签认领稳定 id，避免重复显示。

故事内部仍可使用 `coordinate-*`、`optimizer-*`、`residual` 等稳定协议 ID，保证旧存档和结局条件不失效；这些 ID 不得直接出现在玩家可见文字。可见映射固定为“回家线索、抹平者、小残、我还是我、余力、被发现”。每个场景最多引入一个新概念，三个行动必须对应当前最后一个问题，并写成具体动词加眼前对象。

角色定义可用 `hiddenUntilIntroduced` 声明“剧本固定、玩家尚未认识”。这类角色不会进入初始存档和人物面板；收到可见的 `character_update` / `party_change` 后才创建。旧存档规范化时，也会删除从旧版本错误预载、但从未在正文、队伍或关系记录中真正出现的隐藏角色。AI 导演与本地切片都执行“外形—名字来源—当前关系—互动选项”的首次登场顺序。

### 屏幕与响应式

默认 Civic 页面以 `100dvh` 组织固定状态区、可向上延伸的 4:5 舞台、内容自适应结果层和横向选项。首次入口单独使用 16:9 建立镜头，避免把竖版剧情图硬裁成宽幅。文字按语义分页，不使用省略号截断。320×568 的短屏保持画面、当前一句、至少一项选择和自由输入可达；桌面端限制舞台宽度并保持竖版构图，而不是拉伸到全屏。

### 玩家视觉身份与生图

`usePlayerProfile` 等待当前 AIGram 用户资料；`useAvatarImageReference` 直接保留原始公开 HTTPS 头像，不做方形裁切上传。开场前两张玩家主导图支持慢速资料等待和旧错误图片的有界修复。

图片导演仅在玩家是当前主动作的主要可见主体时附带头像参考。身份提示位于场景提示最前，要求完整保存头像中可见的轮廓、形态/物种、比例、材质、覆盖物、面部可见性、服装、颜色、纹样与配件；头像未显示的脸、皮肤、头发和肢体不得被补画。小残、默认七号、本地人物、动物、反射和道具都有排除合同，不能继承玩家身份。

画外之地遵守非空间视觉合同：底层概念是程序可读、人类不可直接感知的高维表示；画面只表现主角感知失败后的平坦深黑无边处和 1–4 组互不相容的发光痕迹。所有相关提示必须明确无地面、无地平线、无透视、无建筑、无可读距离、无渐变/暗角/投影，并让玩家全身占画面高度 30–36%。受控轮廓光需保留头像中的完整轮廓、形态、覆盖物、服装、颜色、纹样与配件；禁止大特写、过小符号化人物、代码、矩阵、神经网络图和数据流。近白场只允许用于明确的抹平者攻击。

场景图队列优先生成玩家当前看到的最新场景；较早的未完成图保留在后台，当前图完成后再补齐。页面刷新、WebView 被系统回收或存档恢复时，失去原浏览器请求的 `generating` 图会自动恢复为 `queued`，不会永久停在生成中。单次任务以 60 秒为上限；超时后显示明确重试状态，同时保留相同幂等请求 ID，让用户重试时优先找回原任务，而不是重复生成。最终失败时保留上一张图，故事仍可继续。物品在写入行囊后独立后台显影，图片失败不会撤销物品状态。

### 危险、音频与结局

危险导演在连续 2–4 个安全回合后安排警告/对抗，并在处理后冷却 2 回合。战斗只偶尔出现，主要用世界规则、交涉和代价解决；兜底后果为“被发现” +14，而非死亡删档。

音频根据画外主题生成低频脉冲、倒放纸笔质感和不同事件的短音；状态张力实时改变密度。AudioContext 只在用户交互后恢复，静音与音频失败不影响操作。

结局导演在四条回家线索、出口代价、抹平者源头和至少 18 场景满足后冻结快照。内部继续使用旧事实 ID 兼容存档。它先计算相容的结局能力，再让 AI 在 8 个结局锚点基础上生成具体人物与地区尾声；输出必须包含不可逆代价、保留/失去/未解决事项，且不能引入快照之外的关键物品或伙伴。

### 存档与恢复

平台内通过 session UUID 读写 AIGram 游戏存档；浏览器直开使用 `stateful-story-draw-me-out-save` 与归档键回退，所有浏览器键在真实存储中自动加上 `alteru:<当前部署 UUID>:` 前缀。有进度再次进入时只出现一次“继续游戏 / 重新开始”；继续直接进入当前场景，重新开始二次确认并清除本世界存档。

## 4. 扩展点

- 调整主线、世界规则、三项数值、危险频率、章节和结局能力：编辑 `src/story/cartridges/drawMeOut.ts`。
- 调整稀缺资源、路线锁、一次性奖励、撤销代价或派生里程碑：优先编辑 `drawMeOut.ts` 的 `domainRules`，保持中英文 stable id 相同，并运行 `npm run test:domain` 与 `_qa/playthrough.mjs`；只有 schema 无法表达新机制时才改 `engine/domainRules.ts`。
- 增加或改写本地试玩分支：编辑 `src/story/cartridges/drawMeOutCampaign.ts`；每个选择标签应能匹配唯一后续结果。
- 修改玩家可见叙事词汇时，同时更新 `src/story/adapters/aigram.ts` 的本游戏语言合同，并运行 `npm run test:plain-language`；测试会拦截术语泄漏、过长中文选项、缺失选择和旧式画外空间构图。
- 增加图片世界：在 cartridge 的章节/地图/生成规则中定义稳定矛盾，并为切片增加 3–5 个有后果的步骤；图片提示只描述当前事件。
- 调整头像身份合同或主动作判断：编辑 `src/story/engine/imageIdentity.ts`、`imageDirector.ts` 和 cartridge 的 `playerImageRole/playerImageExclusions`，并重新运行普通头像与无脸非人测试图验证。
- 调整图片尺寸、频率、队列优先级或启用里程碑视频：修改 cartridge 的 `imageDirector/mediaDirector` 与 `useStoryEngine.ts`；队列改动必须运行 `npm run test:image-queue`。视频启用前必须提供真实 9:16 首尾帧、5 秒动作和声音提示，不能拉伸 4:5 图片。
- 改 UI 排序、阶段或抽屉：编辑 `StoryShell.tsx`；改视觉 token、短屏高度、按钮和分页行为编辑 `story.less`。
- 改文字、语言检测和系统提示：编辑 `src/story/i18n.ts`；剧情双语文案仍放在 cartridge/campaign。
- 改音色、BPM、张力权重：先修改 cartridge 的 `audioTheme`，需要新合成手法时再改 `src/story/audio/`。
- 改媒体或存档后端：只修改 `src/shared/runtime/media.ts` 或 `src/shared/save/useGameSave.ts` 的稳定平台合同；游戏代码中不得出现模型提供商地址、密钥或私有部署逻辑。
- 更换正式海报：同名覆盖 `public/poster.png`，同时保留平台 transit 原始输出和请求记录；海报只允许英文且需检查 1024 原图与 160 缩略图。当前采用请求 `be8586a7-2333-4e68-a611-5a547de686a1`，原始 URL 为 `https://cdn.aiwaves.tech/prod/telegram/avatar/643177116/1786472139978696.png`。
