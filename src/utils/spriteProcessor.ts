import { OutfitConfig } from '../config/outfits';

export interface ProcessedSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  skinColor: string;
}

function isNearWhite(r: number, g: number, b: number): boolean {
  const minC = Math.min(r, g, b);
  const maxC = Math.max(r, g, b);
  // High brightness and low saturation -> studio white background
  return minC > 228 && maxC - minC < 24;
}

export async function loadAndProcessSprite(outfit: OutfitConfig): Promise<ProcessedSprite> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error(`Failed to load ${outfit.imageUrl}`));
    el.src = outfit.imageUrl;
  });

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const work = document.createElement('canvas');
  work.width = w;
  work.height = h;
  const ctx = work.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Edge flood-fill to remove only exterior white background
  const visited = new Uint8Array(w * h);
  const isBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const tryEnqueue = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    const p = idx * 4;
    if (isNearWhite(data[p], data[p + 1], data[p + 2])) {
      isBg[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryEnqueue(0, y);
    tryEnqueue(w - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % w;
    const y = (idx - x) / w;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  // Apply transparency + 1px soft feather on boundary pixels
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const p = idx * 4;
      if (isBg[idx]) {
        data[p + 3] = 0;
      } else {
        // Check if adjacent to background for subtle anti-aliasing
        const adjBg =
          (x > 0 && isBg[idx - 1]) ||
          (x < w - 1 && isBg[idx + 1]) ||
          (y > 0 && isBg[idx - w]) ||
          (y < h - 1 && isBg[idx + w]);

        if (adjBg) {
          const lum = (data[p] + data[p + 1] + data[p + 2]) / 3;
          if (lum > 215) {
            data[p + 3] = Math.max(0, Math.min(255, Math.round((250 - lum) * 6)));
          }
        }

        if (data[p + 3] > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add small padding around trimmed character
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  const trimW = Math.max(1, maxX - minX + 1);
  const trimH = Math.max(1, maxY - minY + 1);

  const trimmed = document.createElement('canvas');
  trimmed.width = trimW;
  trimmed.height = trimH;
  const tCtx = trimmed.getContext('2d', { willReadFrequently: true });
  if (!tCtx) throw new Error('Could not get trimmed 2D context');

  tCtx.drawImage(work, minX, minY, trimW, trimH, 0, 0, trimW, trimH);

  // Sample Shayan's exact skin color from his forehead/cheek area
  const sx = Math.min(trimW - 1, Math.max(0, Math.round(outfit.landmarks.skinSample.x * trimW)));
  const sy = Math.min(trimH - 1, Math.max(0, Math.round(outfit.landmarks.skinSample.y * trimH)));
  const sample = tCtx.getImageData(sx - 2, sy - 2, 5, 5).data;
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let count = 0;
  for (let i = 0; i < sample.length; i += 4) {
    if (sample[i + 3] > 200) {
      sr += sample[i];
      sg += sample[i + 1];
      sb += sample[i + 2];
      count++;
    }
  }
  const skinColor =
    count > 0
      ? `rgb(${Math.round(sr / count)}, ${Math.round(sg / count)}, ${Math.round(sb / count)})`
      : 'rgb(185, 138, 108)';

  return {
    canvas: trimmed,
    width: trimW,
    height: trimH,
    skinColor,
  };
}
