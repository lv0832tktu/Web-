# モーション＆グラフィック ガイド

「動き」は高度な技術に見える一番の近道。ただし **意味のある動きだけ** を、**統一されたルール** で使う。
ライブラリは `shared/js/motion.js`・`shared/css/motion.css`・`shared/js/graphics.js`。HTMLに data属性を書くだけで動きます。
全モーション名と実装方法の対応表は `knowledge/dictionary.json` の `motions`。

## よく使う実装（コピペ用）

```html
<!-- 出現 -->
<h2 data-reveal="fade-up">見出し</h2>
<img data-reveal="clip-up" src="..." alt="">
<figure data-reveal="mask-wipe"><img src="..." alt=""></figure>
<ul data-stagger="80"><li>…</li><li>…</li></ul>          <!-- 子要素を順番に -->

<!-- キネティックタイポ（1文字ずつ）。<br>や<em>は維持される -->
<h1 data-split="chars">3ヶ月で、<br>なりたい<em>私</em>へ。</h1>
<h1 data-split="chars" data-split-style="rotate">Spaces that breathe.</h1>

<!-- 数字・タイプ -->
<b data-counter="12000" data-suffix="人">0</b>
<p data-typewriter data-sfx-type>AIがあなたの代わりに…</p>

<!-- インタラクション -->
<a class="btn" data-magnetic>予約する</a>
<div class="card" data-tilt="8">…</div>
<button data-ripple>OK</button>
<body data-cursor>                                    <!-- カスタムカーソル -->

<!-- スクロール -->
<div data-scroll-progress></div>
<img data-parallax="0.15" src="..." alt="">
<div data-marquee="40"><div>MEDIA • PRESS • …</div></div>
<section data-pin style="height:300vh"><div style="position:sticky;top:0;transform:scale(calc(1 + var(--p)))">…</div></section>

<!-- 背景グラフィック（親要素いっぱいに描画・画面外では停止） -->
<canvas data-gfx="mesh"></canvas>            <!-- 動くメッシュグラデ：SaaS/美容/パステル -->
<canvas data-gfx="particles"></canvas>       <!-- 漂う粒子：高級/夜/宇宙 -->
<canvas data-gfx="constellation"></canvas>   <!-- ネットワーク：AI/テック -->
<canvas data-gfx="waves"></canvas>           <!-- 波：ナチュラル/水/医療 -->
<canvas data-gfx="bokeh"></canvas>           <!-- 光の玉：ラグジュアリー/ウェディング -->
<canvas data-gfx="grid3d"></canvas>          <!-- シンセウェーブ：レトロ/ゲーム -->
<canvas data-gfx="sakura"></canvas>          <!-- 花びら：和/春 -->
<canvas data-gfx="snow"></canvas>            <!-- 雪：冬/クリスマス -->
<canvas data-gfx="rings"></canvas>           <!-- 波紋：ミニマル -->

<!-- ループ装飾 -->
<span class="m-float">  <span class="m-spin">  <a class="m-shine">  <div class="m-blob">  <img class="m-kenburns">  <span class="m-glitch" data-text="TEXT">TEXT</span>

<!-- JS -->
<script>Motion.confetti({ colors: ['#f00', '#0f0'] });</script>
```

## タイミングの黄金比
| 種類 | 時間 | イージング |
|---|---|---|
| ホバー | 0.2〜0.4s | `--ease-out` |
| 要素の出現 | 0.8〜1.2s | `--ease-out`（cubic-bezier(.16,1,.3,1)） |
| 写真のマスク | 1.0〜1.2s | `--ease-in-out` |
| 弾む（ポップ系） | 0.5〜0.7s | `--ease-back` |
| stagger の間隔 | 60〜120ms | — |
| 1文字ずつ | 30〜50ms | — |

## スタイル別の「動きの性格」
- **高級・ミニマル**：遅く・小さく・ぼかし（blur-in, mask-wipe, ken-burns）。バウンス禁止
- **ポップ・かわいい**：速く・弾む（pop, bounce, wiggle, confetti）
- **テック**：直線的・精密（typewriter, constellation, counter, glow）
- **スポーティ**：斜め・スピード（skew, zoom-in, impact-shake）
- **和モダン**：縦方向・静か（clip-up, vertical-text-reveal, sakura）

## 高度に見える演出レシピ
1. **ローディング→ロゴ→ヒーロー**：ロゴを1文字ずつ出し、幕が上がって本編へ（corporateテンプレート）
2. **スクロール連動（sticky-scrub）**：`section[data-pin]` の `--p`（0〜1）で拡大・回転・色変化
3. **横スクロールギャラリー**：縦スクロールで実績が横に流れる
4. **画像のホバー追従**：リストにホバーすると写真がカーソルについてくる
5. **ページ遷移カーテン**：色面が下から上がって次のページへ
6. **マグネティック＋カスタムカーソル**：PCだけ。タッチ端末では自動で無効

## アニメーションを動画・GIFにする
`node tools/render.mjs <html> --sizes 1080x1920 --mp4`（効果音も合成）／ `--gif`（バナー入稿用）

## 注意
- `prefers-reduced-motion: reduce` の人には動きを止める（motion.css 実装済み）
- 動く背景は CPU を使う。1ページ2個まで。画面外では自動停止
- 自動再生の動画は `muted playsinline` 必須
