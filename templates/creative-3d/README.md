# 標準3D部品の利用

node scripts/new-project.mjs --name sample --template creative-3d

Three.js・React Three Fiberはcorporate / landing-page / creative-3dの全React案件に標準導入済み。src/OptionalScene.jsxを必要な画面へ配置する。3D追加インストールは不要。静的な代替はWebGL非対応・読込失敗・reduced-motionで表示。操作前に3Dシーンをダウンロードしない。

OptionalScene配置後、three.spec.jsを案件tests/へコピーし、npm run test:e2e。操作前canvas不在・操作後描画・軽減設定での解除を3端末で検査。WebGL非対応時の静的代替も別途確認。

Scene.jsx・OptionalScene.jsxの実装本体はproduction/template/src/で管理。3Dチャンクの容量・低性能端末の描画負荷は案件ごとに確認する。
