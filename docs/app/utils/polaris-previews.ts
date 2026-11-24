// Only reviewed, repository-authored examples can run in the preview frame.
export const polarisExamples = {
  buttons: {
    title: 'Actions',
    description: 'Click an action to update the status below.',
    height: 240,
    html: `<s-stack gap="base">
  <s-button-group>
    <s-button id="save" variant="primary">Save product</s-button>
    <s-button id="reset" variant="secondary">Reset</s-button>
  </s-button-group>
  <s-text id="status" aria-live="polite">No changes saved yet.</s-text>
</s-stack>`,
    script: `document.querySelector('#save').addEventListener('click', () => {
  document.querySelector('#status').textContent = 'Product saved successfully.';
});
document.querySelector('#reset').addEventListener('click', () => {
  document.querySelector('#status').textContent = 'No changes saved yet.';
});`
  },
  form: {
    title: 'Form controls',
    description: 'Edit the product name and toggle its availability.',
    height: 360,
    html: `<s-stack gap="base">
  <s-text-field id="name" label="Product name" value="Everyday tote"></s-text-field>
  <s-switch id="available" label="Available for sale" checked></s-switch>
  <s-text id="summary" aria-live="polite">Everyday tote · Available</s-text>
</s-stack>`,
    script: `const name = document.querySelector('#name');
const available = document.querySelector('#available');
function update() {
  document.querySelector('#summary').textContent =
    (name.value || 'Untitled product') + ' · ' + (available.checked ? 'Available' : 'Unavailable');
}
name.addEventListener('input', update);
available.addEventListener('change', update);`
  },
  progress: {
    title: 'Progress and numbers',
    description: 'Advance a five-step import or reset it.',
    height: 280,
    html: `<s-stack gap="base">
  <s-progress id="progress" accessibilityLabel="Products imported" value="0" max="5"></s-progress>
  <s-text aria-live="polite"><s-number id="count">0</s-number> of 5 products imported</s-text>
  <s-button-group>
    <s-button id="advance" variant="primary">Import next</s-button>
    <s-button id="reset" variant="secondary">Reset</s-button>
  </s-button-group>
</s-stack>`,
    script: `let count = 0;
function update() {
  const progress = document.querySelector('#progress');
  progress.value = count;
  progress.tone = count === 5 ? 'success' : 'info';
  document.querySelector('#count').textContent = String(count);
  document.querySelector('#advance').disabled = count === 5;
}
document.querySelector('#advance').addEventListener('click', () => { count = Math.min(count + 1, 5); update(); });
document.querySelector('#reset').addEventListener('click', () => { count = 0; update(); });`
  },
  'empty-state': {
    title: 'Empty state',
    description: 'Use the primary action to add the first product.',
    height: 370,
    html: `<s-empty-state id="empty" heading="Add your first product">
  <s-icon slot="graphic" type="product"></s-icon>
  <s-text slot="subheading">Your next great product starts here.</s-text>
  <s-button id="add" slot="primary-action" variant="primary">Add product</s-button>
</s-empty-state>
<s-stack id="result" hidden gap="base">
  <s-heading>Everyday tote</s-heading>
  <s-badge tone="success">Active</s-badge>
  <s-button id="reset" variant="secondary">Start again</s-button>
</s-stack>`,
    script: `document.querySelector('#add').addEventListener('click', () => {
  document.querySelector('#empty').hidden = true;
  document.querySelector('#result').hidden = false;
});
document.querySelector('#reset').addEventListener('click', () => {
  document.querySelector('#empty').hidden = false;
  document.querySelector('#result').hidden = true;
});`
  }
} as const

export type PolarisExample = keyof typeof polarisExamples

export function getPolarisExample(name: string) {
  return Object.hasOwn(polarisExamples, name)
    ? polarisExamples[name as PolarisExample]
    : undefined
}

export function createPolarisPreviewDocument(example: PolarisExample): string {
  const demo = polarisExamples[example]
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src https://cdn.shopify.com 'unsafe-inline'; style-src 'unsafe-inline' https://cdn.shopify.com; font-src https://cdn.shopify.com; img-src https://cdn.shopify.com data:; connect-src https://cdn.shopify.com; base-uri 'none'; form-action 'none'">
<title>Polaris preview: ${demo.title}</title>
<style>
body { margin: 0; padding: 28px; font: 14px system-ui, sans-serif; color: #202223; background: #fff; color-scheme: light; }
[hidden] { display: none !important; }
#load-status { margin: 0 0 20px; color: #616161; }
#demo { max-width: 640px; margin-inline: auto; }
#demo:not([data-ready]) { visibility: hidden; animation: reveal 0s 12s forwards; }
@keyframes reveal { to { visibility: visible; } }
</style>
</head>
<body>
<p id="load-status" role="status">Loading Polaris from Shopify…</p>
<main id="demo">${demo.html}</main>
<script>
const status = document.querySelector('#load-status');
const demo = document.querySelector('#demo');
const timeout = setTimeout(() => {
  status.textContent = 'Polaris could not load. Check your connection, then reload this preview.';
  demo.hidden = true;
}, 12000);
const script = document.createElement('script');
script.src = 'https://cdn.shopify.com/shopifycloud/polaris-2.js';
script.onerror = () => {
  clearTimeout(timeout);
  status.textContent = 'Shopify’s component CDN is unavailable. Try reloading this preview.';
  demo.hidden = true;
};
script.onload = async () => {
  const tags = [...new Set([...demo.querySelectorAll('*')].map(el => el.localName).filter(tag => tag.startsWith('s-')))];
  await Promise.all(tags.map(tag => customElements.whenDefined(tag)));
  clearTimeout(timeout);
  demo.hidden = false;
  demo.dataset.ready = '';
  status.hidden = true;
  ${demo.script}
};
document.head.appendChild(script);
</script>
</body>
</html>`
}
