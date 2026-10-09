# デザイン仕様

Workの出力形式を再現した模擬データ。本物のWorkによる実行・競合調査ではありません。

```json
{
  "schemaVersion": 1,
  "direction": "静かな建築編集誌。余白、細い罫線、俯瞰した独自の庭図。SUIの植物球体表現を流用しない。",
  "colors": {
    "surface": "#f5f2e9",
    "ink": "#29372e",
    "accent": "#944f35",
    "line": "#c9c4b9"
  },
  "typography": "日本語の明朝系見出しとゴシック本文。本文16px以上、行高1.8、短い英字ラベル。OSフォールバック。",
  "layout": [
    "ブランドとナビ",
    "建築図面風hero",
    "コンセプト",
    "3つの提案例",
    "相談の流れ",
    "FAQ",
    "相談メモフォーム"
  ],
  "components": [
    "responsive navigation",
    "original courtyard SVG hero",
    "three concept project illustrations",
    "consultation process",
    "FAQ disclosure",
    "FAQ disclosure",
    "validated consultation memo form and text download"
  ],
  "responsive": {
    "mobile": 375,
    "tablet": 768,
    "desktop": 1440
  },
  "motion": {
    "description": "線とボタンの150〜250ms応答、控えめな入場。文字はJSなしでも表示。スクロールを妨げない。",
    "reducedMotion": "移動と入場アニメーションを停止し、本文と操作を即時表示する"
  }
}
```
