import { polarisProps } from './polaris-props'
import { getPolarisExample } from './polaris-previews'

export const DEFAULT_PROP_VALUE = '__polaris_default__'

export function selectPropValue(value: unknown): string {
  return value === DEFAULT_PROP_VALUE || value == null ? '' : String(value)
}

export interface PropControl {
  name: string
  kind: string
  options?: readonly string[]
}
export type PropValues = Record<string, string | boolean>
export function slotText(example: string): string | undefined {
  if (
    example.endsWith('-field') ||
    [
      'text-area',
      'select',
      'color-picker',
      'date-picker',
      'drop-zone',
      'progress',
      'spinner'
    ].includes(example)
  )
    return undefined
  const html = getPolarisExample(example)?.html || ''
  return html.match(
    new RegExp(`<s-${example}[^>]*>([^<]*)</s-${example}>`)
  )?.[1]
}
export function getControls(example: string): readonly PropControl[] {
  const props = Object.hasOwn(polarisProps, example)
    ? polarisProps[example as keyof typeof polarisProps]
    : []
  return slotText(example) !== undefined
    ? [{ name: 'slotText', kind: 'text' }, ...props]
    : props
}
export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
}
export function initialProps(example: string): PropValues {
  const html = getPolarisExample(example)?.html || ''
  const opening =
    html.match(new RegExp(`<s-${example}(?=[\\s>])[^>]*>`))?.[0] || ''
  return Object.fromEntries(
    getControls(example).map((control) => {
      if (control.name === 'slotText')
        return [control.name, slotText(example) || '']
      const key = control.name === 'modelValue' ? 'value' : control.name
      const match = opening.match(
        new RegExp(`\\s${key}(?:="([^"]*)")?(?=[\\s>])`, 'i')
      )
      return [
        control.name,
        control.kind === 'boolean' ? Boolean(match) : match?.[1] || ''
      ]
    })
  )
}
export function previewMarkup(example: string, values: PropValues): string {
  const html = getPolarisExample(example)?.html || ''
  const markup = html.replace(
    new RegExp(`<s-${example}(?=[\\s>])[^>]*>`),
    (opening) => {
      for (const control of getControls(example)) {
        if (control.name === 'slotText') continue
        const key = control.name === 'modelValue' ? 'value' : control.name
        opening = opening.replace(
          new RegExp(`\\s${key}(?:="[^"]*")?(?=[\\s>])`, 'gi'),
          ''
        )
        const value = values[control.name]
        if (value !== '' && value !== false && value !== undefined)
          opening =
            opening.slice(0, -1) +
            ` ${key}="${escapeAttribute(String(value))}">`
      }
      return opening
    }
  )
  return slotText(example) !== undefined && typeof values.slotText === 'string'
    ? markup.replace(
        new RegExp(`(<s-${example}[^>]*>)[^<]*(</s-${example}>)`),
        (_, open, close) =>
          open + escapeAttribute(values.slotText as string) + close
      )
    : markup
}
export function vueSnippet(example: string, values: PropValues): string {
  const demo = getPolarisExample(example)
  if (!demo) return ''
  let html = previewMarkup(example, values)
  const modeled = getControls(example).some(
    (control) => control.name === 'modelValue'
  )
  if (modeled)
    html = html
      .replace(new RegExp(`(<s-${example}[^>]*?)\\svalue="[^"]*"`), '$1')
      .replace(new RegExp(`(<s-${example})(?=[\\s>])`), '$1 v-model="value"')
  html = html.replace(
    /<(\/?)(s-([a-z-]+))/g,
    (_, close, _tag, name: string) =>
      `<${close}Sh${name
        .split('-')
        .map((part) => part[0]!.toUpperCase() + part.slice(1))
        .join('')}`
  )
  html = html.replace(
    /(\s)([a-z][a-zA-Z]+)=/g,
    (_, space, name: string) =>
      space +
      name.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase()) +
      '='
  )
  // Numeric props must be bindings, not string literals, in Vue wrappers.
  html = html.replace(
    /\s(max|min|value|step|max-length|min-length)="(-?\d+(?:\.\d+)?)"/g,
    ' :$1="$2"'
  )
  for (const control of getControls(example)) {
    if (control.kind === 'boolean') {
      const name = control.name.replace(
        /[A-Z]/g,
        (letter) => '-' + letter.toLowerCase()
      )
      html = html.replace(new RegExp(` ${name}="true"`, 'g'), ` ${name}`)
    }
  }
  const setup = [
    modeled
      ? `import { ref } from 'vue'\nconst value = ref(${JSON.stringify(values.modelValue || '').replace(/</g, '\\u003c')})`
      : '',
    demo.script
      ? `import { onMounted } from 'vue'\nonMounted(() => {\n${demo.script
          .split('\n')
          .map((line) => '  ' + line)
          .join('\n')}\n})`
      : ''
  ]
    .filter(Boolean)
    .join('\n\n')
  return `${setup ? '<script setup lang="ts">\n' + setup + '\n</script>\n\n' : ''}<template>\n${html
    .split('\n')
    .map((line) => '  ' + line)
    .join('\n')}\n</template>`
}
