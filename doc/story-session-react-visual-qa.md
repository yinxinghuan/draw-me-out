# Story Session React canary 视觉 QA

## Context

- 游戏：`draw-me-out`，本机隔离 Story Session React canary。
- 目标：复用真实电影式 `StoryGameView`，检查入口权威事务、结果阶段、旧旅程目录、终局恢复和中英文移动端状态。
- 视觉依据：`doc/visual.md` 与 `ui-foundation`。
- 视口：中文 `390×844`，英文 `320×568`；外部访客层引用既有 `390×844` 发布检查。
- 证据：`_qa/ui/platform-layout-draw-me-out-*.png` 首轮与 `-recheck` 配对截图，以及 `_qa/ui/external-guest-entry-390x844.png`。

## Executive assessment

- 决策：Pass。
- P0 / P1 / P2：`0 / 0 / 0`。
- 最强项：旅程管理沿用原作“机器审查 / 骨白档案”视觉，没有把系统能力做成脱离世界的通用浮卡。
- 最大剩余风险：真实平台身份、真实设备与生产网络故障不属于本机 canary 证据。

## Scorecard

| Category | Score | Evidence | Required action |
|---|---:|---|---|
| Hierarchy | 5 | 画面、当前局面、行动、系统目录与危险重开层级明确 | 无 |
| Coherence | 5 | 墨色细框、骨白纸面、蓝色操作和信号红保持原作系统 | 无 |
| Readability | 4 | 中英文窄屏状态、旅程行与结局正文均可读 | 真实设备复验留到 staging |
| Game feel | 4 | pending、恢复、结果与下一步阶段可见 | 真实网络时延留到 staging |
| Asset quality | 5 | 沿用原作雨城/无边处与终局版式，无新增拼贴素材 | 无 |
| Responsive UX | 4 | 390×844 / 320×568 无页面横向溢出，目录行 52px | 真实设备复验留到 staging |
| Polish | 4 | focus、disabled、错误、loading、切换和重开均有合同 | 无 |

平均分 `4.43`，无低于 3 的类别。

## Foundation audit

- 功能 Emoji：无；严格审计零发现。
- 图标：继续使用现有统一 SVG 家族；没有新增功能图标。
- 触控目标：旅程行 `52px`，恢复和重开按钮至少 `44px`。
- 状态：当前旅程同时使用边界、文字和 disabled；故障有就地恢复按钮，不只依赖颜色。
- 本地化与溢出：中文 390、英文 320 均通过；系统指标允许自然换行，不遮挡切换或重开操作。
- 外部访客层：沿用真实入口既有 external-guest 截图；平台内截图没有为外部覆盖层预留空间。

## Iteration evidence

- 首轮：四张 platform-layout 截图经人工检查，无 P0/P1。
- 功能修复：首次浏览器链发现入口回合只提交领域 effects、没有原子提交 `entered=true`，界面会留在封面；现由服务端普通回合边界识别精确 `opening.entryAction` 并复用 `enterStory()` 一次提交。
- 匹配复验：修复后完整故障链运行两遍，同四状态保存首轮与 `-recheck`；布局和交互结论一致。
- 例外：本机 QA 入口不加载远程 guest shell，避免外部脚本污染确定性测试；外部状态引用项目既有真实入口证据。

## Final recommendation

本机 React canary 可通过并作为 `local-react-canary-passed` 证据；不得据此宣称生产身份、真实设备、真实模型/媒体或线上部署已完成。
