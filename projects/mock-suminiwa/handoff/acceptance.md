# 受入条件

Workの出力形式を再現した模擬データ。本物のWorkによる実行・競合調査ではありません。

```json
{
  "schemaVersion": 1,
  "criteria": [
    {
      "id": "A01",
      "requirementId": "R01",
      "description": "h1、concept、3件の提案例が存在する",
      "verification": "Playwright heading and project cards; visual review"
    },
    {
      "id": "A02",
      "requirementId": "R02",
      "description": "Escapeで閉じてフォーカス復帰、CTAで相談欄へ移動",
      "verification": "Playwright keyboard and CTA"
    },
    {
      "id": "A03",
      "requirementId": "R03",
      "description": "必須・メール不正を拒否、入力内容のテキストを保存、外部送信なし",
      "verification": "Playwright invalid and valid form download; no network submission"
    },
    {
      "id": "A04",
      "requirementId": "R04",
      "description": "375/768/1440pxで横溢れなし、reduced-motionで読める",
      "verification": "Playwright widths and reduced motion; axe and visual"
    },
    {
      "id": "A05",
      "requirementId": "R05",
      "description": "独自SVGとライセンス、動く静的サイト、検証報告をまとめる",
      "verification": "production verify/package, file manifest, human review"
    }
  ]
}
```
