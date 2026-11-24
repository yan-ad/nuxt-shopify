---
title: Components
description: Try interactive Polaris v2 components directly in the documentation.
navigation:
  icon: i-lucide-blocks
---

# Interactive components

Explore real Shopify Polaris v2 web components without opening a development store. Each preview loads Shopify's `polaris-2.js` inside an isolated frame, so its styling stays separate from this documentation.

Select **Load interactive preview**, then try the controls. These examples are local demonstrations: they do not save products, call Shopify APIs, or request store credentials. Loading a preview connects your browser to Shopify's CDN.

## Actions

Save and reset a status message using native component events.

::polaris-preview{example="buttons"}
::

## Form controls

Change the product name or switch its availability. The summary updates with the component's `input` and `change` events.

::polaris-preview{example="form"}
::

## Progress and numbers

Advance an import, watch the progress indicator, and reset it to zero.

::polaris-preview{example="progress"}
::

## Empty state

Use the primary action to transition from an empty collection to its first product.

::polaris-preview{example="empty-state"}
::

## Reuse previews in Markdown

Nuxt Content's MDC syntax renders the `PolarisPreview` Vue component. Add a reviewed example to `docs/app/utils/polaris-previews.ts`, then reference its key in a content page:

```mdc
::polaris-preview{example="progress"}
::
```

The component accepts curated example keys, not arbitrary executable HTML. **View HTML and JavaScript** shows the exact web-component example used inside the frame. In your Nuxt app, use the equivalent `Sh*` wrappers, such as `ShButton`, `ShProgress`, and `ShEmptyState`; see the [component reference](/polaris-wc).

App Bridge components such as the admin title bar, navigation menu, and save bar require the Shopify admin host and are not simulated here.
