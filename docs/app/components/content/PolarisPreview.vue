<script setup lang="ts">
import { computed, ref, useId, watch, onMounted, onUnmounted } from 'vue'
import {
  createPolarisPreviewDocument,
  getPolarisExample,
  type PolarisExample
} from '../../utils/polaris-previews'
import {
  getControls,
  DEFAULT_PROP_VALUE,
  selectPropValue,
  initialProps,
  vueSnippet,
  type PropValues
} from '../../utils/polaris-viewer'

const props = withDefaults(defineProps<{ example?: string }>(), {
  example: 'buttons'
})
const demo = computed(() => getPolarisExample(props.example))
const controls = computed(() => getControls(props.example))
const values = ref<PropValues>(initialProps(props.example))
const source = computed(() => vueSnippet(props.example, values.value))
const srcdoc = computed(() =>
  demo.value
    ? createPolarisPreviewDocument(props.example as PolarisExample)
    : ''
)
const height = ref(150)
function receiveHeight(event: MessageEvent) {
  if (
    event.source !== frame.value?.contentWindow ||
    event.data?.type !== 'polaris-height' ||
    event.data.example !== props.example
  )
    return
  const next = event.data.height
  if (typeof next === 'number' && Number.isFinite(next))
    height.value = Math.max(120, Math.min(next, 600))
}
onMounted(() => window.addEventListener('message', receiveHeight))
onUnmounted(() => window.removeEventListener('message', receiveHeight))
const revision = ref(0)
const frame = ref<HTMLIFrameElement>()
const id = useId()
// A fenced block uses the same Shiki + prose renderer as authored Markdown.
// Use a longer fence so user-entered backticks cannot escape into MDC markup.
const markdown = computed(() => {
  const runs = source.value.match(/`+/g) || []
  const fence = '`'.repeat(Math.max(3, ...runs.map((run) => run.length + 1)))
  return `${fence}vue\n${source.value}\n${fence}`
})
watch(
  () => props.example,
  () => {
    values.value = initialProps(props.example)
  }
)
function sync() {
  // Opaque-origin sandbox: targetOrigin must be '*'; recipient checks source and allowlisted props.
  frame.value?.contentWindow?.postMessage(
    {
      type: 'polaris-properties',
      example: props.example,
      values: { ...values.value }
    },
    '*'
  )
}
watch(values, sync, { deep: true })
function reset() {
  values.value = initialProps(props.example)
  revision.value++
}
</script>

<template>
  <section
    v-if="demo"
    class="not-prose my-6 overflow-hidden rounded-lg border border-default"
    :aria-label="`${demo.title} component playground`"
  >
    <div
      class="grid grid-cols-2 items-start gap-x-3 gap-y-4 border-b border-default bg-muted/40 p-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      <UFormField
        v-for="control in controls"
        :key="control.name"
        :label="control.name === 'slotText' ? 'Text content' : control.name"
        :name="`${id}-${control.name}`"
        class="min-w-0"
      >
        <USwitch
          v-if="control.kind === 'boolean'"
          class="my-1.5"
          :model-value="Boolean(values[control.name])"
          :aria-label="control.name"
          @update:model-value="values[control.name] = $event"
        />
        <USelect
          v-else-if="control.kind === 'select'"
          :model-value="String(values[control.name] || DEFAULT_PROP_VALUE)"
          :items="[
            { label: 'Default', value: DEFAULT_PROP_VALUE },
            ...(control.options || [])
              .filter(Boolean)
              .map((value) => ({ label: value, value }))
          ]"
          class="w-full"
          :aria-label="control.name"
          @update:model-value="values[control.name] = selectPropValue($event)"
        />
        <UInput
          v-else
          :model-value="String(values[control.name] ?? '')"
          :type="control.kind === 'number' ? 'number' : 'text'"
          class="w-full"
          :aria-label="control.name"
          @update:model-value="values[control.name] = String($event)"
        />
      </UFormField>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-rotate-ccw"
        class="self-end justify-self-end"
        aria-label="Reset preview properties"
        @click="reset"
        >Reset</UButton
      >
    </div>
    <iframe
      ref="frame"
      :key="`${example}-${revision}`"
      :srcdoc="srcdoc"
      :title="`${demo.title} — interactive Polaris v2 example`"
      loading="lazy"
      sandbox="allow-scripts"
      referrerpolicy="no-referrer"
      class="block w-full border-0 bg-white"
      :style="{ height: `${height}px` }"
      @load="sync"
    />
    <div
      class="border-t border-default [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0"
    >
      <MDC :value="markdown" class="preview-code min-w-0" />
    </div>
  </section>
  <p v-else role="status">Unknown Polaris example: {{ example }}.</p>
</template>

<style scoped>
.preview-code :deep(.prose),
.preview-code :deep(pre),
.preview-code :deep([data-slot='root']) {
  margin-block: 0;
}
</style>
