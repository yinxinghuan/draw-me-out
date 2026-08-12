# 条件情境字幕视觉 QA

## Context

- Game/build：《请把我画出去》，本地候选构建。
- Review target：Civic 决策态中央情境字幕。
- Viewports：390×844、320×568，platform-layout；沿用 `_qa/ui/external-guest-entry-390x844.png` 做 external-guest 扩展检查。
- Evidence：`_qa/ui/caption-visibility/`。

## Executive assessment

- Decision：Pass。
- P0 / P1 / P2：0 / 0 / 0（首轮 P1 2 项均已修复）。
- 首轮问题：内部 `image_subject:"player"` 泄漏为可见正文；“请做出选择 / 接下来你要怎么做”重复下方选项并长期占据画面。

## Scorecard

| Category | Score |
|---|---:|
| Hierarchy | 5 |
| Coherence | 5 |
| Readability | 5 |
| Game feel | 4 |
| Asset quality | 4 |
| Responsive UX | 5 |
| Polish | 5 |

平均 `4.7 / 5`，无低于 3 的类别。

## Fix and verification

- 协议解析清除完整或缺括号的 `image_prompt / image_subject`，存档恢复同时清理旧残留。
- 情境字幕仅在存在新局面、必要后果或人物对白时渲染；泛化选择提示不生成卡片。
- 普通叙事小标题使用“此刻”，角色对白继续显示角色名。
- 无字幕状态仍保留清楚、可点的横向选择；有意义字幕状态与下方选项描述同一局面。
- 两个状态在 390×844 与 320×568 均无页面横向溢出。

## Evidence

- `01-caption-absent-platform-layout-390x844.png`
- `01-caption-absent-platform-layout-320x568.png`
- `02-context-caption-platform-layout-390x844.png`
- `02-context-caption-platform-layout-320x568.png`

Foundation audit：无功能 Emoji；现有自绘 SVG 家族未变；选择与输入触控范围未变；字幕缺席不影响键盘、触控或自由输入；信息不依赖颜色。
