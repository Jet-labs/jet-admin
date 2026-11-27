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

Pushing to `master` triggers `.github/workflows/deploy.yml`, which:

1. installs dependencies with `npm ci --legacy-peer-deps`;
2. builds the site;
3. uploads `docs/build` as a GitHub Pages artifact;
4. deploys the artifact with `actions/deploy-pages`.

The repository's **Settings → Pages → Build and deployment → Source** must be set
to **GitHub Actions**. The workflow can also be started manually with
`workflow_dispatch`.

Production URL: <https://jet-labs.github.io/jet-admin/>

The legacy `npm run deploy` script publishes the local `build` directory to the
`gh-pages` branch. It is not used by the current Pages deployment.

## Structure

- `docs/` — Markdown/MDX documentation, grouped by build order.
- `src/pages/index.js` — landing page.
- `static/img/screenshots/` — current product screenshots.
- `sidebars.js` — navigation structure.
- `docusaurus.config.js` — site metadata, base URL and navbar/footer.
