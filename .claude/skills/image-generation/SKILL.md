---
name: image-generation
description: 写真・イラスト・背景・アイキャッチなどの画像が必要なとき、または「画像を作って」と頼まれたときに使う。ChatGPTのようにチャット内で画像を生成し、案件フォルダに保存して記録する。
---

# 画像生成（ChatGPTのようにチャットで作る）

## まず決めること: 描くか、生成するか

| 必要な画像 | 方法 | 費用 |
|---|---|---|
| アイコン・図形・パターン・グラデーション背景・図解 | SVG / CSS / `shared/js/graphics.js` でコードで描く | 無料・後から編集できる |
| 写真風の画像・人物のいない情景・質感のあるイラスト・キービジュアル | 画像生成（下の手順） | クレジット消費 |
| クライアントの商品・店舗・スタッフ・実績 | **生成しない。** クライアント提供の写真を使う。届くまでプレースホルダー | — |

## 生成の手順（Claude の場合: Higgsfield コネクタ）

Higgsfield コネクタの `generate_image` で、ChatGPT と同じ OpenAI の画像モデルが使える。

1. **モデルを選ぶ。**
   - 通常・写真風・文字入り: `gpt_image_2_5`（ChatGPTの画像生成と同系統。既定）
   - 安く速くラフを大量に: `z_image` / `nano_banana`
   - 広告・商品画像: `marketing_studio_image`
   - 迷ったら `models_explore`（`action: "recommend"`）
2. **プロンプトを書く。** BRIEFの配色・雰囲気・用途を入れる。例:
   「秋の味覚の静物写真風。栗と柿を木のテーブルに。やわらかい自然光。背景は余白多め、右側に文字を載せるスペース。色味は深い橙と生成り」
   比率はアートボードに合わせる（バナー 16:9 / 1:1、SNS 4:5 / 9:16 など）。
3. **費用を見積もる。** 同じ内容で `get_cost: true` を付けて呼ぶ（生成されない）。参考: `gpt_image_2_5` 品質low・1kで1枚0.25クレジット（2026年10月時点）。
4. **人間の承認を得る。** 案件で初めて生成するときは「何枚・何クレジット」を伝えてOKをもらう。
   同じ案件の中で承認済みの範囲（枚数・品質）なら、その都度は聞かない。
5. **生成する。** ラフは `quality: "low"`、決定案の本番画像だけ `high` 以上にする。
   同じプロンプトの色違いは `count` 2〜4、別々のプロンプトは `generate_image_batch`。終わるまで `jobs_wait` で待つ。
6. **保存して記録する。** 結果の画像URLを次のコマンドで案件フォルダに保存すると、`assets/generated/ledger.jsonl` に記録も残る。
   ```bash
   node tools/image-gen.mjs save --url "<画像URL>" --out projects/<案件>/assets/hero.png \
     --prompt "<使ったプロンプト>" --model gpt_image_2_5 --via higgsfield
   ```
   クラウド環境（プロキシ経由）では先頭に `NODE_USE_ENV_PROXY=1` を付ける（Node 22.21以上。Nodeの標準fetchはそのままだとプロキシを使わない）。
   それでもダウンロードがネットワーク制限で失敗したら、画像URLを返信に書き、記録だけ `--url` なしで残す（`save` は `--out` が既にあればそれを記録する）。
7. **使う。** HTMLでは `<img>` に `width` / `height` / `alt` を付ける。Claude Design キャンバスではアセットとしてアップロードして `/_blob/...` で参照する。

## Higgsfield がないとき（Codex・ローカル）: OpenAI API

`OPENAI_API_KEY` を環境変数に設定したうえで、費用が発生することを人間が承認してから実行する。

```bash
# 何が送られるかだけ確認（APIは呼ばない）
node tools/image-gen.mjs generate --prompt "..." --size 1536x1024 --out projects/<案件>/assets/hero.png --dry-run
# 実行（--confirm がないと止まる）
node tools/image-gen.mjs generate --prompt "..." --size 1536x1024 --quality medium --out projects/<案件>/assets/hero.png --confirm
```

モデルは既定で `gpt-image-1`。`--model` か環境変数 `IMAGE_MODEL` で変えられる。

## 守ること

- AI生成画像を実写・実績・お客様の写真として見せない。納品時は `README.txt` に「AI生成画像を含む（モデル名）」と書く。
- 実在の人物・有名人・他社ロゴ・キャラクター・特定作家の画風を再現しない。人物は架空であることを前提にする。
- 使うモデルの商用利用条件を守る。クライアントがAI画像を望まない場合は使わない（BRIEFで確認）。
- 生成画像は必ず `assets/generated/ledger.jsonl` に残す（プロンプト・モデル・日時・保存先）。
