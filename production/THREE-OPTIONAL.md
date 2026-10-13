# Three.js・React Three Fiberの標準搭載

React・Vite・Tailwind CSS・GSAP・Three.js・React Three Fiberを標準技術とする。ファイル名は既存リンクとの互換性のため維持。

Three.jsとReact Three Fiberはproduction/template/package.jsonとlockfileに含まれ、npm ciで全React案件へ導入される。追加のAPIキーや有料APIは不要。

src/OptionalScene.jsxを必要な画面へ配置。Scene.jsxは操作後に遅延ロード。静止画代替、WebGL非対応、読込エラー、reduced-motionにも対応する。初期画面のJavaScriptに3Dシーンを混ぜず、モデル・描画負荷を案件ごとに検証する。

@react-three/dreiは必要な案件で追加する補助ライブラリ。標準依存ではない。
