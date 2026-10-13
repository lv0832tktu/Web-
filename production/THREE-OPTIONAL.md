# Three.js・React Three Fiberのオプション導入

標準案件はGSAP/CSSのみを使用。立体商品、インタラクティブな空間等、3Dの情報価値がある場合にのみ導入します。

```sh
cd projects/<案件名>
npm install three @react-three/fiber @react-three/drei
```

3Dシーンは `React.lazy(() => import('./components/Scene3D.jsx'))` で分割し、`Suspense` と静止画フォールバックを用意。端末負荷・操作・非表示時の停止・reduced-motionを検証します。GPU非対応時にも主要導線が利用できることを必須とします。
