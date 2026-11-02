#!/usr/bin/env node

/**
 * Turns a drawing traced in Inkscape into an SVG the site can animate.
 *
 *   bun run trace <drawing.svg> <name>
 *
 * writes src/assets/traces/<name>.svg, shown in a post with <TraceDrawing name="<name>" />.
 *
 * - A path made of many separate pieces is the Trace Bitmap result. Its pieces are sorted into
 *   floors by how low they sit in the picture, so the drawing can light up from the bottom.
 * - Any other path is a line drawn by hand, which the page draws stroke by stroke.
 * - Embedded photos, Inkscape's editor data and needless decimals are left out.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import svgpath from 'svgpath';

const FLOORS = 24;
// fewer pieces than this and a path is taken to be drawn by hand
const TRACE_MIN_PIECES = 20;

const [input, name] = process.argv.slice(2);
if (!input || !name) {
  console.error('usage: bun run trace <drawing.svg> <name>');
  process.exit(1);
}

const source = fs.readFileSync(input, 'utf8');
const viewBox = source.match(/\sviewBox="([^"]+)"/)?.[1];
if (!viewBox) {
  console.error(`${input} has no viewBox`);
  process.exit(1);
}
if (/<(path|g)\b[^>]*\stransform="/.test(source)) {
  console.error(
    `${input} has moved layers or paths (a transform), which this script can't follow yet.`
  );
  process.exit(1);
}

// once a unit is well under a pixel on screen, whole numbers are plenty
const width = Number(viewBox.trim().split(/[\s,]+/)[2]);
const digits = width > 1000 ? 0 : 1;
const compact = d => svgpath(d).rel().round(digits).toString();

// Splits a path into its separate pieces, noting how low each one reaches.
function pieces(d) {
  const found = [];
  let piece = null;
  let y = 0; // only height matters for sorting into floors
  let startY = 0;
  for (const seg of svgpath(d).abs().unarc().unshort().segments) {
    const [cmd, ...args] = seg;
    if (cmd === 'M') {
      piece = { segments: [], bottom: -Infinity };
      found.push(piece);
      startY = args[1];
    }
    piece.segments.push(seg);
    const ys =
      cmd === 'H' ? [y] : cmd === 'V' ? [args[0]] : cmd === 'Z' ? [] : args.filter((_, i) => i % 2);
    for (const value of ys) piece.bottom = Math.max(piece.bottom, value);
    if (cmd === 'V') y = args[0];
    else if (cmd === 'Z') y = startY;
    else if (cmd !== 'H') y = args[args.length - 1];
  }
  return found;
}

const lines = [];
const traced = [];
for (const [, d] of source.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)) {
  const parts = pieces(d);
  if (parts.length >= TRACE_MIN_PIECES) traced.push(...parts);
  else lines.push(compact(d));
}

// bottom of the picture first
const lowest = Math.max(...traced.map(p => p.bottom));
const highest = Math.min(...traced.map(p => p.bottom));
const band = (lowest - highest) / FLOORS || 1;
const floors = Array.from({ length: FLOORS }, () => []);
for (const piece of traced) {
  floors[Math.min(FLOORS - 1, Math.floor((lowest - piece.bottom) / band))].push(piece);
}
const floorPaths = floors
  .filter(floor => floor.length)
  .map(floor => compact(floor.flatMap(p => p.segments.map(seg => seg.join(' '))).join(' ')));

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`,
  ...lines.map(d => `<path data-trace="line" d="${d}"/>`),
  ...floorPaths.map(d => `<path data-trace="floor" d="${d}"/>`),
  '</svg>',
  '',
].join('\n');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, 'src', 'assets', 'traces', `${name}.svg`);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, svg);
console.log(
  `${path.relative(root, output)}: ${lines.length} hand-drawn lines, ${traced.length} traced pieces ` +
    `in ${floorPaths.length} floors, ${(svg.length / 1024).toFixed(0)} KB`
);
