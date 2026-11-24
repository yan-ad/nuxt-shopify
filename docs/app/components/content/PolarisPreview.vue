<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createPolarisPreviewDocument,
  getPolarisExample,
  type PolarisExample
} from '../../utils/polaris-previews'

const props = withDefaults(defineProps<{ example?: string }>(), {
  example: 'buttons'
})
const demo = computed(() => getPolarisExample(props.example))
const source = computed(() =>
  demo.value
    ? `${demo.value.html}\n\n<script>\n${demo.value.script}\n\x3C/script>`
    : ''
)
const srcdoc = computed(() =>
  demo.value
    ? createPolarisPreviewDocument(props.example as PolarisExample)
    : ''
)
const started = ref(false)
const revision = ref(0)
</script>

<template>
  <section
    v-if="demo"
    class="not-prose my-6 overflow-hidden rounded-xl border border-default bg-default"
    :aria-label="`${demo.title} interactive preview`"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-default px-5 py-4"
    >
      <div>
        <h3 class="m-0 text-sm font-semibold text-highlighted">
          {{ demo.title }}
        </h3>
        <p class="m-0 mt-1 text-sm text-muted">{{ demo.description }}</p>
      </div>
      <button
        v-if="started"
        type="button"
        class="rounded-md border border-default px-3 py-1.5 text-sm hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="revision++"
      >
        Reload preview
      </button>
    </header>
    <iframe
      v-if="started"
      :key="`${example}-${revision}`"
      :srcdoc="srcdoc"
      :title="`${demo.title} — interactive Polaris v2 example`"
      sandbox="allow-scripts"
      referrerpolicy="no-referrer"
      class="block w-full border-0 bg-white"
      :style="{ height: `${demo.height}px` }"
    />
    <div
      v-else
      class="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <p class="m-0 text-sm text-muted">
        Load real Polaris v2 components from Shopify’s CDN.
      </p>
      <button
        type="button"
        class="rounded-md bg-inverted px-4 py-2 text-sm font-medium text-inverted focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="started = true"
      >
        Load interactive preview
      </button>
    </div>
    <details class="border-t border-default">
      <summary
        class="cursor-pointer px-5 py-3 text-sm font-medium text-highlighted"
      >
        View HTML and JavaScript
      </summary>
      <pre
        class="m-0 max-h-96 overflow-auto border-t border-default bg-elevated p-5 text-xs leading-relaxed"
      ><code>{{ source }}</code></pre>
    </details>
  </section>
  <p v-else role="status">Unknown Polaris example: {{ example }}.</p>
</template>
