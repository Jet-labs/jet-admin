# Jet Admin Docs

Docusaurus site for the Jet Admin platform documentation.

## Local development

```bash
cd docs
npm install --legacy-peer-deps
npm start
```

## Production build

```bash
cd docs
npm run build
npm run serve
```

The build output is written to `docs/build`.

## Deploy to GitHub Pages

The site uses the `gh-pages` branch:

```bash
cd docs
npm run build
npm run deploy
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` also builds and
publishes `docs/build` to the `gh-pages` branch on every push to `master`.

Production URL: <https://jet-labs.github.io/jet-admin/>

## Structure

- `docs/` — Markdown/MDX documentation, grouped by build order.
- `src/pages/index.js` — landing page.
- `static/img/screenshots/` — current product screenshots.
- `sidebars.js` — navigation structure.
- `docusaurus.config.js` — site metadata, base URL and navbar/footer.
