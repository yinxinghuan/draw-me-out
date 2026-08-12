# 《请把我画出去》视觉 QA 报告

## Context

- 游戏/构建：本地 `draw-me-out`，2026-08-13 全局阅读门禁、决策上下文与开场场景快照改造。
- 评审目标：确认快速点击不能跳过结果；小残介绍与三个入口在同屏形成因果；雨城不会被画外深黑规则污染；完整四世界战役可恢复并进入终局。
- 需求与视觉文档：`doc/requirements.md`、`doc/visual.md`。
- 视口：390×844、320×568、1366×768；平台内构图为主，另保留外部访客栏检查。
- 运行证据：`_qa/ui/campaign-director/01-opening-result-platform-layout-*.png`、`02-remnant-decision-platform-layout-*.png`、`03-museum-entry-platform-layout-*.png`、`04-museum-return-platform-layout-*.png`、`05-four-clues-platform-layout-*.png`、`06-finale-ready-platform-layout-*.png`。
- 真实媒体服务样张：`latent-art-direction-sample.png` 至 `latent-art-direction-sample-v5.png`。

## Executive assessment

- 结论：390×844 与 320×568 均从开场连续完成 23 个受管回合、四个世界、四次重载和终局闸门；每个多页结果在末页前均未暴露主 CTA，小残决策态同时出现因果短句与可识别入口。正式头像成图的一致性仍需在线上真实媒体结果中复验。
- 最强质量：黑色非空间已没有地面、地平线、透视或房间感；30–36% 全身人物兼顾身份可读性与大面积负空间。
- 说明：v5 使用无身份参考的通用人物，仅验证比例、姿态、背景与抽象痕迹，不能作为用户头像一致性的证据。
- P0/P1/P2：0 / 0 / 1。快速点击回归曾发现跨幕复用末页状态的 P1 竞态，已用 block-id 独立阅读器修复，并在两种视口完整复跑通过。

## Scorecard

| Category | Score 1–5 | Evidence | Required action |
|---|---:|---|---|
| Hierarchy | 5 | 390 决策态与结果态 | 保持阶段互斥 |
| Coherence | 4 | 固定 UI、视觉文档与 v5 | 生产环境检查真实头像完整身份 |
| Readability | 4 | 320×568 与 390×844 | 继续使用语义分页，不截断 |
| Game feel | 4 | 完整试玩切片自动检查 | 保持点击即提交与结果确认节奏 |
| Asset quality | 4 | v5 真实媒体样张 | 线上复验遮挡物、服装和非人头像 |
| Responsive UX | 4 | 320、390、桌面平台内截图 | 无需修复 |
| Polish | 4 | SVG 控件、状态、按钮、分页 | 无需修复 |

## Finding

- Severity：P2。
- Screen/location：画外之地生产头像参考。
- Observation：v5 已证明 34% 全身比例不会破坏空旷感，但它没有使用用户头像；无法从该样张证明床单鬼魂、面具、非人身体或特殊服装能被完整保留。
- Impact：如果模型只借用脸部或重新发明身体，角色身份仍会中断。
- Concrete fix：统一场景方向、固定世界规则与 AI 语言合同均明确“完整身份参考”，包含轮廓、形态、覆盖物、服装、颜色、纹样和配件；禁止只复制脸、补造肢体或职业服装。画外人物统一为 30–36% 全身中远景。
- Verification evidence：v5 通过背景、比例、姿态与负空间检查；真实头像身份列为发布后的专门验证项，不用无参考样张冒充通过。

## Foundation audit

- Functional emoji icons：严格扫描无发现。
- Icon-family consistency：使用项目内统一自绘 SVG 家族。
- Touch targets：行动与顶部控件维持至少 44×44 CSS px。
- Contrast and color independence：行动按钮同时使用蓝边、实阴影和编号；状态不只依赖颜色。
- Focus and input behavior：可见焦点、按下态、点击立即提交与重复提交锁定均保留。
- State coverage：决策态与结果态已复拍；完整试玩切片覆盖章节收尾与存档写入。
- Localization and overflow：中文试玩选项限制为不超过 18 字；320×568 无不可达控件。

## Art-direction audit

- Palette and typography：固定墨黑、骨白、校准蓝与信号红不变；画外背景改为平坦近黑/深炭色，与骨白 UI 拉开差异。
- Composition：图片世界保持单动作；画外之地玩家全身 30–36%，侧向失重，深黑负空间仍占主体。
- Identity：头像参考拥有脸部、轮廓、形态、遮挡物、服装、颜色、纹样与配件；提示词不得覆盖这些特征。
- Space cues：禁止地面、地平线、透视、建筑、暗角、渐变、下半部明暗变化、投影和消失点。
- Feature traces：只允许 1–4 组互不相容的发光痕迹，边界不规则消散，禁止矩形贴图、画框和入口。
- Near-white：只用于明确的抹平者攻击，让危险与正常暗场形成叙事反差。

## Iteration evidence

- v1：近白背景出现下半部渐变，像地面；人物过小。
- v2：地面感改善，但痕迹接近矩形贴图。
- v3：人物站立并带接触投影。
- v4：侧向失重成立，但近白背景与 UI 接近，人物仍过小。
- v5：平坦深黑非空间、无地面/投影，人物约 34% 全身，身份细节在构图层面可读，同时保留大面积负空间。作为当前 matched recheck。
- 全局 recheck：结果页脚本先断言“继续阅读”与主 CTA 不得同时可用，再逐页读完；23 回合、4 次刷新、四条稳定线索与 23 份权威视觉快照在 390×844 和 320×568 均通过。小残选择态的“眼前”短句明确说明三道裂缝、无法结束的画和回家线索，入口按钮只写玩家已认识的世界入口，不再提前出现送货员、国王或会议任务。

## Final recommendation

- Final average：4.1。
- Categories below 3：无。
- Decision：故事和视觉规则可进入完整自动验证；发布后必须使用至少一个真人头像和一个覆盖式/非人头像复验完整身份，失败时不能以脸部相似判定通过。
