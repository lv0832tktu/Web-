/**
 * sfx.js — 効果音ライブラリ（Web Audio APIで合成。音源ファイル不要・著作権フリー）
 *
 * 使い方:
 *   <script src="../../shared/js/sfx.js"></script>
 *   SFX.play('click');               // 単発再生
 *   SFX.bind();                      // data-sfx="pop" / data-sfx-hover="tick" を自動で紐付け
 *   SFX.setVolume(0.5); SFX.mute(true);
 *
 * ブラウザの自動再生制限により、最初のユーザー操作（クリック/タップ/キー入力）後に音が鳴ります。
 * 納品時は必ず「音のON/OFFボタン」を付けること（<button data-sfx-toggle>）。
 */
(function (global) {
  'use strict';

  let ctx = null;
  let master = null;
  let offset = 0; // オフラインレンダリング時のタイムライン位置
  let volume = 0.6;
  let muted = false;
  try { muted = localStorage.getItem('sfx-muted') === '1'; } catch (e) { /* ignore */ }

  function ac() {
    if (ctx && ctx.__offline) return ctx;
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ---------- 基本パーツ ----------
  function tone({ type = 'sine', freq = 440, to = null, dur = 0.15, gain = 0.4, attack = 0.005, delay = 0, detune = 0 }) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + delay + offset;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.detune.value = detune;
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  let noiseBuf = null;
  function noise({ dur = 0.3, gain = 0.3, filter = 'bandpass', freq = 1200, to = null, q = 1, delay = 0, attack = 0.01 }) {
    const c = ac(); if (!c) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = c.currentTime + delay + offset;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = filter; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  // ---------- 効果音プリセット ----------
  // 名前は knowledge/sfx-guide.md と DB の "sfx" フィールドに対応
  const presets = {
    click:      () => tone({ type: 'square', freq: 1800, to: 900, dur: 0.04, gain: 0.15 }),
    tick:       () => tone({ type: 'sine', freq: 2400, dur: 0.025, gain: 0.08 }),
    hover:      () => tone({ type: 'sine', freq: 1200, to: 1500, dur: 0.06, gain: 0.05 }),
    pop:        () => tone({ type: 'sine', freq: 400, to: 1100, dur: 0.09, gain: 0.35 }),
    bubble:     () => { tone({ type: 'sine', freq: 300, to: 900, dur: 0.12, gain: 0.3 }); tone({ type: 'sine', freq: 600, to: 1400, dur: 0.08, gain: 0.15, delay: 0.06 }); },
    toggle:     () => { tone({ type: 'triangle', freq: 700, dur: 0.05, gain: 0.2 }); tone({ type: 'triangle', freq: 1050, dur: 0.06, gain: 0.2, delay: 0.05 }); },
    'toggle-off': () => { tone({ type: 'triangle', freq: 1050, dur: 0.05, gain: 0.2 }); tone({ type: 'triangle', freq: 700, dur: 0.06, gain: 0.2, delay: 0.05 }); },
    whoosh:     () => noise({ dur: 0.45, gain: 0.25, freq: 400, to: 3500, q: 0.8, attack: 0.12 }),
    swoosh:     () => noise({ dur: 0.3, gain: 0.22, freq: 3000, to: 500, q: 1.2, attack: 0.05 }),
    swipe:      () => noise({ dur: 0.18, gain: 0.18, filter: 'highpass', freq: 2000, to: 6000, attack: 0.02 }),
    success:    () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ type: 'triangle', freq: f, dur: 0.35, gain: 0.22, delay: i * 0.08 })),
    chime:      () => [1318.5, 1760].forEach((f, i) => tone({ type: 'sine', freq: f, dur: 0.9, gain: 0.2, delay: i * 0.12 })),
    notify:     () => { tone({ type: 'sine', freq: 880, dur: 0.15, gain: 0.25 }); tone({ type: 'sine', freq: 1318.5, dur: 0.3, gain: 0.25, delay: 0.12 }); },
    error:      () => { tone({ type: 'sawtooth', freq: 180, dur: 0.12, gain: 0.15 }); tone({ type: 'sawtooth', freq: 140, dur: 0.18, gain: 0.15, delay: 0.13 }); },
    coin:       () => { tone({ type: 'square', freq: 988, dur: 0.08, gain: 0.12 }); tone({ type: 'square', freq: 1319, dur: 0.35, gain: 0.12, delay: 0.08 }); },
    sparkle:    () => { for (let i = 0; i < 6; i++) tone({ type: 'sine', freq: 2000 + Math.random() * 2500, dur: 0.12, gain: 0.07, delay: i * 0.045 }); },
    drop:       () => tone({ type: 'sine', freq: 1400, to: 200, dur: 0.18, gain: 0.3 }),
    typing:     () => noise({ dur: 0.03, gain: 0.15, filter: 'highpass', freq: 3000 + Math.random() * 2000, attack: 0.002 }),
    impact:     () => { tone({ type: 'sine', freq: 120, to: 40, dur: 0.5, gain: 0.6 }); noise({ dur: 0.25, gain: 0.3, filter: 'lowpass', freq: 1500, to: 200 }); },
    riser:      () => { tone({ type: 'sawtooth', freq: 200, to: 1600, dur: 1.2, gain: 0.08, attack: 0.8 }); noise({ dur: 1.2, gain: 0.12, freq: 500, to: 6000, attack: 1.0 }); },
    glitch:     () => { for (let i = 0; i < 5; i++) tone({ type: 'square', freq: 100 + Math.random() * 1500, dur: 0.03, gain: 0.1, delay: i * 0.035 }); noise({ dur: 0.15, gain: 0.12, filter: 'highpass', freq: 4000 }); },
    'page-turn': () => noise({ dur: 0.35, gain: 0.2, freq: 2500, to: 1200, q: 0.5, attack: 0.08 }),
    shutter:    () => { noise({ dur: 0.05, gain: 0.35, filter: 'highpass', freq: 2500, attack: 0.002 }); noise({ dur: 0.07, gain: 0.25, filter: 'highpass', freq: 2000, delay: 0.08, attack: 0.002 }); },
    confetti:   () => { presets.pop(); presets.sparkle(); },
    unlock:     () => { tone({ type: 'triangle', freq: 600, dur: 0.06, gain: 0.2 }); tone({ type: 'triangle', freq: 900, dur: 0.06, gain: 0.2, delay: 0.07 }); tone({ type: 'sine', freq: 1500, dur: 0.4, gain: 0.15, delay: 0.14 }); },
    'level-up': () => [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone({ type: 'square', freq: f, dur: 0.12, gain: 0.08, delay: i * 0.06 })),
    heartbeat:  () => { tone({ type: 'sine', freq: 70, dur: 0.12, gain: 0.6 }); tone({ type: 'sine', freq: 60, dur: 0.15, gain: 0.45, delay: 0.18 }); },
    'soft-bell': () => [659.25, 987.77].forEach((f, i) => tone({ type: 'sine', freq: f, dur: 1.4, gain: 0.15, delay: i * 0.02, attack: 0.01 })),
    koto:       () => [587.3, 784, 880].forEach((f, i) => { tone({ type: 'triangle', freq: f, dur: 0.8, gain: 0.18, delay: i * 0.11 }); tone({ type: 'sine', freq: f * 2, dur: 0.4, gain: 0.05, delay: i * 0.11 }); }),
  };

  // 楽器っぽい短いジングル（ロゴ表示やローディング完了に）
  presets.jingle = () => [523.25, 659.25, 783.99, 659.25, 1046.5].forEach((f, i) => tone({ type: 'triangle', freq: f, dur: 0.25, gain: 0.18, delay: i * 0.1 }));

  const SFX = {
    list: () => Object.keys(presets),
    play(name) {
      if (muted) return;
      const p = presets[name];
      if (!p) { console.warn('[SFX] unknown:', name); return; }
      if (!ac()) return;
      p();
    },
    setVolume(v) { volume = v; if (master && !muted) master.gain.value = v; },
    mute(m) {
      muted = m;
      try { localStorage.setItem('sfx-muted', m ? '1' : '0'); } catch (e) { /* ignore */ }
      if (master) master.gain.value = m ? 0 : volume;
      document.querySelectorAll('[data-sfx-toggle]').forEach((b) => {
        b.setAttribute('aria-pressed', String(!m));
        b.textContent = m ? (b.dataset.offLabel || '🔇 SOUND OFF') : (b.dataset.onLabel || '🔊 SOUND ON');
      });
    },
    isMuted: () => muted,
    register(name, fn) { presets[name] = fn; },

    /**
     * タイムライン再生（バナー/SNS動画の演出に合わせて鳴らす）
     * events: [{ t: 0.6, sfx: 'whoosh' }, ...]  t=秒
     */
    playTimeline(events) {
      return events.map((e) => setTimeout(() => SFX.play(e.sfx), e.t * 1000));
    },

    /**
     * タイムラインを WAV に書き出す（tools/render.mjs が動画に音を合成するのに使用）
     * 戻り値: Promise<string>（base64 WAV）
     */
    async renderTimeline(events, duration = 6, sampleRate = 44100) {
      const OAC = global.OfflineAudioContext || global.webkitOfflineAudioContext;
      const off = new OAC(2, Math.ceil(sampleRate * duration), sampleRate);
      off.__offline = true;
      const saved = { ctx, master, noiseBuf };
      ctx = off; noiseBuf = null;
      master = off.createGain(); master.gain.value = volume; master.connect(off.destination);
      try {
        events.forEach((e) => { offset = e.t; const p = presets[e.sfx]; if (p) p(); });
      } finally { offset = 0; }
      const buf = await off.startRendering();
      ctx = saved.ctx; master = saved.master; noiseBuf = saved.noiseBuf;
      return toWavBase64(buf);
    },
    /** data属性から自動で効果音を紐付け */
    bind(root = document) {
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-sfx]');
        if (t) SFX.play(t.dataset.sfx);
        const tg = e.target.closest('[data-sfx-toggle]');
        if (tg) { SFX.mute(!muted); if (!muted) SFX.play('toggle'); }
      });
      root.addEventListener('pointerover', (e) => {
        const t = e.target.closest('[data-sfx-hover]');
        if (t && !t.contains(e.relatedTarget)) SFX.play(t.dataset.sfxHover);
      });
      SFX.mute(muted);
    },
  };

  function toWavBase64(buf) {
    const ch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate;
    const data = new DataView(new ArrayBuffer(44 + len * ch * 2));
    const w = (o, str) => { for (let i = 0; i < str.length; i++) data.setUint8(o + i, str.charCodeAt(i)); };
    w(0, 'RIFF'); data.setUint32(4, 36 + len * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, ch, true); data.setUint32(24, sr, true);
    data.setUint32(28, sr * ch * 2, true); data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true); w(36, 'data'); data.setUint32(40, len * ch * 2, true);
    const chans = Array.from({ length: ch }, (_, i) => buf.getChannelData(i));
    let o = 44;
    for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, chans[c][i])); data.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    let bin = ''; const bytes = new Uint8Array(data.buffer);
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  global.SFX = SFX;
})(window);
