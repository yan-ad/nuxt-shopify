import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
)

describe('ESM-only package exports', () => {
  it('declares ESM and exposes only import and type conditions', () => {
    expect(pkg.type).toBe('module')
    for (const entry of Object.values(pkg.exports) as Array<
      Record<string, string>
    >) {
      expect(Object.keys(entry).sort()).toEqual(['import', 'types'])
      expect(entry.import).toMatch(/\.(mjs|js)$/)
      expect(entry.import).not.toMatch(/\.cjs$/)
    }
  })
})
