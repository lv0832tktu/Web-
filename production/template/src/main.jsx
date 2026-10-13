import React from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollReveal, AnimatedText, PageTransition } from './components/Motion.jsx';
import './style.css';

function App() {

  return <div>
    <a href="#main" className="skip-link">本文へ移動</a>
    <header className="site-header"><a href="/" aria-label="ホーム">STUDIO / SAMPLE</a><nav aria-label="メインナビゲーション"><a href="#concept">コンセプト</a></nav></header>
    <PageTransition routeKey="home"><main id="main" tabIndex={-1}>
      <section className="hero" aria-labelledby="page-title">
        <p data-reveal className="eyebrow">YOUR BRAND, YOUR STORY</p>
        <AnimatedText id="page-title" text="ここに、ブランドだけの言葉を。" />
        <p data-reveal>これは実績掲載用ではない仮テンプレートです。案件の事実と固有の魅力に置き換えてください。</p>
        <a className="cta" href="#concept">コンセプトを見る <span aria-hidden="true">↗</span></a>
      </section>
      <ScrollReveal><section id="concept" className="concept">
        <p className="eyebrow">OUR CONCEPT</p>
        <h2>伝わる情報設計から、デザインする。</h2>
        <p>テンプレートのまま納品せず、写真・色・余白・文字組みと動きを案件に合わせて再設計します。</p>
      </section></ScrollReveal>
    </main></PageTransition>
    <footer>© SAMPLE PROJECT — 仮設定</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
