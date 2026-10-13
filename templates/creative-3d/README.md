# 任意3D

node scripts/new-project.mjs --name sample --template creative-3d

案件に必要な場合のみnpm install three @react-three/fiber。OptionalSceneを画面に配置。静的な代替は3D未導入・WebGL非対応・読込失敗・reduced-motionで表示。ユーザーの操作前に3Dをダウンロードしない。

## 3D追加後の検査

OptionalSceneをmain.jsxへ配置後、three.spec.jsを案件tests/へコピーし、npm run test:e2eを実行。操作前のcanvas不在・操作後の描画・軽減設定での解除を3端末で検査。WebGL非対応時は静的代替を別途確認。

3Dチャンクは通常JSとは分離されるが重くなりやすい。検証ではgzip約248KB。低性能端末の計測と、モデル・描画負荷の調整が案件ごとに必要。
