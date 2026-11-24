import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createPolarisPreviewDocument,
  getPolarisExample,
  polarisExamples
} from '../docs/app/utils/polaris-previews'

describe('docs Polaris previews', () => {
  it('covers every component page with a valid preview or Shopify host requirement', () => {
    const root = fileURLToPath(
      new URL('../docs/content/4.components', import.meta.url)
    )
    function check(directory: string) {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name)
        if (entry.isDirectory()) check(path)
        else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
          const content = readFileSync(path, 'utf8')
          const example = content.match(
            /::polaris-preview\{example="([^"]+)"\}/
          )?.[1]
          if (example) expect(getPolarisExample(example), path).toBeDefined()
          else
            expect(content, path).toContain(
              'requires an authenticated Shopify admin host'
            )
          expect(content, path).not.toContain('/polaris-wc')
        }
      }
    }
    check(root)
  })
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
    expect(component).not.toContain('Load interactive preview')
    expect(component).toContain('loading="lazy"')
  })
})
