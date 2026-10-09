# 初心者向け運用
1. Install Node.js 20.19+ or supported 22+ and run `npm install`.
2. Run `npm run dev` to preview the fictional SUI demo.
3. Add a unique project directory under `projects/slug/handoff` and create four Markdown files; run `npm run handoff -- projects/slug/handoff`.
4. Run `npm run references -- lifestyle green` to search metadata; shipped references are fictional.
5. Adapt copy, tokens, layout and artwork per brand; never copy third-party originals.
6. Run `npm run typecheck && npm run lint && npm test && npm run build`.
7. Run `npx playwright install chromium` then `npm run test:e2e`. Inspect screenshots, keyboard navigation and links manually. Run Lighthouse separately.
8. Submit PR and obtain approval before deployment.
Not included: autonomous agents, background execution, automatic deployment, CMS, checkout, live Work synchronization.

## 再現可能な検証と案件への再利用
- 初回および依存更新後は `npm ci`。`package-lock.json` を維持する。
- Node.js 24で検証済み。`npm run typecheck && npm run lint && npm test && npm run build`。
- Playwright: `npx playwright install chromium`。クラウドで既存Chromiumを使う場合は `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`。
- Lighthouse: ビルド後に `npm run preview -- --host 127.0.0.1 --port 4174`。別ターミナルで `CHROME_PATH=/usr/bin/chromium npx lighthouse http://127.0.0.1:4174 --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility --output=html --output=json --output-path=/tmp/sui-lighthouse`。PCは `--preset=desktop` を追加。`--no-sandbox` は隔離されたクラウド環境でのみ使用する。
- `templates/handoff/` の4ファイルを案件の `projects/<slug>/handoff/` にコピーし、空欄と「要確認」を実情報に置き換える。ファイル検証だけでは内容の完成や顧客承認を保証しない。
- フォーム、CMS、決済、計測、納品形式は案件ごとに契約範囲を決めて実装・検証する。現状のSUIは商品の販売や問い合わせ受付を行わないデモ。
- DM Sansは `@fontsource/dm-sans` からローカル配信（SIL Open Font License 1.1）。日本語は端末のフォントを使用するため、納品対象のOSで見た目を確認する。
- `.github/workflows/quality.yml` はPRで品質検証を実行する。Lighthouseと目視レビューは別途実施する。
