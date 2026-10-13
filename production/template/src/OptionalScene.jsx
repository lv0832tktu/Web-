import React, { lazy, Suspense, useEffect, useState } from 'react';
const Scene = lazy(() => import('./Scene.jsx'));
class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function OptionalScene({ fallback = <p>商品の形状を静止画でご確認ください。</p> }) {
  const [enabled,setEnabled] = useState(false);
  const [allowed,setAllowed] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    let supported = false;
    try { const canvas = document.createElement('canvas'); const gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); supported = !!gl; gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* static fallback */ }
    const update = () => { setAllowed(supported && !mq.matches); if (mq.matches) setEnabled(false); };
    update(); mq.addEventListener('change',update);
    return () => mq.removeEventListener('change',update);
  },[]);
  return <>{fallback}{allowed && !enabled && <button type="button" onClick={() => setEnabled(true)}>3D表示を読み込む</button>}{allowed && enabled && <Boundary fallback={fallback}><Suspense fallback={<p>読み込み中</p>}><Scene/></Suspense></Boundary>}</>;
}
