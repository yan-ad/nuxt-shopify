---
title: Components
description: Shopify Polaris web components wrapped for Nuxt with Vue bindings.
---

Browse the Polaris v2.0 reference by category. Every standalone component page includes an automatically loaded live preview and source code. Previews connect to Shopify’s CDN in isolated, lazy-loaded frames; no store credentials are used. App Bridge-only components require the authenticated playground. The module loads the stable `polaris-2.js` CDN release.

Newly covered components include [EmptyState](/components/feedback/empty-state), [Progress](/components/feedback/progress), and [Number](/components/content/number).

::card-group

::card{title="Layout" icon="i-lucide-layout-dashboard" to="/components/layout/page"}
Page, Box, Stack, Grid, Section, and Divider — structure your app pages.
::

::card{title="Actions" icon="i-lucide-mouse-pointer-click" to="/components/actions/button"}
Button, ButtonGroup, Clickable, and Link — trigger actions and navigate.
::

::card{title="Forms" icon="i-lucide-text-cursor-input" to="/components/forms/text-field"}
TextField, Select, Checkbox, Choice, and more — collect user input.
::

::card{title="Feedback" icon="i-lucide-message-circle" to="/components/feedback/banner"}
Banner, Badge, Spinner, Tooltip, EmptyState, and Progress — communicate status and information.
::

::card{title="Navigation" icon="i-lucide-compass" to="/components/navigation/app-nav"}
AppNav, Menu, Option, OptionGroup, and Popover — guide users through your app.
::

::card{title="Data" icon="i-lucide-table" to="/components/data/table"}
Table, TableHeader, TableBody, TableRow, and TableCell — display structured data.
::

::card{title="Content" icon="i-lucide-type" to="/components/content/text"}
Text, Number, Heading, Icon, Image, Thumbnail, Avatar, Chip, and List — render content.
::

::card{title="Overlays" icon="i-lucide-layers" to="/components/overlays/modal"}
Modal and QueryContainer — display content above the page.
::

::card{title="App" icon="i-lucide-app-window" to="/components/app/app"}
App wrapper and LoadingIndicator — top-level app components.
::

::card{title="App Bridge UI" icon="i-lucide-external-link" to="/components/app-bridge-ui/ui-modal"}
UiModal, UiTitleBar, UiSaveBar, and UiNavMenu — full-screen App Bridge overlays.
::

::



## Overview

This module provides Vue wrapper components for [Shopify Polaris web components](https://shopify.dev/docs/api/app-home/web-components). Use the `Sh`-prefixed wrappers instead of raw `s-*` web components — they provide typed props with autocomplete, v-model support for form components, and work seamlessly with Vue's reactivity system.

All `Sh*` components are **auto-imported** — no manual imports needed.



## Component Prefix

All components use a configurable prefix (default: `Sh`). You can change it via the `componentPrefix` module option:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  shopify: {
    componentPrefix: 'Shopify' // <ShopifyButton>, <ShopifyApp>, etc.
  }
})
```

The examples below use the default `Sh` prefix.

## Basic Example

```vue
<template>
  <ShPage heading="Products">
    <ShStack gap="base">
      <ShButton variant="primary" @click="save">Save</ShButton>
      <ShButton @click="cancel">Cancel</ShButton>
    </ShStack>

    <ShBanner heading="Welcome" tone="info" dismissible>
      Start by adding your first product.
    </ShBanner>

    <ShTextField
      v-model="title"
      label="Product title"
      placeholder="Enter product title"
    />

    <ShSelect
      v-model="status"
      label="Status"
    >
      <ShOption value="active">Active</ShOption>
      <ShOption value="draft">Draft</ShOption>
    </ShSelect>
  </ShPage>
</template>
```

## App Components

### `<ShApp>`

Wrap your app pages with `<ShApp>` to automatically render the [App Bridge navigation menu](https://shopify.dev/docs/api/app-home/app-bridge-web-components/app-nav) from your module config. See [ShApp reference](/components/app/app).

```vue [layouts/default.vue]
<template>
  <ShApp>
    <slot />
  </ShApp>
</template>
```

### `<ShLoadingIndicator>`

Bridges the Nuxt loading indicator with the Shopify Admin loading bar. See [ShLoadingIndicator reference](/components/app/loading-indicator).

```vue
<template>
  <ShLoadingIndicator>
    <ShPage heading="Products">
      <!-- content -->
    </ShPage>
  </ShLoadingIndicator>
</template>
```

## Available Components

Each Polaris component maps to its web component counterpart (e.g., `<ShButton>` → `<s-button>`). Browse the full reference with props, events, and slots:

| Category | Components | Reference |
| --- | --- | --- |
| **Layout** | `ShPage`, `ShBox`, `ShStack`, `ShGrid`, `ShGridItem`, `ShSection`, `ShDivider` | [Layout](/components/layout) |
| **Actions** | `ShButton`, `ShButtonGroup`, `ShClickable`, `ShLink` | [Actions](/components/actions) |
| **Forms** | `ShTextField`, `ShNumberField`, `ShEmailField`, `ShPasswordField`, `ShUrlField`, `ShMoneyField`, `ShColorField`, `ShDateField`, `ShTextArea`, `ShSelect`, `ShCheckbox`, `ShSwitch`, `ShChoiceList`, `ShChoice`, `ShSearchField`, `ShDropZone`, `ShColorPicker`, `ShDatePicker` | [Forms](/components/forms) |
| **Feedback** | `ShBanner`, `ShBadge`, `ShSpinner`, `ShTooltip`, `ShEmptyState`, `ShProgress` | [Feedback](/components/feedback) |
| **Navigation** | `ShAppNav`, `ShMenu`, `ShOption`, `ShOptionGroup`, `ShPopover` | [Navigation](/components/navigation) |
| **Data** | `ShTable`, `ShTableHeader`, `ShTableHeaderRow`, `ShTableBody`, `ShTableRow`, `ShTableCell` | [Data](/components/data) |
| **Content** | `ShText`, `ShNumber`, `ShHeading`, `ShParagraph`, `ShIcon`, `ShImage`, `ShThumbnail`, `ShAvatar`, `ShChip`, `ShClickableChip`, `ShListItem`, `ShOrderedList`, `ShUnorderedList` | [Content](/components/content) |
| **Overlays** | `ShModal`, `ShQueryContainer` | [Overlays](/components/overlays) |
| **App Bridge UI** | `ShUiModal`, `ShUiTitleBar`, `ShUiSaveBar`, `ShUiNavMenu` | [App Bridge UI](/components/app-bridge-ui) |

## Polaris Modal (`ShModal`)

`ShModal` wraps the [Polaris `<s-modal>`](https://shopify.dev/docs/api/app-home/web-components/overlays/modal) component — it renders **inside** your app's iframe. Open and close it using `commandFor` / `command` attributes:

```vue
<template>
  <ShButton command-for="my-modal" command="--show">Open</ShButton>

  <ShModal id="my-modal" heading="Confirm action">
    <ShParagraph>Are you sure?</ShParagraph>

    <ShButton slot="secondary-actions" command-for="my-modal" command="--hide">
      Cancel
    </ShButton>
    <ShButton
      slot="primary-action"
      variant="primary"
      command-for="my-modal"
      command="--hide"
    >
      Confirm
    </ShButton>
  </ShModal>
</template>
```

::tip
You can also control `<s-modal>` programmatically: `shopify.modal.show('my-modal')`, `shopify.modal.hide('my-modal')`, `shopify.modal.toggle('my-modal')`.
::

::warning
`ShModal` is **not** the same as the App Bridge `<ui-modal>` which renders **outside** the iframe. If you need the App Bridge modal, use [`<ShUiModal>`](/components/app-bridge-ui/ui-modal).
::

## App Bridge UI Components (`ShUi*`)

In addition to the Polaris `Sh*` components (rendered **inside** your iframe), the module provides `ShUi*` wrappers for [App Bridge UI web components](https://shopify.dev/docs/api/app-bridge-library/web-components) (`ui-*`). These render **outside** the app iframe in the Shopify Admin shell.

These are the **Vue replacements** for [`@shopify/app-bridge-react`](https://www.npmjs.com/package/@shopify/app-bridge-react) components (`Modal`, `TitleBar`, `SaveBar`, `NavMenu`).

### Polaris (`Sh*`) vs App Bridge (`ShUi*`)

|                    | Polaris (`Sh*`)                           | App Bridge (`ShUi*`)                                                              |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------------------------- |
| **HTML elements**  | `<s-button>`, `<s-modal>`, etc.           | `<ui-modal>`, `<ui-title-bar>`, etc.                                              |
| **Renders in**     | Your app's iframe                         | Shopify Admin (outside the iframe)                                                |
| **Use for**        | In-app UI: forms, tables, buttons, layout | Admin-level chrome: page title, modals overlaying the admin, save bar, navigation |
| **Controlled via** | Props, slots, `command`/`commandFor`      | `useAppBridge()` API (`shopify.modal.show(id)`, etc.)                             |

For detailed props, events, and usage examples, see the individual component pages:

- [`<ShUiModal>`](/components/app-bridge-ui/ui-modal) — Full-screen modal outside the iframe
- [`<ShUiTitleBar>`](/components/app-bridge-ui/ui-title-bar) — Admin page title bar with action buttons
- [`<ShUiSaveBar>`](/components/app-bridge-ui/ui-save-bar) — Contextual save/discard bar
- [`<ShUiNavMenu>`](/components/app-bridge-ui/ui-nav-menu) — Admin sidebar navigation menu

## Related App Bridge APIs

All `ShUi*` components can be controlled programmatically via the `shopify` global (accessed with `useAppBridge()`):

| API                                  | Description                                                | Docs                                                                                                                  |
| ------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `shopify.modal`                      | Show, hide, and toggle modals by ID                        | [Modal API](https://shopify.dev/docs/api/app-home/apis/user-interface-and-interactions/modal-api)                     |
| `shopify.saveBar`                    | Show, hide, toggle save bars and prompt leave confirmation | [Save Bar API](https://shopify.dev/docs/api/app-home/apis/user-interface-and-interactions/save-bar-api)               |
| `shopify.toast.show(message)`        | Show toast notifications                                   | [Toast API](https://shopify.dev/docs/api/app-home/apis/user-interface-and-interactions/toast-api)                     |
| `shopify.loading.show()` / `.hide()` | Control the admin loading bar                              | [Loading API](https://shopify.dev/docs/api/app-home/apis/user-interface-and-interactions/loading-api)                 |
| `shopify.resourcePicker()`           | Open product/collection/variant pickers                    | [Resource Picker API](https://shopify.dev/docs/api/app-home/apis/user-interface-and-interactions/resource-picker-api) |
| `shopify.intents.navigate()`         | Launch native Shopify admin workflows                      | [Intents API](https://shopify.dev/docs/api/app-home/apis/user-interface-and-interactions/intents-api)                 |

See the full list at [App Bridge APIs and web methods](https://shopify.dev/docs/api/app-home/apis).

## Client-only rendering

Polaris and App Bridge web-component wrappers mount only in the browser. Every
native wrapper has the same internal mount guard for auto-imports and direct
imports: SSR and the initial hydration render produce a comment, then the real
custom element mounts after Vue's `onMounted`. No extra container is inserted,
so named slots, table structure, events, and `v-model` retain their normal APIs.

`ShApp` and `ShLoadingIndicator` remain layout helpers and do not hide unrelated
server-rendered page content. Raw `s-*` tags you write yourself are not guarded.
For a useful initial loading state, wrap larger UI regions in Nuxt's `ClientOnly`
with a `#fallback` slot. Browser JavaScript and Shopify's Polaris CDN are required
for the interactive component UI.
