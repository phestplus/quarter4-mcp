// Generates the 1024x1024 plugin icon (.claude-plugin/icon.png) with no dependencies.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const S = 1024, px = Buffer.alloc(S * S * 4);
const set = (x, y, [r, g, b, a = 255]) => { const i = (y * S + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a; };
const BG = [11, 11, 12], FG = [250, 204, 21];
// Rounded square background
const R = 200;
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
  const dx = Math.max(R - x, 0, x - (S - 1 - R)), dy = Math.max(R - y, 0, y - (S - 1 - R));
  set(x, y, dx * dx + dy * dy <= R * R ? BG : [0, 0, 0, 0]);
}
// "Q4" in a 5x7 bitmap font, scaled
const glyphs = {
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
};
const cell = 70, gap = 70, w = 5 * cell * 2 + gap, x0 = (S - w) / 2, y0 = (S - 7 * cell) / 2 - 40;
['Q', '4'].forEach((ch, gi) => glyphs[ch].forEach((row, ry) => [...row].forEach((bit, rx) => {
  if (bit !== '1') return;
  const bx = x0 + gi * (5 * cell + gap) + rx * cell, by = y0 + ry * cell;
  for (let y = by + 4; y < by + cell - 4; y++) for (let x = bx + 4; x < bx + cell - 4; x++) set(Math.round(x), Math.round(y), FG);
})));
// Underline bar
for (let y = 820; y < 856; y++) for (let x = 262; x < 762; x++) set(x, y, FG);

const raw = Buffer.alloc((S * 4 + 1) * S);
for (let y = 0; y < S; y++) { raw[y * (S * 4 + 1)] = 0; px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4); }
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
for (const out of ['.claude-plugin/icon.png', 'docs/icon.png']) writeFileSync(out, png);
console.log('icon', png.length, 'bytes');
