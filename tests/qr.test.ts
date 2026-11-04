// The packet's QR code (src/qr.ts). A test can't point a camera at it, so this
// checks the parts the specification fixes: sizes and capacities, the finder,
// timing and dark modules, and that the format information reads back as level
// M with the mask used. When it was written, every code for 377 strings
// (versions 1-10, all four levels, every mask, UTF-8 Spanish) was also decoded
// with ZXing and read back exactly, and the How-we-know code still read with a
// 4x4 block of modules smudged.
import { describe, expect, it } from "vitest";
import { alignmentPositions, encodeQr, qrPath, type Ecc } from "../src/qr";

const LIVE = "https://first-id.vercel.app/#/sources";

/** Byte-mode capacity at level M for versions 1-10, from the specification's table. */
const CAPACITY_M = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213];

describe("QR code: size and capacity", () => {
  it.each(CAPACITY_M.map((cap, i) => [i + 1, cap] as const))("version %i holds %i bytes at level M, and one more needs the next version", (ver, cap) => {
    expect(encodeQr("a".repeat(cap)).version).toBe(ver);
    if (ver < 10) expect(encodeQr("a".repeat(cap + 1)).version).toBe(ver + 1);
  });

  it("is 17 + 4 x version modules a side", () => {
    for (const len of [1, 30, 100, 200]) {
      const q = encodeQr("x".repeat(len));
      expect(q.size).toBe(17 + 4 * q.version);
      expect(q.modules).toHaveLength(q.size);
      for (const row of q.modules) expect(row).toHaveLength(q.size);
    }
  });

  it("counts UTF-8 bytes, not characters", () => {
    expect(encodeQr("ñ".repeat(7)).version).toBe(1);  // 14 bytes
    expect(encodeQr("ñ".repeat(8)).version).toBe(2);  // 16 bytes
  });

  it("refuses text too long for version 10", () => {
    expect(() => encodeQr("a".repeat(214))).toThrow(/too long/);
  });

  it("puts alignment patterns where the specification does", () => {
    expect(alignmentPositions(1)).toEqual([]);
    expect(alignmentPositions(2)).toEqual([6, 18]);
    expect(alignmentPositions(7)).toEqual([6, 22, 38]);
    expect(alignmentPositions(10)).toEqual([6, 28, 50]);
  });
});

describe("QR code: fixed patterns", () => {
  const q = encodeQr(LIVE);
  const m = q.modules, n = q.size;

  it("the How-we-know link fits a version 3 code at level M", () => {
    expect(q.version).toBe(3);
  });

  it("has the three finder patterns, each with its light separator", () => {
    const finder = (x0: number, y0: number) => {
      for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
        const x = x0 + dx, y = y0 + dy;
        if (x < 0 || y < 0 || x >= n || y >= n) continue;
        const d = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
        expect(m[y][x], `finder at ${x0},${y0}: ${dx},${dy}`).toBe(d !== 2 && d !== 4);
      }
    };
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  });

  it("has alternating timing patterns and the dark module", () => {
    for (let i = 8; i < n - 8; i++) { expect(m[6][i]).toBe(i % 2 === 0); expect(m[i][6]).toBe(i % 2 === 0); }
    expect(m[n - 8][8]).toBe(true);
  });

  it("its format information reads back as level M and the mask it used, in both copies", () => {
    const read = (cells: [number, number][]) => cells.reduce((v, [x, y], i) => v | (Number(m[y][x]) << i), 0);
    const first: [number, number][] = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
    const second: [number, number][] = [...Array.from({ length: 8 }, (_, i) => [n - 1 - i, 8] as [number, number]), ...Array.from({ length: 7 }, (_, i) => [8, n - 7 + i] as [number, number])];
    for (const cells of [first, second]) {
      const bits = read(cells) ^ 0x5412;
      const data = bits >>> 10;
      let rem = data;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      expect(bits & 0x3ff, "BCH check bits").toBe(rem & 0x3ff);
      expect(data >>> 3, "level M").toBe(0b00);
      expect(data & 7, "mask").toBe(q.mask);
    }
  });

  it("each level writes its own format bits", () => {
    const levels: Ecc[] = ["L", "M", "Q", "H"];
    const expected = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };
    for (const ecc of levels) {
      const c = encodeQr(LIVE, ecc).modules;
      const cells: [number, number][] = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
      const bits = cells.reduce((v, [x, y], i) => v | (Number(c[y][x]) << i), 0) ^ 0x5412;
      expect(bits >>> 13, ecc).toBe(expected[ecc]);
    }
  });
});

describe("QR code: drawing and stability", () => {
  it("the SVG path covers exactly the dark modules", () => {
    const q = encodeQr(LIVE);
    const dark = q.modules.flat().filter(Boolean).length;
    const area = [...qrPath(q, 4).matchAll(/h(\d+)/g)].reduce((s, m) => s + Number(m[1]), 0);
    expect(area).toBe(dark);
    expect(qrPath(q, 4)).toMatch(/^M4 4h7v1h-7z/); // the top-left finder's first row, after the quiet zone
  });

  it("encodes the live How-we-know link the same way every time", () => {
    const pack = (s: string) => encodeQr(s).modules.map((r) => r.map((b) => (b ? 1 : 0)).join("")).join("/");
    expect(pack(LIVE)).toBe(pack(LIVE));
    // A fingerprint of the code that was decoded with ZXing when this was written.
    let h = 0;
    for (const ch of pack(LIVE)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    expect({ mask: encodeQr(LIVE).mask, fingerprint: h }).toMatchInlineSnapshot(`
      {
        "fingerprint": 188285809,
        "mask": 2,
      }
    `);
  });
});
