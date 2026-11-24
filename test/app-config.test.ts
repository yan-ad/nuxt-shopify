import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveAppHandle } from '../src/app-config'

const roots: string[] = []
async function fixture(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), 'shopify-config-'))
  roots.push(root)
  for (const [name, contents] of Object.entries(files))
    await writeFile(join(root, name), contents)
  return root
}
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))
  )
})

describe('Shopify app handle discovery', () => {
  it('parses the default TOML including comments and single-quoted strings', async () => {
    const root = await fixture({
      'shopify.app.toml': "client_id = 'key'\nhandle = 'my-app' # app handle\n"
    })
    expect(await resolveAppHandle(root, 'key')).toBe('my-app')
  })
  it('selects the named config matching the configured API key', async () => {
    const root = await fixture({
      'shopify.app.toml': 'client_id="prod"\nhandle="prod-app"',
      'shopify.app.development.toml': 'client_id="dev"\nhandle="dev-app"'
    })
    expect(await resolveAppHandle(root, 'dev')).toBe('dev-app')
    const warn = vi.fn()
    expect(await resolveAppHandle(root, '', undefined, warn)).toBe('')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Multiple'))
  })
  it('never selects credentials for a different app', async () => {
    const root = await fixture({
      'shopify.app.toml': 'client_id="other"\nhandle="other-app"'
    })
    const warn = vi.fn()
    expect(await resolveAppHandle(root, 'active', undefined, warn)).toBe('')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('matches shopify.apiKey')
    )
  })
  it('allows explicit overrides and works when TOML is not deployed', async () => {
    const root = await fixture({})
    expect(await resolveAppHandle(root, 'key', 'explicit-app')).toBe(
      'explicit-app'
    )
    expect(await resolveAppHandle(root, 'key')).toBe('')
  })
  it('ignores invalid TOML safely without logging its contents', async () => {
    const root = await fixture({
      'shopify.app.toml': 'handle = invalid secret-value'
    })
    const warn = vi.fn()
    expect(await resolveAppHandle(root, 'key', undefined, warn)).toBe('')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).not.toContain('secret-value')
  })
})
