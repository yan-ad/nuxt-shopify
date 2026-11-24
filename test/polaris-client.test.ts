import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

const hooks = vi.hoisted(() => ({ mounted: [] as Array<() => void> }))
vi.mock('vue', () => ({
  shallowRef: (value: boolean) => ({ value }),
  onMounted: (callback: () => void) => hooks.mounted.push(callback)
}))
import { usePolarisClient } from '../src/runtime/shared/polaris-client'

describe('browser-only Polaris lifecycle', () => {
  it('matches SSR until mounted and maintains independent instance state', () => {
    hooks.mounted.length = 0
    const first = usePolarisClient()
    const second = usePolarisClient()
    expect(first.value).toBe(false)
    expect(second.value).toBe(false)
    hooks.mounted[0]!()
    expect(first.value).toBe(true)
    expect(second.value).toBe(false)
    hooks.mounted[1]!()
    expect(second.value).toBe(true)
  })
  it('guards every native web-component wrapper, including direct imports', () => {
    const directory = new URL(
      '../src/runtime/components/polaris/',
      import.meta.url
    )
    let count = 0
    for (const file of readdirSync(directory).filter((file) =>
      file.endsWith('.vue')
    )) {
      const source = readFileSync(new URL(file, directory), 'utf8')
      if (!/<(?:s|ui)-[a-z-]+/.test(source)) continue
      count++
      expect(source, file).toContain(
        'const polarisMounted = usePolarisClient()'
      )
      expect(source, file).toMatch(/<(?:s|ui)-[a-z-]+\s+v-if="polarisMounted/)
    }
    expect(count).toBe(65)
  })
})
