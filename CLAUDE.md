# PENCIL HOUR

T.OF... のアプリ。https://pencil-hour.t-of.workers.dev/（Cloudflare Workers。RULES.md §14）

- ルールは本部の `~/GitHub/tof/t-of.github.io/RULES.md` に従う（全アプリ共通）。ブランドは `docs/BRAND.md`。
- 直したら本部で `npm run audit:browser -- pencil-hour` を通す。
- 公開は本部の `docs/RELEASE.md` の手順。大きな作業は本部で Claude を起動すると、役割を分けて進められる。
- localStorage のキーは `pencil-hour.` で始める。SW のキャッシュ名は `pencil-hour-` で始める。
