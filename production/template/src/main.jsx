import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';
gsap.registerPlugin(ScrollTrigger);

function App() {
  const scope = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;
    const context = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 32, opacity: 0, duration: 0.8, ease: 'power2.out',
        stagger: 0.12, clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '[data-reveal]', start: 'top 85%', once: true }
      });
    }, scope);
    return () => context.revert();
  }, []);

  return <div ref={scope}>
    <a href="#main" className="skip-link">本文へ移動</a>
    <header className="site-header"><a href="/" aria-label="ホーム">STUDIO / SAMPLE</a><nav aria-label="メインナビゲーション"><a href="#concept">コンセプト</a></nav></header>
    <main id="main">
      <section className="hero" aria-labelledby="page-title">
        <p data-reveal className="eyebrow">YOUR BRAND, YOUR STORY</p>
        <h1 id="page-title" data-reveal>ここに、ブランドだけの言葉を。</h1>
        <p data-reveal>これは実績掲載用ではない仮テンプレートです。案件の事実と固有の魅力に置き換えてください。</p>
        <a className="cta" href="#concept">コンセプトを見る <span aria-hidden="true">↗</span></a>
      </section>
      <section id="concept" className="concept">
        <p className="eyebrow">OUR CONCEPT</p>
        <h2>伝わる情報設計から、デザインする。</h2>
        <p>テンプレートのまま納品せず、写真・色・余白・文字組みと動きを案件に合わせて再設計します。</p>
      </section>
    </main>
    <footer>© SAMPLE PROJECT — 仮設定</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
