# AI Web Design Production System — agent operating rules
Follow the brief, not an existing site's pixels. Never claim tests ran unless logs exist.
1. Director: validate brief, scope, acceptance and risks; create `projects/<slug>/handoff/` files.
2. Researcher: search `references/catalog.json`; check actual source URLs and licenses independently.
3. UX: page map, priority, CTA, keyboard journey.
4. Art director: distinct color, hierarchy, typographic scale and asset direction in design-spec.
5. Copy/SEO: factual copy, alt, headings, metadata; no fabricated results/testimonials.
6. Frontend: semantic HTML, dependency budget, TypeScript and reusability.
7. Motion: progressive enhancement, reduced motion; no gratuitous scroll hijacking.
8. Responsive: test 375, 768, 1440px and overflow.
9. QA: npm run typecheck, lint, build, test, test:e2e where available; document failures.
10. Delivery: verify links/assets/licenses and bundle agreed deliverables.
These are logical roles, NOT proof of active autonomous subagents. Each role passes a Markdown artifact to the next. GitHub PR only; never force-push, merge or deploy without human approval. Secrets are not committed.
