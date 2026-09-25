'use strict';

// 問題づくり。画面にも保存にも触らない（node の test.mjs からも読む）。
// 同じ番号（種）・同じ設定なら、いつ・どの端末で作っても同じ問題になる。
(function (root) {
  // 種つきの乱数（mulberry32）。0 以上 1 未満を返す
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // 設定を種にまぜる（同じ番号でも、種類や難しさが違えば別の問題）
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

  // ---- 計算 ----
  // 仕様の表どおり。+0・×1 は出さない。答えは 1 以上（マイナスにならない）
  const CALC_COUNT = { 1: 10, 2: 15, 3: 20 };
  const CALC = {
    add: {
      1: (r) => [int(r, 1, 9), int(r, 1, 9)],
      2: (r) => { const u = int(r, 1, 9); return [int(r, 1, 9) * 10 + u, int(r, 10 - u, 9)]; },   // 繰り上がりあり
      3: (r) => [int(r, 10, 99), int(r, 10, 99)],
    },
    sub: {
      1: (r) => { const a = int(r, 2, 18); return [a, int(r, Math.max(1, a - 9), Math.min(9, a - 1))]; },
      2: (r) => { const u = int(r, 0, 8); return [int(r, 1, 9) * 10 + u, int(r, u + 1, 9)]; },    // 繰り下がりあり
      3: (r) => { const a = int(r, 11, 99); return [a, int(r, 10, a - 1)]; },
    },
    mul: {
      1: (r) => [int(r, 2, 5), int(r, 2, 9)],    // 九九の 2〜5 の段
      2: (r) => [int(r, 2, 9), int(r, 2, 9)],
      3: (r) => [int(r, 11, 99), int(r, 2, 9)],
    },
  };
  const OPS = ['add', 'sub', 'mul'];
  const answerOf = (op, a, b) => (op === 'add' ? a + b : op === 'sub' ? a - b : a * b);

  function calc(r, level, op) {
    const out = [];
    const seen = new Set();
    for (let guard = 0; out.length < CALC_COUNT[level] && guard < 10000; guard++) {
      const o = op === 'mix' ? OPS[int(r, 0, 2)] : op;
      const [a, b] = CALC[o][level](r);
      const key = `${a}${o}${b}`;
      if (seen.has(key)) continue;   // 同じ紙に同じ問題を出さない
      seen.add(key);
      out.push({ a, op: o, b, answer: answerOf(o, a, b) });
    }
    return out;
  }

  // ---- 迷路 ----
  // 穴を掘る方法（深さ優先）で作る。ループがなく、どのマスにも道は 1 本だけ。
  // right[i] / down[i] が true ならそのマスの右 / 下に壁がある。左上がスタート、右下がゴール
  const MAZE_SIZE = { 1: [5, 7], 2: [8, 11], 3: [11, 15] };

  function maze(r, level) {
    const [w, h] = MAZE_SIZE[level];
    const n = w * h;
    const right = new Array(n).fill(true);
    const down = new Array(n).fill(true);
    const seen = new Array(n).fill(false);
    const stack = [0];
    seen[0] = true;
    while (stack.length) {
      const c = stack[stack.length - 1];
      const x = c % w, y = (c - x) / w;
      const next = [];
      if (x > 0 && !seen[c - 1]) next.push(c - 1);
      if (x < w - 1 && !seen[c + 1]) next.push(c + 1);
      if (y > 0 && !seen[c - w]) next.push(c - w);
      if (y < h - 1 && !seen[c + w]) next.push(c + w);
      if (!next.length) { stack.pop(); continue; }
      const d = next[int(r, 0, next.length - 1)];
      if (d === c + 1) right[c] = false;
      else if (d === c - 1) right[d] = false;
      else if (d === c + w) down[c] = false;
      else down[d] = false;
      seen[d] = true;
      stack.push(d);
    }
    return { w, h, right, down, path: solve(w, h, right, down) };
  }

  // となりのマスへ行けるか（壁がないか）
  function neighbors(w, h, right, down, c) {
    const x = c % w, y = (c - x) / w;
    const out = [];
    if (x < w - 1 && !right[c]) out.push(c + 1);
    if (x > 0 && !right[c - 1]) out.push(c - 1);
    if (y < h - 1 && !down[c]) out.push(c + w);
    if (y > 0 && !down[c - w]) out.push(c - w);
    return out;
  }

  // スタートからゴールまでの道（マスの番号の並び）
  function solve(w, h, right, down) {
    const goal = w * h - 1;
    const from = new Array(w * h).fill(-1);
    from[0] = 0;
    const queue = [0];
    for (let i = 0; i < queue.length; i++) {
      for (const d of neighbors(w, h, right, down, queue[i])) {
        if (from[d] === -1) { from[d] = queue[i]; queue.push(d); }
      }
    }
    const path = [goal];
    while (path[0] !== 0) path.unshift(from[path[0]]);
    return path;
  }

  // ---- 数字さがし ----
  // しっかりは、見分けにくい数字（6 と 9、3 と 8 など）をさがす数字にして、まわりに多めにまぜる
  const FIND = { 1: { n: 6, min: 4, max: 6 }, 2: { n: 8, min: 6, max: 9 }, 3: { n: 10, min: 8, max: 12 } };
  const LOOKALIKE = { 3: [8], 6: [9, 8], 8: [3, 6], 9: [6] };

  function find(r, level) {
    const { n, min, max } = FIND[level];
    const target = level === 3 ? [3, 6, 8, 9][int(r, 0, 3)] : int(r, 1, 9);
    const count = int(r, min, max);
    const order = Array.from({ length: n * n }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = int(r, 0, i); [order[i], order[j]] = [order[j], order[i]]; }
    const cells = new Array(n * n);
    order.forEach((cell, k) => {
      if (k < count) { cells[cell] = target; return; }
      if (level === 3 && r() < 0.4) { const alike = LOOKALIKE[target]; cells[cell] = alike[int(r, 0, alike.length - 1)]; return; }
      let d;
      do d = int(r, 0, 9); while (d === target);
      cells[cell] = d;
    });
    return { n, target, count, cells };
  }

  // 1 枚ぶんの問題。type: 'calc' | 'maze' | 'find'、level: 1〜3、op: 'add' | 'sub' | 'mul' | 'mix'、seed: 6 桁の数
  function make({ type, level, op, seed }) {
    const r = rng(hash(`${seed}|${type}|${level}|${type === 'calc' ? op : ''}`));
    if (type === 'calc') return { type, level, op, seed, items: calc(r, level, op) };
    if (type === 'maze') return { type, level, seed, maze: maze(r, level) };
    return { type, level, seed, find: find(r, level) };
  }

  root.PencilPuzzles = { make, neighbors, CALC_COUNT, MAZE_SIZE, FIND };
})(globalThis);
