仕様PR #2 の承認対象SHA `5046c0ddc5fd5ae253dc862e8eb965594bd1789c` を受信し、架空ブランド「秋じかん」の自主制作画像を追加します。カルーセル6枚（1080×1350）・バナー1枚（1080×1080）のPNGと同名SVG編集元、独立生成写真5点、コピー/alt、素材/フォント台帳、検証報告を含みます。

仕様ファイルは変更していません。このPRは仕様ブランチ `work-handoff/autumn-weekend-v1` をベースにした実装PRで、成果物は `codex/autumn-weekend-v1/` に追加します。仕様PRのマージ後は必要に応じてベースを制作基盤ブランチへ変更してください。

検証: 指定SHAのwork:receive / production validate / work:check成功。PNG7枚の寸法、SVGの編集可能文字と写真/フォント埋込、全コピー8案、安全余白72px、本文42px以上、コントラスト、SVGを別ページで再読込したPNGの完全一致を確認。原寸と375/768/1440相当の21表示を独立QAで検査。初稿の低解像写真は個別高解像写真へ置換。詳細は `05-qa/validation-report.md` と `independent-review.md`。

既存基盤の回帰: typecheck/lint/build/build:mock/production:check/handoff成功、unit 17/17、E2E 33/33。初回は重複E2E起動の証拠ファイル競合があり、単独で再実行して通過。Webテストを画像視覚QAの代替とはしていません。リモートCIは別途確認が必要です。

未確認: 生成写真の利用条件と人による権利レビュー、最終画像承認、Chromium以外の編集ソフトでのSVG再編集、Instagram実機表示/圧縮/反応。フォントのSIL OFL 1.1は確認し同梱。権利未確認を完成扱いせず、stateはhuman_review、台帳はUNVERIFIED/NOT_RUNです。

公開、Instagram投稿、マージ、顧客送信は含みません。SVGの文字はアウトライン化せず編集可能で、非対応編集ソフト向けTTFも同梱しています。
