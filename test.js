const { test } = require('node:test');
const assert = require('node:assert/strict');
const Wheel = require('./wheel.js');

const TAU = 2 * Math.PI;
const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
const approx = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`);

test('SEG_ANGLE', () => {
  approx(Wheel.SEG_ANGLE(4), Math.PI / 2);
  approx(Wheel.SEG_ANGLE(1), TAU);
});

test('winnerIndex basic quadrants (n=4)', () => {
  assert.equal(Wheel.winnerIndex(0, 4), 3);
  assert.equal(Wheel.winnerIndex(Math.PI / 2, 4), 2);
  assert.equal(Wheel.winnerIndex(-Math.PI / 2, 4), 0);
  assert.equal(Wheel.winnerIndex(Math.PI, 4), 1);
});

test('winnerIndex invariant under full turns', () => {
  for (const n of [2, 3, 5, 7, 12]) {
    const r = rnd(-20, 20);
    for (const k of [-3, 1, 5]) {
      assert.equal(Wheel.winnerIndex(r + TAU * k, n), Wheel.winnerIndex(r, n), `n=${n} r=${r} k=${k}`);
    }
  }
});

test('winnerIndex always an integer in [0, n)', () => {
  for (let i = 0; i < 200; i++) {
    const n = 1 + Math.floor(Math.random() * 30);
    const idx = Wheel.winnerIndex(rnd(-50, 50), n);
    assert.ok(Number.isInteger(idx) && idx >= 0 && idx < n, `n=${n} idx=${idx}`);
  }
});

test('winnerIndex n=1 is always 0', () => {
  for (const r of [0, 1, -1, 100, -100, Math.PI]) assert.equal(Wheel.winnerIndex(r, 1), 0);
});

test('winnerIndex segment-start boundary (n=6)', () => {
  // Segment i starts exactly at the pointer when rotation = 3PI/2 - i*seg.
  // Floating error could land a hair before the start, so nudge the pointer
  // into the segment by 1e-9 rad (segment is half-open [start, end)).
  const seg = Wheel.SEG_ANGLE(6);
  for (let i = 0; i < 6; i++) {
    assert.equal(Wheel.winnerIndex(1.5 * Math.PI - i * seg - 1e-9, 6), i, `i=${i}`);
  }
});

test('winnerIndex sweep covers every index (n=8)', () => {
  const seen = new Set();
  for (let s = 0; s < 1000; s++) seen.add(Wheel.winnerIndex((s / 1000) * TAU, 8));
  assert.deepEqual([...seen].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7]);
});

test('PALETTE is >= 10 hex colors', () => {
  assert.ok(Array.isArray(Wheel.PALETTE));
  assert.ok(Wheel.PALETTE.length >= 10);
  for (const c of Wheel.PALETTE) assert.match(c, /^#[0-9a-f]{6}$/i);
});

// run: node --test test.js
