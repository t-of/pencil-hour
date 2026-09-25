// 問題づくりのテスト。node test.mjs で走る（フレームワークなし）。
// puzzles.js を読み、同じ番号で同じ問題 / 計算の答え / 迷路が必ず解ける / 数字さがしの個数を、1,000 個の番号で確かめる。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

vm.runInThisContext(fs.readFileSync(new URL('./puzzles.js', import.meta.url), 'utf8'), { filename: 'puzzles.js' });
const { make, neighbors, CALC_COUNT, MAZE_SIZE, FIND } = globalThis.PencilPuzzles;

const test = (name, fn) => { fn(); console.log('✓', name); };
const SEEDS = Array.from({ length: 1000 }, (_, i) => 100000 + i * 899);
const LEVELS = [1, 2, 3];
const SETTINGS = [
  ...['add', 'sub', 'mul', 'mix'].flatMap((op) => LEVELS.map((level) => ({ type: 'calc', level, op }))),
  ...LEVELS.map((level) => ({ type: 'maze', level })),
  ...LEVELS.map((level) => ({ type: 'find', level })),
];

test('同じ番号・同じ設定なら同じ問題、番号が違えば違う問題', () => {
  const body = (p) => p.items ?? p.maze ?? p.find;
  for (const s of SETTINGS) {
    assert.deepEqual(make({ ...s, seed: 482109 }), make({ ...s, seed: 482109 }));
    assert.notDeepEqual(body(make({ ...s, seed: 482109 })), body(make({ ...s, seed: 482110 })));
  }
});

const digits = (v) => String(v).length;

test('計算: 問題数が表どおり、答えが合う、マイナスなし、同じ問題なし、+0・×1 なし', () => {
  for (const s of SETTINGS.filter((x) => x.type === 'calc')) {
    for (const seed of SEEDS) {
      const { items } = make({ ...s, seed });
      assert.equal(items.length, CALC_COUNT[s.level], `${s.op} ${s.level} ${seed}`);
      assert.equal(new Set(items.map((q) => `${q.a}${q.op}${q.b}`)).size, items.length);
      for (const { a, op, b, answer } of items) {
        if (s.op !== 'mix') assert.equal(op, s.op);
        assert.equal(answer, op === 'add' ? a + b : op === 'sub' ? a - b : a * b);
        assert.ok(answer >= 1, `${a} ${op} ${b}`);
        assert.ok(b >= 1 && (op !== 'mul' || (a >= 2 && b >= 2)), `${a} ${op} ${b}`);
        // 難しさごとの桁
        const L = s.level;
        if (op === 'add') {
          if (L === 1) assert.ok(a <= 9 && b <= 9);
          if (L === 2) assert.ok(digits(a) === 2 && b <= 9 && (a % 10) + b >= 10, `繰り上がり ${a}+${b}`);
          if (L === 3) assert.ok(digits(a) === 2 && digits(b) === 2);
        }
        if (op === 'sub') {
          if (L === 1) assert.ok(a <= 18 && b <= 9);
          if (L === 2) assert.ok(digits(a) === 2 && b <= 9 && a % 10 < b, `繰り下がり ${a}-${b}`);
          if (L === 3) assert.ok(digits(a) === 2 && digits(b) === 2);
        }
        if (op === 'mul') {
          if (L === 1) assert.ok(a <= 5 && b <= 9);
          if (L === 2) assert.ok(a <= 9 && b <= 9);
          if (L === 3) assert.ok(digits(a) === 2 && b <= 9);
        }
      }
    }
  }
});

test('迷路: 大きさが表どおり、どのマスにも行けて、道が 1 本（つながり = マス − 1）、答えの道がつながっている', () => {
  for (const level of LEVELS) {
    for (const seed of SEEDS) {
      const { w, h, right, down, path } = make({ type: 'maze', level, seed }).maze;
      assert.deepEqual([w, h], MAZE_SIZE[level]);
      const n = w * h;
      let links = 0;
      for (let c = 0; c < n; c++) {
        if (c % w < w - 1 && !right[c]) links++;
        if (c + w < n && !down[c]) links++;
      }
      assert.equal(links, n - 1);
      const seen = new Set([0]);
      const queue = [0];
      for (let i = 0; i < queue.length; i++) {
        for (const d of neighbors(w, h, right, down, queue[i])) if (!seen.has(d)) { seen.add(d); queue.push(d); }
      }
      assert.equal(seen.size, n, `すべてのマスに行ける ${level} ${seed}`);
      assert.equal(path[0], 0);
      assert.equal(path[path.length - 1], n - 1);
      assert.equal(new Set(path).size, path.length);
      for (let i = 1; i < path.length; i++) assert.ok(neighbors(w, h, right, down, path[i - 1]).includes(path[i]));
    }
  }
});

test('数字さがし: 表の大きさ、個数が範囲の中で、答えの個数と表の中の数が合う', () => {
  for (const level of LEVELS) {
    for (const seed of SEEDS) {
      const { n, target, count, cells } = make({ type: 'find', level, seed }).find;
      const rule = FIND[level];
      assert.equal(n, rule.n);
      assert.equal(cells.length, n * n);
      assert.ok(count >= rule.min && count <= rule.max);
      assert.equal(cells.filter((d) => d === target).length, count);
      assert.ok(cells.every((d) => Number.isInteger(d) && d >= 0 && d <= 9));
      if (level === 3) assert.ok([3, 6, 8, 9].includes(target));
    }
  }
});
