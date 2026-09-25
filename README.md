# PENCIL HOUR — 大きな字のプリントを毎日刷る

計算・迷路・数字さがしの大きな字のプリントを、その場で作って A4 1 枚に刷る。「もう 1 枚」を押すたびに違う問題になり、答えの紙も一緒に出る。

## 🔗 リンク

- 使う: https://t-of.github.io/pencil-hour/
- 制作: [T.OF...](https://t-of.github.io/)

## 遊び方

1. 問題の種類（計算・迷路・数字さがし）と、難しさ（やさしい・ふつう・しっかり）を選ぶ。計算は、たし算・ひき算・かけ算・まぜる から選ぶ。
2. 見本を見て、ちがう問題がよければ「もう 1 枚」。見本の上の「問題 | 答え」で答えの紙も見られる。
3. 「印刷」で、問題と答えの 2 ページが出る（プリンターか PDF に）。「答えの紙も刷る」を外すと問題だけ。紙は A4 と US Letter。
4. 今日の日付と季節の言葉は自動で入る。紙の右下の番号（No.）が同じなら同じ問題。

- 設定と番号は URL に入る（`?t=calc&l=2&op=mix&s=482109&p=a4`）。その URL を開けば、別の端末でも同じ紙が刷れる。
- PC は `N` でもう 1 枚、`P`（または Ctrl/Cmd + P）で印刷。
- 日本語と英語。端末の言語で決まり、上の帯で切り替えられる。
- iPhone でホーム画面から開いて印刷できないときは、Safari で開く。

## アプリとして入れる（PWA）

- iPhone / iPad: Safari で開き、共有 → 「ホーム画面に追加」
- Android / PC の Chrome・Edge: 画面の「アプリにする」ボタン、またはアドレスバーのインストールボタン

## 開発

ビルド不要。フォルダをそのまま静的サーバで開く。

```sh
python3 -m http.server 8000   # → http://localhost:8000/
node test.mjs                 # 問題づくりのテスト（同じ番号で同じ問題・答え・迷路が解ける・個数）
```

| ファイル | 中身 |
|---|---|
| `puzzles.js` | 問題づくり（種つきの乱数、計算・迷路・数字さがし）。画面に触らないので node からも読める |
| `main.js` | 言葉の辞書（日本語・英語）、設定と URL、紙の組み立て、音、印刷 |
| `style.css` | 画面と紙。`@media print` で紙だけを出す。紙の大きさは `index.html` の `#page-size` を main.js が書き換える |

- 保存するのは `pencil-hour.settings` だけ（`{ v: 1, lang, sound, type, level, op, paper, answers, coached }`）。番号は保存しない。
- 広告・紹介の枠（`.slot`）は場所だけ置いてある（空で `hidden`）。印刷では必ず消える。

## 字体

紙の字は、端末に頼らず読みやすい UD 体を Google Fonts から読み込む。どちらも SIL Open Font License 1.1。

- [BIZ UDPGothic](https://fonts.google.com/specimen/BIZ+UDPGothic)（日本語）— Copyright 2022 The BIZ UDGothic Project Authors (https://github.com/googlefonts/morisawa-biz-ud-gothic)
- [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible)（英語）— Copyright 2020 Braille Institute of America, Inc.

ライセンス: https://openfontlicense.org/
