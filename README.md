<div align="center">

# `@yan-ad/nuxt-shopify`

### Build Shopify apps with Nuxt.

Authentication, webhooks, billing, Polaris components, and App Bridge integration — together in one Nuxt module.

[Documentation](https://shopify.yan.ad) · [Getting started](https://shopify.yan.ad/getting-started/installation) · [Components](https://shopify.yan.ad/components) · [Report an issue](https://github.com/yan-ad/nuxt-shopify/issues)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/%40yan-ad%2Fnuxt-shopify.svg)](https://badge.fury.io/js/%40yan-ad%2Fnuxt-shopify)
[![NPM Downloads](https://img.shields.io/npm/dm/@yan-ad/nuxt-shopify)](https://npmtrends.com/%40yan-ad%2Fnuxt-shopify)
[![Nuxt](https://img.shields.io/badge/Nuxt-020420?logo=nuxt)](https://nuxt.com)

</div>

---

A [Nuxt](https://nuxt.com/) module for building Shopify apps — authentication, webhooks, billing, Polaris components, and App Bridge integration. The Nuxt equivalent of `@shopify/shopify-app-react-router`.

## Built for the Shopify app workflow

| Capability                | What you get                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**        | Embedded token exchange, OAuth routes, expiring offline tokens, and automatic refresh and legacy-token migration.                             |
| **Admin API**             | Authenticated server utilities and a session-token-aware `useShopifyFetch` for app endpoints.                                                 |
| **Polaris v2**            | Auto-imported `Sh*` Vue wrappers with typed props, form bindings, and client-only rendering.                                                  |
| **App Bridge**            | Shopify admin integration, navigation, and UI wrappers.                                                                                       |
| **Webhooks & billing**    | Authentication helpers, webhook registration utilities, and configurable billing support.                                                     |
| **Developer experience**  | Optional GraphQL codegen, a Shopify DevTools tab, and an authenticated standalone development handoff.                                        |
| **Interactive reference** | Live component previews with editable properties and copyable Vue snippets at [shopify.yan.ad/components](https://shopify.yan.ad/components). |

> [!IMPORTANT]
> This project uses **Nitro v3**, which is currently a release candidate. Review compatibility and test your deployment before using it in production.

## Quick start

### 1. Install

Requires **Nuxt 4.7+**, **Nitro v3**, and a **Node-compatible server runtime** for Shopify OAuth. Use **Node.js 22.22+**; Node 24 LTS is recommended.

```bash
bun add nitro@3.0.261103-rc
bunx nuxi@latest module add @yan-ad/nuxt-shopify
```

Declare `nitro` directly in your app's dependencies so Nuxt selects its Nitro v3 server integration. Nitro v2 / H3 v1 are no longer supported by this module.

### 2. Configure your app

Keep credentials in environment variables, not source control:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@yan-ad/nuxt-shopify'],
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY || '',
    apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
    appUrl: process.env.SHOPIFY_APP_URL || '',
    scopes: ['read_products']
  }
})
```

The module discovers the app handle from matching `shopify.app.toml` configuration in your Nuxt app root. Set `shopify.appHandle` explicitly when that file is unavailable at build time.

Configure and approve the corresponding Shopify app access scopes, and allow your app's `/_shopify/auth/callback` URL. Nuxt configuration alone does not grant store permissions.

### 3. Build with Vue

Components use the `Sh` prefix by default and are auto-imported:

```vue
<template>
  <ShApp>
    <ShPage heading="My Shopify app">
      <ShSection heading="Ready to build">
        <ShParagraph>Your Nuxt app, inside Shopify admin.</ShParagraph>
        <ShButton href="/products" variant="primary">View products</ShButton>
      </ShSection>
    </ShPage>
  </ShApp>
</template>
```

Polaris wrappers mount client-side to avoid custom-element hydration conflicts. Shopify-hosted App Bridge features require an embedded admin context.

## Documentation

**[shopify.yan.ad](https://shopify.yan.ad)** — full documentation, guides, and API reference.

- [Installation](https://shopify.yan.ad/getting-started/installation) — set up your Nuxt app.
- [Configuration](https://shopify.yan.ad/getting-started/configuration) — credentials, module options, and app-handle discovery.
- [Components](https://shopify.yan.ad/components) — Polaris v2 and App Bridge wrappers with interactive previews.
- [Playground](./playground/README.md) — real store data, product search, pagination, and persisted app preferences.

## Local development

The playground uses Shopify CLI to manage the tunnel and app preview. Supply your own Shopify app configuration and development-store credentials, then run from the repository root:

```bash
bun install
bun run dev
```

`bun run dev` prepares the module and starts `shopify app dev` in the playground. There is no need to start a separate Nuxt server.

| Command                                                     | Purpose                               |
| ----------------------------------------------------------- | ------------------------------------- |
| `bun run dev:prepare`                                       | Generate module stubs and Nuxt types. |
| `bun run dev`                                               | Develop through Shopify CLI.          |
| `bun run dev:build`                                         | Build the playground for production.  |
| `cd docs && bun install --frozen-lockfile && bun run build` | Install and build the documentation.  |
| `bun run lint`                                              | Run Oxlint.                           |
| `bun run lint:fix`                                          | Apply safe lint fixes.                |
| `bun run test`                                              | Run Vitest.                           |
| `bun run test:watch`                                        | Run tests in watch mode.              |
| `bun run test:types`                                        | Check module and playground types.    |
| `bun run prepack`                                           | Build the distributable module.       |

### Shopify DevTools and standalone mode

The playground pins Nuxt DevTools to **v3.4.4** for Shopify CLI compatibility. In development, the **Shopify** tab shows authenticated store information, installed scopes, and token-expiry metadata without exposing credentials.

**Open Standalone** hands off an existing authenticated session to a new app tab. It uses a short-lived, single-use ticket and a protected development cookie—not fabricated Shopify ID tokens. A limited App Bridge shim provides local development behavior; it does not reproduce the Shopify admin host.

> [!WARNING]
> Standalone connections authorize real API requests with the connected session's permissions. Do not share handoff links or cookies. Use durable session storage in production, preserve refresh-token fields, and coordinate token rotation across multiple workers. The default memory adapter is for development.

## Contributing

Issues and pull requests are welcome. Keep changes focused and run lint, source formatting, tests, and type checks before submitting.

### Formatting in Zed

Run `bun install` and open the **repository root** in Zed. Install the [Oxc extension](https://zed.dev/extensions/oxc) for Oxlint diagnostics and safe fixes, plus the Vue extension for Vue language support. Restart language servers after changing `.zed/settings.json`.

Saving Vue, TypeScript, TSX, JavaScript, or JSX runs safe Oxlint fixes first, then the project-local Oxfmt formatter. Prettier fallback is disabled. Formatting uses `bun run --silent format:stdin --stdin-filepath <file>` with the editor buffer on stdin; it does not download a formatter on save. Bun must be available to Zed.

The shared `.oxfmtrc.json` uses two spaces, single quotes, no semicolons, and an 80-column print width. Vue templates, scripts, and styles are formatted together. Generated output and dependencies are excluded.

```bash
bun run format:code       # Format all Vue/TS/JS source files
bun run format:code:check # Check source formatting without writing
bun run lint:fix          # Apply safe lint fixes
bun run format           # Format all supported files, including docs
```

If formatting does not run, check `zed: open log`, confirm Bun is on Zed's PATH, and run `editor: format` to test the configured formatter manually.

### Releasing

Maintainers can run the existing release workflow when ready to publish:

```bash
bun run release
```

This command runs checks, builds the package, updates the changelog, publishes to npm, and pushes release changes. Run it only when you intend to release.

## License

[MIT](LICENSE)
