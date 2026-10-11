# 効果音（SFX）ガイド

`shared/js/sfx.js` は **Web Audio API で音をリアルタイム合成** します。音源ファイル不要・著作権フリー・軽量（約10KB）。
同じ仕組みで **動画書き出し時にWAVを生成** し、MP4に効果音を合成できます（`tools/render.mjs --mp4`）。

## 使い方
```html
<script src="shared/js/sfx.js"></script>
<button data-sfx="pop">追加</button>                 <!-- クリックで鳴る -->
<a data-sfx-hover="tick">メニュー</a>                <!-- ホバーで鳴る -->
<button data-sfx-toggle>🔊 SOUND ON</button>          <!-- ON/OFF（必須） -->
<script>
  SFX.bind();                                         // data属性を有効化
  SFX.play('success');                                // JSから
  SFX.playTimeline([{ t: 0, sfx: 'whoosh' }, { t: .6, sfx: 'pop' }]);  // 演出に合わせて
  SFX.setVolume(.4);
  SFX.register('my-sound', () => { /* 独自の音 */ });
</script>
```

## プリセット一覧（30種）
| 名前 | 音のイメージ | 使いどころ |
|---|---|---|
| click | カチッ（硬め） | ボタン押下（テック系） |
| tick | チッ（極小） | ホバー、タブ切替、スライダー |
| hover | ぴっ（上昇） | カードホバー |
| pop | ポンッ | 要素の出現、追加、いいね |
| bubble | ぷくっ | リアクション（柔らかい） |
| toggle / toggle-off | カチ↑ / カチ↓ | スイッチ ON/OFF |
| whoosh | ヒュッ（上昇ノイズ） | スライド遷移、画面切替 |
| swoosh | シュッ（下降） | メニュー開閉 |
| swipe | サッ | カードスワイプ、戻る |
| success | ドミソド↑ | 送信完了、購入完了 |
| chime | キラーン | お知らせ（上品） |
| notify | ピコン | 通知 |
| error | ブブッ | 入力エラー |
| coin | チャリーン | ポイント、クーポン |
| sparkle | キラキラ | 当選、キラ演出 |
| drop | ポチャ | 水滴、ナチュラル、更新 |
| typing | カタ | タイプライター |
| impact | ドンッ | ロゴ着地、数字ドーン |
| riser | ヒューーン↑ | 期待感（オープニング） |
| glitch | ジジッ | グリッチ演出 |
| page-turn | ペラッ | ページめくり、記事遷移 |
| shutter | カシャ | 写真・ギャラリー |
| confetti | ポン＋キラキラ | 紙吹雪とセット |
| unlock | カチャ＋キーン | プレミアム開放 |
| level-up | ピロピロ↑ | 達成、ランクアップ |
| heartbeat | ドクン | 緊張感、医療 |
| soft-bell | チーン（柔） | 高級・和の合図 |
| koto | 琴風のアルペジオ | 和モダン |
| jingle | 短いメロディ | ロゴ表示、ローディング完了 |

## 音のデザインルール
1. **フィードバックとして鳴らす**：ユーザーの操作の「結果」を伝える音だけ。BGMは原則入れない
2. **音量は控えめ**：既定0.6。ホバー音は特に小さく（tick/hover）
3. **必ずOFFにできる**：`data-sfx-toggle`。設定は localStorage に保存される
4. **自動再生しない**：ブラウザ仕様で最初のクリックまで鳴らない（正常動作）
5. **スタイルに合わせる**：高級→soft-bell/chime、ポップ→pop/bubble/coin、テック→click/notify/unlock、和→koto
6. **連打で不快にしない**：スライダー等は一定量動いた時だけ鳴らす（LPテンプレートのBAスライダー参照）
7. **SNS動画**：出現 whoosh → 文字 pop → 強調 impact → CTA sparkle の4打が基本

## 動画に効果音を入れる
各テンプレートの `content` JSON に `"sfxTimeline": [{ "t": 0.0, "sfx": "whoosh" }, ...]` を書き、
`node tools/render.mjs index.html --sizes 1080x1920 --mp4` → 映像と同期した効果音入りMP4が出力されます。
