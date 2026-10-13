import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

function useMotion(ref, animate, dependencies) {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => animate(ref.current));
    return () => media.revert();
  }, dependencies);
}

export function ScrollReveal({ children, ...props }) {
  const ref = useRef();
  useMotion(ref, node => gsap.from(node, { y: 24, opacity: 0, duration: .65, clearProps: 'transform,opacity', scrollTrigger: { trigger: node, start: 'top 90%', once: true } }), []);
  return <div ref={ref} {...props}>{children}</div>;
}

export function AnimatedText({ text, as: Tag = 'h1', ...props }) {
  const ref = useRef();
  useMotion(ref, node => gsap.from(node.querySelectorAll('[data-char]'), { y: 12, opacity: 0, stagger: .02, duration: .5, clearProps: 'transform,opacity' }), [text]);
  return <Tag ref={ref} {...props}><span className="sr-only">{text}</span><span aria-hidden="true">{Array.from(text).map((char,i) => <span key={i} data-char style={{ display: 'inline-block', whiteSpace: 'pre-wrap' }}>{char}</span>)}</span></Tag>;
}

// routeKeyはルーターのpathname等。ルーティング・フォーカス管理は呼出側の責務。
export function PageTransition({ routeKey, children }) {
  const ref = useRef();
  useMotion(ref, node => gsap.from(node, { opacity: 0, y: 8, duration: .3, clearProps: 'transform,opacity' }), [routeKey]);
  return <div ref={ref}>{children}</div>;
}
