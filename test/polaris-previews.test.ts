import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  createPolarisPreviewDocument,
  getPolarisExample,
  polarisExamples
} from '../docs/app/utils/polaris-previews'

describe('docs Polaris previews', () => {
  it('accepts only known example keys, including rejecting prototype properties', () => {
    expect(getPolarisExample('progress')).toBeDefined()
    expect(getPolarisExample('toString')).toBeUndefined()
    expect(getPolarisExample('<script>alert(1)</script>')).toBeUndefined()
  })

  for (const key of Object.keys(polarisExamples) as Array<
    keyof typeof polarisExamples
  >) {
    it(`builds a self-contained ${key} example with upgrade/error handling`, () => {
      const html = createPolarisPreviewDocument(key)
      expect(html).toContain(polarisExamples[key].html)
      expect(html).toContain('polaris-2.js')
      expect(html).toContain('customElements.whenDefined(tag)')
      expect(html).toContain('script.onerror')
      expect(html).toContain('clearTimeout(timeout)')
      expect(html).toContain("form-action 'none'")
      expect(html).not.toContain('app-bridge.js')
      expect(html).not.toContain('SHOPIFY_API')
    })
  }

  it('keeps executable examples sandboxed without same-origin privileges', () => {
    const component = readFileSync(
      new URL(
        '../docs/app/components/content/PolarisPreview.vue',
        import.meta.url
      ),
      'utf8'
    )
    expect(component).toContain('sandbox="allow-scripts"')
    expect(component).not.toContain('allow-same-origin')
    expect(component).not.toContain('v-html')
    expect(component).toContain('v-if="started"')
  })
})
