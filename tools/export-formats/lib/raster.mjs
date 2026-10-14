// PNG の読み書き・透明部分の切り抜き・差分計測
import { PNG } from 'pngjs';

export const decode = (buf) => PNG.sync.read(buf);
export const encode = (img) => PNG.sync.write(img);

/** 透明な余白を切り落とす。何も描かれていなければ null */
export function trim(img) {
  const { width: w, height: h, data } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (data[row + x * 4 + 3] > 2) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  const tw = x1 - x0 + 1, th = y1 - y0 + 1;
  const out = new PNG({ width: tw, height: th });
  for (let y = 0; y < th; y++) data.copy(out.data, y * tw * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x1 + 1) * 4);
  return { img: out, dx: x0, dy: y0 };
}

/** 2枚の画像の一致率（0〜1）。サイズが違う場合は小さい方に合わせて比較 */
export function similarity(a, b) {
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  let diff = 0, bad = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * a.width + x) * 4, j = (y * b.width + x) * 4;
      // 白背景に合成して比較
      let d = 0;
      for (let k = 0; k < 3; k++) {
        const va = (a.data[i + k] * a.data[i + 3] + 255 * (255 - a.data[i + 3])) / 255;
        const vb = (b.data[j + k] * b.data[j + 3] + 255 * (255 - b.data[j + 3])) / 255;
        d = Math.max(d, Math.abs(va - vb));
      }
      diff += d;
      if (d > 48) bad++;
    }
  }
  return { mean: 1 - diff / (w * h * 255), pixels: 1 - bad / (w * h) };
}
