// A small QR Code encoder (ISO/IEC 18004) for the printed packet's link to
// "How we know". The app loads nothing from other sites (its Content Security
// Policy is 'self' only) and works offline, so the code is drawn here.
//
// Byte mode, versions 1 to 10 (up to 213 bytes at level M, more than any URL
// we print), with the standard Reed-Solomon error correction, masks and
// format and version information. Written after the specification and the
// usual reference implementations; tests/qr.test.ts checks its structure, and
// it was checked by decoding its output with ZXing for many strings.

export type Ecc = "L" | "M" | "Q" | "H";

/** Error correction codewords per block, and number of blocks, for versions 1-10 (index 0 unused). */
const ECC_PER_BLOCK: Record<Ecc, number[]> = {
  L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
  M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
  Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
  H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28],
};
const BLOCKS: Record<Ecc, number[]> = {
  L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
  M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
  Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
  H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8],
};
/** The two format-information bits for each level. */
const ECC_BITS: Record<Ecc, number> = { L: 1, M: 0, Q: 3, H: 2 };
const MAX_VERSION = 10;

export interface Qr {
  version: number;
  /** Modules per side: 17 + 4 x version. */
  size: number;
  /** modules[y][x], true for dark. */
  modules: boolean[][];
  mask: number;
}

/** Data modules in a symbol of this version, after the function patterns. */
function rawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const align = Math.floor(ver / 7) + 2;
    result -= (25 * align - 10) * align - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

export function dataCodewords(ver: number, ecc: Ecc): number {
  return Math.floor(rawDataModules(ver) / 8) - ECC_PER_BLOCK[ecc][ver] * BLOCKS[ecc][ver];
}

/** Centres of the alignment patterns along each axis. */
export function alignmentPositions(ver: number): number[] {
  if (ver === 1) return [];
  const count = Math.floor(ver / 7) + 2;
  const step = Math.floor((ver * 8 + count * 3 + 5) / (count * 4 - 4)) * 2;
  const result = [6];
  for (let pos = ver * 4 + 10; result.length < count; pos -= step) result.splice(1, 0, pos);
  return result;
}

// ---------- Reed-Solomon over GF(2^8), polynomial 0x11D ----------

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => { result[i] ^= gfMultiply(coef, factor); });
  }
  return result;
}

/** Splits the data into blocks, adds each block's error correction, and interleaves them. */
function withEcc(data: number[], ver: number, ecc: Ecc): number[] {
  const numBlocks = BLOCKS[ecc][ver];
  const eccLen = ECC_PER_BLOCK[ecc][ver];
  const raw = Math.floor(rawDataModules(ver) / 8);
  const numShort = numBlocks - (raw % numBlocks);
  const shortLen = Math.floor(raw / numBlocks);
  const divisor = rsDivisor(eccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
    k += dat.length;
    const check = rsRemainder(dat, divisor);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(check));
  }
  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++)
    blocks.forEach((block, j) => { if (i !== shortLen - eccLen || j >= numShort) result.push(block[i]); });
  return result;
}

// ---------- the symbol ----------

const bit = (x: number, i: number) => ((x >>> i) & 1) !== 0;

class Grid {
  readonly modules: boolean[][];
  readonly fixed: boolean[][];
  constructor(readonly size: number) {
    this.modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    this.fixed = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  }
  set(x: number, y: number, dark: boolean) { this.modules[y][x] = dark; this.fixed[y][x] = true; }
}

function drawFunctionPatterns(g: Grid, ver: number) {
  const n = g.size;
  for (let i = 0; i < n; i++) { g.set(6, i, i % 2 === 0); g.set(i, 6, i % 2 === 0); }
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
      if (x >= 0 && x < n && y >= 0 && y < n) g.set(x, y, d !== 2 && d !== 4);
    }
  };
  finder(3, 3); finder(n - 4, 3); finder(3, n - 4);
  const pos = alignmentPositions(ver);
  const last = pos.length - 1;
  for (let i = 0; i <= last; i++) for (let j = 0; j <= last; j++) {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue; // under a finder
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) g.set(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  drawFormat(g, "M", 0); // reserves the format areas; redrawn with the real values later
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const a = n - 11 + (i % 3), b = Math.floor(i / 3);
      g.set(a, b, bit(bits, i)); g.set(b, a, bit(bits, i));
    }
  }
}

function drawFormat(g: Grid, ecc: Ecc, mask: number) {
  const n = g.size;
  const data = (ECC_BITS[ecc] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  for (let i = 0; i <= 5; i++) g.set(8, i, bit(bits, i));
  g.set(8, 7, bit(bits, 6)); g.set(8, 8, bit(bits, 7)); g.set(7, 8, bit(bits, 8));
  for (let i = 9; i < 15; i++) g.set(14 - i, 8, bit(bits, i));
  for (let i = 0; i < 8; i++) g.set(n - 1 - i, 8, bit(bits, i));
  for (let i = 8; i < 15; i++) g.set(8, n - 15 + i, bit(bits, i));
  g.set(8, n - 8, true); // the dark module
}

function drawCodewords(g: Grid, data: number[]) {
  const n = g.size;
  let i = 0;
  for (let right = n - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip the vertical timing column
    for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j;
      const y = ((right + 1) & 2) === 0 ? n - 1 - vert : vert;
      if (!g.fixed[y][x] && i < data.length * 8) { g.modules[y][x] = bit(data[i >>> 3], 7 - (i & 7)); i++; }
    }
  }
}

const MASKS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function applyMask(g: Grid, mask: number) {
  for (let y = 0; y < g.size; y++) for (let x = 0; x < g.size; x++)
    if (!g.fixed[y][x] && MASKS[mask](x, y)) g.modules[y][x] = !g.modules[y][x];
}

/** The specification's penalty score; the mask with the lowest one is used. */
export function penalty(m: boolean[][]): number {
  const n = m.length;
  let score = 0;
  const lines = (get: (i: number, j: number) => boolean) => {
    for (let i = 0; i < n; i++) {
      let run = 0, colour = false;
      const history = [0, 0, 0, 0, 0, 0, 0];
      const push = (len: number) => { if (history[0] === 0) len += n; history.pop(); history.unshift(len); };
      const finders = () => {
        const k = history[1];
        const core = k > 0 && history[2] === k && history[3] === k * 3 && history[4] === k && history[5] === k;
        return (core && history[0] >= k * 4 && history[6] >= k ? 1 : 0) + (core && history[6] >= k * 4 && history[0] >= k ? 1 : 0);
      };
      for (let j = 0; j < n; j++) {
        if (get(i, j) === colour) {
          run++;
          if (run === 5) score += 3; else if (run > 5) score++;
        } else {
          push(run);
          if (!colour) score += finders() * 40;
          colour = get(i, j);
          run = 1;
        }
      }
      if (colour) { push(run); run = 0; }
      push(run + n);
      score += finders() * 40;
    }
  };
  lines((i, j) => m[i][j]);
  lines((i, j) => m[j][i]);
  for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) {
    const c = m[y][x];
    if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
  }
  const dark = m.reduce((s, row) => s + row.filter(Boolean).length, 0);
  score += (Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1) * 10;
  return score;
}

/** Encodes text (as UTF-8 bytes) in the smallest version that fits. */
export function encodeQr(text: string, ecc: Ecc = "M"): Qr {
  const bytes = Array.from(new TextEncoder().encode(text));
  let ver = 1;
  const countBits = (v: number) => (v <= 9 ? 8 : 16);
  while (ver <= MAX_VERSION && 4 + countBits(ver) + bytes.length * 8 > dataCodewords(ver, ecc) * 8) ver++;
  if (ver > MAX_VERSION) throw new Error(`too long for a version ${MAX_VERSION} QR code: ${bytes.length} bytes`);

  // Mode 0100 (bytes), the length, the bytes, a terminator, then pad bytes.
  const bits: number[] = [];
  const put = (value: number, len: number) => { for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  put(0b0100, 4); put(bytes.length, countBits(ver)); bytes.forEach((b) => put(b, 8));
  const capacity = dataCodewords(ver, ecc) * 8;
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

  const g = new Grid(ver * 4 + 17);
  drawFunctionPatterns(g, ver);
  drawCodewords(g, withEcc(data, ver, ecc));
  let best = 0, bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(g, mask); drawFormat(g, ecc, mask);
    const score = penalty(g.modules);
    if (score < bestScore) { best = mask; bestScore = score; }
    applyMask(g, mask); // undo
  }
  applyMask(g, best); drawFormat(g, ecc, best);
  return { version: ver, size: g.size, modules: g.modules, mask: best };
}

/** An SVG path of the dark modules, one rectangle per run in a row, offset by a quiet zone. */
export function qrPath(qr: Qr, quiet: number): string {
  let d = "";
  qr.modules.forEach((row, y) => {
    for (let x = 0; x < qr.size; x++) {
      if (!row[x]) continue;
      let run = 1;
      while (x + run < qr.size && row[x + run]) run++;
      d += `M${x + quiet} ${y + quiet}h${run}v1h-${run}z`;
      x += run - 1;
    }
  });
  return d;
}
