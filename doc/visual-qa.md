# 《请把我画出去》视觉 QA

## Context

- Review target：首次入口、Civic 固定画面舞台、决策与结果的先后展示、横向行动、短屏和桌面适配。
- Requirements / visual bible：`doc/requirements.md`、`doc/visual.md`。
- Viewports：390×844、320×568、1366×768；主验收为 platform-layout，另保留 external-guest 检查。
- Evidence：`_qa/ui/platform-layout-*.png`、`_qa/ui/external-guest-entry-390x844.png`。

## Executive assessment

- Decision：Pass。
- Strongest quality：黑框、骨白纸面与校准蓝形成稳定取景器；画面、此刻文字与行动按阶段接力，不再同时堆叠。
- Largest remaining risk：正式运行时生成图仍取决于媒体服务和用户头像质量，需要在线上以普通真人头像和完整遮脸非人头像各复验一次身份连续性。
- P0 / P1：0 / 0。

## Scorecard

| Category | Score | Evidence | Required action |
|---|---:|---|---|
| Hierarchy | 4.7 | 首页标题→宽幅建立镜头→一句目标→唯一主行动；游戏内画面→一句话→选择 | 后续世界不增加常驻解释卡 |
| Coherence | 4.6 | Civic 粗框、纸面、信号红游标与蓝色行动系统一致 | 新世界只改画面媒介，不改固定 UI 语法 |
| Readability | 4.5 | 结果与决策分态，长句按语义分页，320×568 可读可达 | 线上继续收紧 AI 单页字数 |
| Game feel | 4.4 | 选项立即锁定，结果先出现，图片后台显影，潜层有专属音色 | 真机复核静音切换和首触发音量 |
| Asset quality | 4.8 | 第二版正式海报以主角伸手逃离、破裂世界与红色束缚线形成单一冲突；1024 与 160 缩略图均无中文、伪文字和随机面孔 | 发布时同步覆盖游戏仓库与 games 海报 |
| Responsive UX | 4.7 | 390×844、320×568、1366×768 均可用；外部访客栏不反向改变平台内构图 | 平台真实容器再复验一次 |
| Polish | 4.6 | 可选项蓝边与实阴影、结果自适应高度、统一 SVG 控件 | 后续只为重大坐标奖励增加全屏反馈 |

Final average：4.60 / 5；无类别低于 4。

## Iteration findings and fixes

1. P1，入口素材比例错误：首版复用 4:5 剧情图，宽幅首页裁掉了悬停雨滴，第一眼只剩普通雨城。改为独立 1024×576 建立镜头，把雨滴、黄色出口和白色地平线锁在中央安全区；390×844 与 1366×768 复拍均完整可见。
2. P1，决策与行动结果同时罗列：改为 `decision → resolving → result → decision`，结果出现时隐藏旧问题和选项，玩家确认后才显示下一组行动。
3. P1，结果白卡固定高度产生大块留白：改为内容自适应，并只在有检定、物品或事实变化时渲染对应信息。
4. P1，窄屏文字被省略号截断：改为按完整句分页；翻页状态带页码，最后一页后才允许行动。
5. P2，选项可选性不明显：可选项使用校准蓝边框和同色 5px 实阴影，按下时位移并收短阴影；不可选项只保留灰边和原因。
6. P1，首次画面可能错误引用随机人物：入口建立镜头明确无人；首个玩家主导剧情图等待用户资料并使用完整头像身份合同生成。
7. P1，第一版海报缺少吸引力：三个等大的静态画框像素材陈列，残差过小，主角和逃离冲突均缺席。第二版改为无脸主角向屏幕外伸手，多个不同世界沿身体撕裂，红线形成反向拉力；160×160 下动作与标题仍清楚。

## Foundation and build gates

- UI foundation：PASS；无功能性 Emoji，统一 SVG 图标，触控目标不小于 44×44 CSS px。
- Responsive：PASS；platform-layout 已覆盖 390×844、320×568、1366×768；external-guest 仅验证访客栏覆盖后仍可开始。
- Narrative flow：PASS；自动流程完成一次潜层→图片世界→坐标→返回潜层的闭环，未出现选项消失或单一“继续”兜底。
- Media identity：PASS；媒体服务集成检查无 provider/model 直连，玩家参考仅在玩家拥有主动作时附带。
- Poster：PASS；第二版 1024×1024 与 160×160 人工检查为英文标题 `DRAW ME OUT`，无中文、伪中文和其他可读字符。

## Final recommendation

当前版本达到完整内容扩写的视觉基线。后续最重要的不是继续增加 UI，而是在线上真实头像条件下复验前两张玩家主导画面的完整视觉身份，并保持每个新图片世界只改变世界媒介，不改变当前动作与选择的因果次序。
