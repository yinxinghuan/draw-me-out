# 《请把我画出去》视觉 QA 报告

## Context

- 游戏/构建：本地 `draw-me-out`，2026-08-12 故事语言、画外之地与头像身份构图改造。
- 评审目标：确认普通玩家语言没有破坏 Civic 界面；验证“画外之地”不是具象地点；在用户头像可辨与空旷感之间取得平衡。
- 需求与视觉文档：`doc/requirements.md`、`doc/visual.md`。
- 视口：390×844、320×568、1366×768；平台内构图为主，另保留外部访客栏检查。
- 运行证据：`_qa/ui/platform-layout-*.png`、`_qa/ui/external-guest-entry-390x844.png`。
- 真实媒体服务样张：`latent-art-direction-sample.png` 至 `latent-art-direction-sample-v5.png`。

## Executive assessment

- 结论：源文件与构图方向通过；正式头像一致性仍需在带真实用户参考图的生产环境复验。
- 最强质量：黑色非空间已没有地面、地平线、透视或房间感；30–36% 全身人物兼顾身份可读性与大面积负空间。
- 说明：v5 使用无身份参考的通用人物，仅验证比例、姿态、背景与抽象痕迹，不能作为用户头像一致性的证据。
- P0/P1/P2：0 / 0 / 1。

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

## Final recommendation

- Final average：4.1。
- Categories below 3：无。
- Decision：故事和视觉规则可进入完整自动验证；发布后必须使用至少一个真人头像和一个覆盖式/非人头像复验完整身份，失败时不能以脸部相似判定通过。
