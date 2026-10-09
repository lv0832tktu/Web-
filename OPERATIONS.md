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
