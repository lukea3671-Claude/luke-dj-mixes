// Generate SVG waveform art from peaks data
// Each mix gets a unique visual fingerprint derived from its actual audio

import fs from 'node:fs';
import path from 'node:path';

interface PeaksData {
  data: number[];
  length: number;
}

function downsample(maxes: number[], targetPoints: number): number[] {
  const step = Math.max(1, Math.floor(maxes.length / targetPoints));
  const result: number[] = [];
  for (let i = 0; i < maxes.length && result.length < targetPoints; i += step) {
    let sum = 0;
    let count = 0;
    for (let j = i; j < Math.min(i + step, maxes.length); j++) {
      sum += maxes[j];
      count++;
    }
    result.push(sum / count);
  }
  return result;
}

function smoothPoints(points: number[], passes: number = 2): number[] {
  let smoothed = [...points];
  for (let p = 0; p < passes; p++) {
    const next = [...smoothed];
    for (let i = 1; i < smoothed.length - 1; i++) {
      next[i] = smoothed[i - 1] * 0.25 + smoothed[i] * 0.5 + smoothed[i + 1] * 0.25;
    }
    smoothed = next;
  }
  return smoothed;
}

function loadPeaks(peaksFile: string): number[] | null {
  const distPath = path.resolve('dist/audio', path.basename(peaksFile));
  const publicPath = path.resolve('public/audio', path.basename(peaksFile));

  let filePath = '';
  if (fs.existsSync(distPath)) filePath = distPath;
  else if (fs.existsSync(publicPath)) filePath = publicPath;
  else return null;

  const raw: PeaksData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const maxes = [];
  for (let i = 1; i < raw.data.length; i += 2) {
    maxes.push(raw.data[i]);
  }
  return maxes;
}

// Smooth flowing mountain landscape from peaks data
function buildLandscapePath(
  sampled: number[],
  peak: number,
  viewWidth: number,
  viewHeight: number,
  amplitude: number, // 0-1, how much of height to use
  baseY: number, // baseline Y position
  direction: 'up' | 'down' = 'up'
): string {
  const points: [number, number][] = [];
  for (let i = 0; i < sampled.length; i++) {
    const x = (i / (sampled.length - 1)) * viewWidth;
    const normalized = sampled[i] / peak;
    const displacement = normalized * viewHeight * amplitude;
    const y = direction === 'up' ? baseY - displacement : baseY + displacement;
    points.push([x, y]);
  }

  // Build smooth cubic bezier path
  let d = `M0,${baseY} L${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev[0] + curr[0]) / 2;
    d += ` C${cpx},${prev[1]} ${cpx},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  d += ` L${viewWidth},${baseY} Z`;
  return d;
}

export function generateWaveformSVGHero(peaksFile: string): string {
  const maxes = loadPeaks(peaksFile);
  if (!maxes) return '';

  const points = 150;
  const sampled = smoothPoints(downsample(maxes, points), 3);
  const peak = Math.max(...sampled, 1);
  const w = 200;
  const h = 100;

  // Three layered mountains — sit in the lower portion of the hero
  const layer1 = buildLandscapePath(sampled, peak, w, h, 0.22, h * 0.92, 'up');
  const layer2Data = smoothPoints(downsample(maxes.slice(Math.floor(maxes.length * 0.1)), points), 4);
  const layer2 = buildLandscapePath(layer2Data, peak, w, h, 0.15, h * 0.95, 'up');
  const layer3Data = smoothPoints(downsample(maxes.slice(Math.floor(maxes.length * 0.2)), points), 5);
  const layer3 = buildLandscapePath(layer3Data, peak, w, h, 0.1, h * 0.98, 'up');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
    <path d="${layer3}" fill="white" opacity="0.03"/>
    <path d="${layer2}" fill="white" opacity="0.06"/>
    <path d="${layer1}" fill="white" opacity="0.1"/>
  </svg>`;
}

export function generateWaveformSVGCard(peaksFile: string): string {
  const maxes = loadPeaks(peaksFile);
  if (!maxes) return '';

  const points = 80;
  const sampled = smoothPoints(downsample(maxes, points), 3);
  const peak = Math.max(...sampled, 1);
  const w = 120;
  const h = 80;

  // Two layers — horizon line in the lower third of the card
  const layer1 = buildLandscapePath(sampled, peak, w, h, 0.28, h * 0.88, 'up');
  const layer2Data = smoothPoints(downsample(maxes.slice(Math.floor(maxes.length * 0.15)), points), 4);
  const layer2 = buildLandscapePath(layer2Data, peak, w, h, 0.18, h * 0.93, 'up');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
    <path d="${layer2}" fill="white" opacity="0.05"/>
    <path d="${layer1}" fill="white" opacity="0.12"/>
  </svg>`;
}

export function generateWaveformSVGMini(peaksFile: string): string {
  const maxes = loadPeaks(peaksFile);
  if (!maxes) return '';

  const points = 40;
  const sampled = smoothPoints(downsample(maxes, points), 2);
  const peak = Math.max(...sampled, 1);
  const w = 60;
  const h = 40;

  const layer1 = buildLandscapePath(sampled, peak, w, h, 0.35, h * 0.85, 'up');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
    <path d="${layer1}" fill="white" opacity="0.15"/>
  </svg>`;
}
