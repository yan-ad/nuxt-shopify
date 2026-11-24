# `@yan-ad/nuxt-shopify`

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![npm version](https://badge.fury.io/js/%40yan-ad%2Fnuxt-shopify.svg)](https://badge.fury.io/js/%40yan-ad%2Fnuxt-shopify)
[![NPM Downloads](https://img.shields.io/npm/dm/@yan-ad/nuxt-shopify)](https://npmtrends.com/%40yan-ad%2Fnuxt-shopify)
[![Nuxt](https://img.shields.io/badge/Nuxt-020420?logo=nuxt)](https://nuxt.com)

A [Nuxt](https://nuxt.com/) module for building Shopify apps — authentication, webhooks, billing, Polaris components, and App Bridge integration. The Nuxt equivalent of `@shopify/shopify-app-react-router`.

> [!IMPORTANT]
> This package is a **release candidate**. The API is mostly stable but may still change before the 1.0 release.

## Quick start

Requires Nuxt **4.7+** and Nitro **v3** (currently a release candidate).
For Node.js deployments, use **Node.js 22.22+** (Node 24 LTS recommended).
Shopify OAuth uses the Node adapter and requires a Node-compatible server runtime.

```bash
bun add nitro@3.0.261103-rc
npx nuxi@latest module add @yan-ad/nuxt-shopify
```

Declare `nitro` directly in your app's dependencies so Nuxt selects its Nitro v3
server integration. Nitro v2 / H3 v1 are no longer supported by this module.

Then configure your API credentials and app URL in `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@yan-ad/nuxt-shopify'],
  shopify: {
    apiKey: 'your-api-key',
    apiSecretKey: 'your-api-secret',
    appUrl: 'https://your-app-url.com'
  }
})
```

## Documentation

For full documentation, guides, and API reference, visit the docs:

**[https://shopify-app-nuxt.vercel.app](https://shopify-app-nuxt.vercel.app)**

## License

[MIT](LICENSE.md)

## Contributing

### Local development

```bash
# Install dependencies
bun install

# Generate type stubs
bun run dev:prepare

# Develop with the playground
bun run dev

# Build the playground
bun run dev:build

# Run Oxlint (or apply safe fixes with bun run lint:fix)
bun run lint

# Run Vitest
bun run test
bun run test:watch

# Release new version
bun run release
```

### Formatting in Zed

Run `bun install` and open the **repository root** in Zed. Install the
[Oxc extension](https://zed.dev/extensions/oxc) for Oxlint diagnostics and safe
fixes, plus the Vue extension for Vue language support. Restart language servers
after changing `.zed/settings.json`.

Saving Vue, TypeScript, TSX, JavaScript, or JSX runs safe Oxlint fixes first, then
the project-local Oxfmt formatter. Prettier fallback is disabled. Formatting uses
`bun run --silent format:stdin --stdin-filepath <file>` with the editor buffer on
stdin; it does not download a formatter on save. Bun must be available to Zed.

The shared `.oxfmtrc.json` uses two spaces, single quotes, no semicolons, and an
80-column print width. Vue templates, scripts, and styles are formatted together.
Generated output and dependencies are excluded.

```bash
bun run format:code       # Format all Vue/TS/JS source files
bun run format:code:check # Check source formatting without writing
bun run lint:fix          # Apply safe lint fixes
bun run format           # Format all supported files, including docs
```

If formatting does not run, check `zed: open log`, confirm Bun is on Zed's PATH,
and run `editor: format` to test the configured formatter manually.

</details>