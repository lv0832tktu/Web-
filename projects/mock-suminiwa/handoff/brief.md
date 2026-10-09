# 制作要件

Workの出力形式を再現した模擬データ。本物のWorkによる実行・競合調査ではありません。

```json
{
  "schemaVersion": 1,
  "project": {
    "slug": "mock-suminiwa",
    "title": "澄庭 SUMINIWA 模擬制作",
    "industry": "architecture"
  },
  "audience": "戸建ての中庭・庭の設計を検討する30〜50代",
  "objectives": [
    "提案の方向性を伝え相談内容の整理を支援する"
  ],
  "deliverables": [
    "日本語レスポンシブLP",
    "編集可能なHTML CSS JS SVG",
    "ローカル保存できる相談メモ",
    "検証結果と素材ライセンス"
  ],
  "constraints": [
    "架空案件と明記する",
    "料金・実績・口コミを捏造しない",
    "フォームは外部送信せず端末保存のみ",
    "外部公開は人の承認後"
  ],
  "assets": [
    "オリジナルSVGによる中庭と3つの提案例",
    "OS提供の日本語フォント"
  ],
  "requirements": [
    {
      "id": "R01",
      "description": "日本語のブランド固有LPと3つの独自イラスト",
      "acceptance": "h1、concept、3件の提案例が存在する",
      "verification": "Playwright heading and project cards; visual review"
    },
    {
      "id": "R02",
      "description": "メニューと相談CTAのキーボード導線",
      "acceptance": "Escapeで閉じてフォーカス復帰、CTAで相談欄へ移動",
      "verification": "Playwright keyboard and CTA"
    },
    {
      "id": "R03",
      "description": "入力検証と相談メモのローカル保存",
      "acceptance": "必須・メール不正を拒否、入力内容のテキストを保存、外部送信なし",
      "verification": "Playwright invalid and valid form download; no network submission"
    },
    {
      "id": "R04",
      "description": "レスポンシブと動きの抑制",
      "acceptance": "375/768/1440pxで横溢れなし、reduced-motionで読める",
      "verification": "Playwright widths and reduced motion; axe and visual"
    },
    {
      "id": "R05",
      "description": "素材権利と納品準備",
      "acceptance": "独自SVGとライセンス、動く静的サイト、検証報告をまとめる",
      "verification": "production verify/package, file manifest, human review"
    }
  ]
}
```
