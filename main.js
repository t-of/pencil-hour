'use strict';
// 画面: 設定・見本・印刷。問題そのものは puzzles.js（PencilPuzzles.make）が作る。
// 見本と印刷は同じ紙（#paper の中の .sheet）を使い、見本は transform: scale() で縮めるだけ。

// localStorage はほかのアプリと共有される（同じ t-of.github.io のため）。
// キーは必ず 'pencil-hour.' で始める。
const STORE = 'pencil-hour.';

function load(key, fallback) {
  try {
    const v = localStorage.getItem(STORE + key);
    return v == null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(STORE + key, JSON.stringify(value)); } catch { /* 保存できなくても使える */ }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// 音を使うときは、鳴らす前と音の設定を切り替えたときにこれを呼ぶ（RULES.md §5「音」）。
function setAudioSession(soundOn) {
  try { if (navigator.audioSession) navigator.audioSession.type = soundOn ? 'playback' : 'auto'; } catch { /* 対応していない */ }
}

// ---- 言葉（画面も紙もここから引く。仕様 13） ----
const STRINGS = {
  ja: {
    'app.tagline': '大きな字のプリントを毎日刷る',
    'app.desc': '計算・迷路・数字さがしの大きな字のプリントを、その場で作って A4 1 枚に刷る。「もう 1 枚」を押すたびに違う問題になり、答えの紙も一緒に出る。',
    'type.label': '問題の種類', 'type.calc': '計算', 'type.maze': '迷路', 'type.find': '数字さがし',
    'level.label': '難しさ', 'level.1': 'やさしい', 'level.2': 'ふつう', 'level.3': 'しっかり',
    'op.label': '計算のしかた', 'op.add': 'たし算', 'op.sub': 'ひき算', 'op.mul': 'かけ算', 'op.mix': 'まぜる',
    'view.sheet': '問題', 'view.answer': '答え',
    'btn.another': 'もう 1 枚', 'btn.print': '印刷',
    'opt.answers': '答えの紙も刷る', 'opt.paper': '紙', 'opt.a4': 'A4', 'opt.letter': 'Letter',
    'opt.sound': '音', 'opt.on': 'オン', 'opt.off': 'オフ',
    'lang.other': 'English',
    'coach.1': '種類と難しさを選ぶ。',
    'coach.2': 'ちがう問題がよければ「もう 1 枚」。',
    'coach.3': '「印刷」で、問題と答えの 2 枚が出る。',
    'coach.ok': 'わかった',
    'print.iosHint': '印刷できないときは、Safari で開いてください。',
    'share.settings': 'この設定を共有',
    'share.text': '大きな字のプリントを、その場で何枚でも（{type}・{level}）— PENCIL HOUR',
    'ad.label': '広告',
    'credit': 'T.OF... のアプリ',
    'kit.install': 'アプリにする', 'kit.share': '共有',
    'sheet.name': 'なまえ',
    'sheet.calc': '計算をして、□ に答えを書きましょう。',
    'sheet.maze': 'スタートからゴールまで、線を引きましょう。',
    'sheet.start': 'スタート', 'sheet.goal': 'ゴール',
    'sheet.find': '表の中の「{n}」をぜんぶさがして、○ をつけましょう。',
    'sheet.findCount': '「{n}」は {count} こ ありました。',
    'sheet.answer': '答え', 'sheet.no': 'No. {seed}',
    season: ['新しい年。ゆっくり始めましょう', '梅の花がひらくころ', '春がすぐそこに', '桜の季節', '若葉がまぶしいころ', '雨の音を聞きながら',
      '夏の空と大きな雲', '夏のさかり。水分をとりましょう', 'お月見の季節', '実りの秋', '木の葉が色づくころ', '一年のしめくくり'],
  },
  en: {
    'app.tagline': 'Large-print puzzle sheets, fresh every day',
    'app.desc': 'Make large-print arithmetic, maze and number-search sheets on the spot and print them on one page. Every tap of “New sheet” gives new puzzles, with an answer sheet to match.',
    'type.label': 'Puzzle type', 'type.calc': 'Arithmetic', 'type.maze': 'Maze', 'type.find': 'Number search',
    'level.label': 'Difficulty', 'level.1': 'Easy', 'level.2': 'Medium', 'level.3': 'Harder',
    'op.label': 'Operation', 'op.add': 'Addition', 'op.sub': 'Subtraction', 'op.mul': 'Multiplication', 'op.mix': 'Mixed',
    'view.sheet': 'Puzzle', 'view.answer': 'Answers',
    'btn.another': 'New sheet', 'btn.print': 'Print',
    'opt.answers': 'Print the answer sheet too', 'opt.paper': 'Paper', 'opt.a4': 'A4', 'opt.letter': 'Letter',
    'opt.sound': 'Sound', 'opt.on': 'On', 'opt.off': 'Off',
    'lang.other': '日本語',
    'coach.1': 'Pick a puzzle type and difficulty.',
    'coach.2': 'Want different puzzles? Tap “New sheet”.',
    'coach.3': '“Print” gives you the puzzle and its answer sheet.',
    'coach.ok': 'Got it',
    'print.iosHint': 'If printing doesn’t start, open this page in Safari.',
    'share.settings': 'Share these settings',
    'share.text': 'Large-print puzzle sheets, as many as you like ({type}, {level}) — PENCIL HOUR',
    'ad.label': 'Ad',
    'credit': 'An app by T.OF...',
    'kit.install': 'Install', 'kit.share': 'Share',
    'sheet.name': 'Name',
    'sheet.calc': 'Work out each sum and write the answer in the box.',
    'sheet.maze': 'Draw a line from START to GOAL.',
    'sheet.start': 'START', 'sheet.goal': 'GOAL',
    'sheet.find': 'Find every {n} in the grid and circle it.',
    'sheet.findCount': 'I found {count} of the number {n}.',
    'sheet.answer': 'Answer key', 'sheet.no': 'No. {seed}',
    season: ['A new year. Let’s start slowly', 'The first blossoms open', 'Spring is on its way', 'Flowers in bloom', 'Bright new leaves', 'Listening to the rain',
      'Summer skies and tall clouds', 'High summer. Drink plenty of water', 'Harvest moon season', 'The autumn harvest', 'Leaves turn red and gold', 'The year draws to a close'],
  },
};

// ---- 設定（pencil-hour.settings）と URL ----
const TYPES = ['calc', 'maze', 'find'];
const OPS = ['add', 'sub', 'mul', 'mix'];
const PAPER = { a4: [210, 297], letter: [215.9, 279.4] };   // mm
const DEFAULTS = { v: 1, lang: null, sound: true, type: 'calc', level: 1, op: 'add', paper: null, answers: true, coached: false };
const VALID = {
  lang: (x) => x === null || x === 'ja' || x === 'en',
  sound: (x) => typeof x === 'boolean',
  type: (x) => TYPES.includes(x),
  level: (x) => [1, 2, 3].includes(x),
  op: (x) => OPS.includes(x),
  paper: (x) => x === null || x in PAPER,
  answers: (x) => typeof x === 'boolean',
  coached: (x) => typeof x === 'boolean',
};

// 読めなければはじめの値。知らない項目は捨て、足りない・おかしい項目ははじめの値で埋める
const settings = (() => {
  const s = load('settings', null);
  const out = { ...DEFAULTS };
  if (s && typeof s === 'object') for (const k in VALID) if (VALID[k](s[k])) out[k] = s[k];
  return out;
})();
const saveSettings = () => save('settings', settings);

const navLang = (navigator.language || '').toLowerCase();
const region = (navLang.split('-')[1] || '').toUpperCase();
const lang = () => settings.lang || (navLang.startsWith('ja') ? 'ja' : 'en');
const newSeed = () => 100000 + Math.floor(Math.random() * 900000);

// ?t=calc&l=2&op=mix&s=482109&p=a4 があれば、保存した設定よりそちらを使う。種は保存しない（開くたびに新しい問題）
const state = (() => {
  const q = new URLSearchParams(location.search);
  const pick = (v, ok, fallback) => (ok(v) ? v : fallback);
  return {
    type: pick(q.get('t'), VALID.type, settings.type),
    level: pick(Number(q.get('l')), VALID.level, settings.level),
    op: pick(q.get('op'), VALID.op, settings.op),
    seed: /^[1-9]\d{5}$/.test(q.get('s') || '') ? Number(q.get('s')) : newSeed(),
    // 紙のはじめの値: 地域が米国・カナダなら Letter、ほかは A4
    paper: pick(q.get('p'), (x) => x in PAPER, settings.paper || (['US', 'CA'].includes(region) ? 'letter' : 'a4')),
    view: 'puzzle',
  };
})();

function t(key, vars) {
  const s = STRINGS[lang()][key];
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k]) : s;
}

// ---- 音 ----
// 音声ファイルは使わず Web Audio で作る。職員室や家の中で使うので、とても小さく短く
let actx = null;
function audio() {
  if (!settings.sound) return null;
  setAudioSession(true);
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch { return null; }
  return actx;
}
function tone(freq, dur, { vol = 0.03, type = 'sine', at = 0 } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}
// 紙をめくるような「サッ」（高い音を落としたノイズ）
function swish(dur = 0.08, vol = 0.05) {
  const c = audio();
  if (!c) return;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 2200;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}
const SFX = {
  pick: () => tone(900, 0.03, { type: 'triangle', vol: 0.04 }),   // 種類・難しさを選ぶ「コッ」
  click: () => tone(1800, 0.015, { type: 'square', vol: 0.012 }),
  flip: () => swish(),
  print: () => { tone(523, 0.1, { vol: 0.035 }); tone(784, 0.12, { vol: 0.035, at: 0.09 }); },
  on: () => tone(880, 0.08, { vol: 0.04 }),
};

// ---- 紙 ----
const $ = (id) => document.getElementById(id);
const paperEl = $('paper');
const SIGN = { add: '+', sub: '−', mul: '×' };
const PX_PER_MM = 96 / 25.4;

function today() {
  const d = new Date();
  if (lang() === 'ja') return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（${'日月火水木金土'[d.getDay()]}）`;
  const loc = navLang.startsWith('en') ? navigator.language : 'en-US';
  return new Intl.DateTimeFormat(loc, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}
function season() {
  let m = new Date().getMonth();
  // 英語で南半球の地域は季節が逆なので、6 か月ずらす（日本語はずらさない）
  if (lang() === 'en' && ['AU', 'NZ', 'ZA', 'AR', 'CL'].includes(region)) m = (m + 6) % 12;
  return t('season')[m];
}

function sheetHtml(p, answer) {
  const no = t('sheet.no', { seed: p.seed });
  const how = p.type === 'find' ? t('sheet.find', { n: p.find.target }) : t(`sheet.${p.type}`);
  const top = answer
    ? `<strong class="sh-title">${t('sheet.answer')}　${no}</strong>`
    : `<span class="sh-name">${t('sheet.name')}<span class="sh-line"></span></span>`;
  const body = p.type === 'calc' ? calcHtml(p, answer) : p.type === 'maze' ? mazeHtml(p, answer) : findHtml(p, answer);
  return `<article class="sheet sheet--${answer ? 'answer' : 'puzzle'}" data-level="${p.level}">
    <header class="sh-head">
      <div class="sh-row">${top}<span class="sh-date">${today()}</span></div>
      <p class="sh-season">${season()}</p>
      <p class="sh-how">${how}</p>
    </header>
    <div class="sh-body sh-body--${p.type}">${body}</div>
    <footer class="sh-foot"><span class="sh-no">${no}</span><span class="sh-url">t-of.github.io/pencil-hour</span></footer>
  </article>`;
}

function calcHtml(p, answer) {
  const rows = Math.ceil(p.items.length / 2);
  return `<ol class="calc" style="grid-template-rows: repeat(${rows}, 1fr)">${p.items.map((q, i) =>
    `<li class="q"><span class="q__no">(${i + 1})</span><span class="q__n">${q.a}</span><span class="q__op">${SIGN[q.op]}</span><span class="q__n">${q.b}</span><span class="q__op">=</span><span class="q__box">${answer ? q.answer : ''}</span></li>`).join('')}</ol>`;
}

// 迷路は SVG（刷っても線がにじまない）。1 マス = 1。壁の太さはだいたい 1.4 mm になるように決める
function mazeHtml(p, answer) {
  const { w, h, right, down, path } = p.maze;
  const [pw] = PAPER[state.paper];
  const cellMm = Math.min((pw - 24) / (w + 0.6), 190 / (h + 2.2));
  const wall = 1.4 / cellMm;
  const label = Math.min(0.6, 7.5 / cellMm);
  let d = `M1 0H${w}V${h}M${w - 1} ${h}H0V0`;   // 外の壁（左上と右下はあけておく）
  for (let c = 0; c < w * h; c++) {
    const x = c % w, y = (c - x) / w;
    if (x < w - 1 && right[c]) d += `M${x + 1} ${y}v1`;
    if (y < h - 1 && down[c]) d += `M${x} ${y + 1}h1`;
  }
  const route = answer
    ? `<polyline class="mz-route" stroke-width="${2.4 / cellMm}" stroke-dasharray="0.28 0.16" points="0.5,-0.1 ${path.map((c) => `${(c % w) + 0.5},${Math.floor(c / w) + 0.5}`).join(' ')} ${w - 0.5},${h + 0.1}"/>`
    : '';
  return `<svg class="maze" viewBox="-0.3 -1.1 ${w + 0.6} ${h + 2.2}" role="img" aria-label="${t('type.maze')}">
    <text x="0" y="-0.35" font-size="${label}">${t('sheet.start')}</text>
    <text x="${w}" y="${h + 0.35 + label}" font-size="${label}" text-anchor="end">${t('sheet.goal')}</text>
    <path class="mz-wall" d="${d}" stroke-width="${wall}"/>${route}
  </svg>`;
}

function findHtml(p, answer) {
  const { n, target, count, cells } = p.find;
  const grid = cells.map((v) => `<span class="cell${answer && v === target ? ' is-hit' : ''}">${v}</span>`).join('');
  const blank = `<span class="blank">${answer ? count : ''}</span>`;
  return `<div class="find" style="--n: ${n}">${grid}</div>
    <p class="find__count">${t('sheet.findCount', { n: target, count: blank })}</p>`;
}

function render() {
  const p = PencilPuzzles.make(state);
  paperEl.innerHTML = sheetHtml(p, false) + sheetHtml(p, true);
  paperEl.dataset.view = state.view;
  paperEl.dataset.paper = state.paper;
  paperEl.classList.toggle('no-answers', !settings.answers);
  fit();
}

// 見本: 紙を画面の幅（PC は高さも）に収まるように縮める
function fit() {
  const [pw, ph] = PAPER[state.paper];
  const sw = pw * PX_PER_MM, sh = ph * PX_PER_MM;
  const box = $('frame').parentElement.clientWidth;
  let s = box / sw;
  if (matchMedia('(min-width: 900px)').matches) s = Math.min(s, Math.max(0.3, (innerHeight - 150) / sh));
  $('frame').style.width = `${sw * s}px`;
  $('frame').style.height = `${sh * s}px`;
  paperEl.style.transform = `scale(${s})`;
}

// ---- 画面 ----
function applyLang() {
  const L = lang();
  document.documentElement.lang = L;
  document.title = `PENCIL HOUR — ${t('app.tagline')}`;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  $('sound-state').textContent = t(settings.sound ? 'opt.on' : 'opt.off');
  WebAppKit.init({ lang: L, title: 'PENCIL HOUR', text: t('app.desc') });
}

function update() {
  document.querySelectorAll('.seg[data-key]').forEach((seg) => {
    const v = String(state[seg.dataset.key]);
    seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  });
  $('op-field').hidden = state.type !== 'calc';
  $('answers').checked = settings.answers;
  $('sound').setAttribute('aria-pressed', String(settings.sound));
  $('page-size').textContent = `@page { size: ${state.paper === 'a4' ? 'A4' : 'letter'} portrait; margin: 0; }`;
  const q = new URLSearchParams({ t: state.type, l: state.level });
  if (state.type === 'calc') q.set('op', state.op);
  q.set('s', state.seed);
  q.set('p', state.paper);
  history.replaceState(null, '', `?${q}`);
  render();
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('.seg[data-key] button');
  if (!b) return;
  const key = b.closest('.seg').dataset.key;
  const v = key === 'level' ? Number(b.dataset.v) : b.dataset.v;
  if (state[key] === v) return;
  state[key] = v;
  if (key === 'view') SFX.click();
  else if (key === 'paper') { SFX.click(); settings.paper = v; }
  else { SFX.pick(); settings[key] = v; }
  saveSettings();
  update();
});

function another() {
  SFX.flip();
  state.seed = newSeed();
  update();
}

// window.print と名前がぶつからないように printSheets にする
function printSheets() {
  SFX.print();
  render();   // 日付が変わっていてもよいように、刷る直前に作り直す
  // 音が鳴ってから印刷画面を出す（印刷画面が出ている間は音が止まる）
  setTimeout(() => document.fonts.ready.then(() => window.print()), 200);
}

$('another').addEventListener('click', another);
$('print').addEventListener('click', printSheets);
$('answers').addEventListener('change', (e) => {
  SFX.click();
  settings.answers = e.target.checked;
  saveSettings();
  render();
});
$('lang').addEventListener('click', () => {
  SFX.click();
  settings.lang = lang() === 'ja' ? 'en' : 'ja';
  saveSettings();
  applyLang();
  render();
});
$('sound').addEventListener('click', () => {
  settings.sound = !settings.sound;
  setAudioSession(settings.sound);
  saveSettings();
  applyLang();
  update();
  if (settings.sound) SFX.on();
});
$('share-settings').addEventListener('click', () => {
  SFX.click();
  WebAppKit.share({ text: t('share.text', { type: t(`type.${state.type}`), level: t(`level.${state.level}`) }), url: location.href });
});
$('coach-ok').addEventListener('click', () => {
  SFX.click();
  settings.coached = true;
  saveSettings();
  $('coach').hidden = true;
});

// PC: N でもう 1 枚、P で印刷（Ctrl/Cmd + P はブラウザの印刷のまま。印刷用の CSS は常にある）
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  if (e.key === 'n' || e.key === 'N') another();
  else if (e.key === 'p' || e.key === 'P') printSheets();
});
// Ctrl/Cmd + P で刷るときも今日の日付にする
addEventListener('beforeprint', render);

// iPhone でホーム画面から開いたときは window.print() が動かないことがある（仕様 4）
$('ios-hint').hidden = !(WebAppKit.platform.isIOS && WebAppKit.isStandalone());
$('coach').hidden = settings.coached;

applyLang();
update();
new ResizeObserver(fit).observe($('frame').parentElement);
