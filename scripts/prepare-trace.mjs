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
 * - Embedded photos, Inkscape's editor data and needless decimals are left out, and the
 *   picture is cropped to the drawing, so empty page around it doesn't push the post apart.
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

// the drawing's extent, so the picture can be cropped to it
const extent = [Infinity, Infinity, -Infinity, -Infinity];
function grow(d) {
  svgpath(d)
    .abs()
    .unarc()
    .unshort()
    .iterate(([cmd, ...args], _, x, y) => {
      // H and V give one coordinate; the other commands list x, y pairs (Z lists none)
      const points =
        cmd === 'H'
          ? [[args[0], y]]
          : cmd === 'V'
            ? [[x, args[0]]]
            : Array.from({ length: args.length / 2 }, (_, i) => args.slice(2 * i, 2 * i + 2));
      for (const [px, py] of points) {
        extent[0] = Math.min(extent[0], px);
        extent[1] = Math.min(extent[1], py);
        extent[2] = Math.max(extent[2], px);
        extent[3] = Math.max(extent[3], py);
      }
    });
}

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
  grow(d);
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

// a margin of 1% keeps strokes along the edge from being clipped
const margin = Math.round(width / 100);
const [left, top, right, bottom] = extent;
const cropped = [left - margin, top - margin, right - left + 2 * margin, bottom - top + 2 * margin]
  .map(n => Math.round(n))
  .join(' ');

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cropped}">`,
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
