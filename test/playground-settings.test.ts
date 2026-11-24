import { describe, expect, it, vi } from 'vitest'
import { defaultSettings, parseSettings } from '../playground/shared/settings'
import { requireAdminData } from '../playground/server/utils/admin-data'

describe('playground preferences', () => {
  it('accepts supported preferences and strips untrusted fields', () => {
    expect(
      parseSettings({
        pageSize: 50,
        defaultStatus: 'draft',
        ownerId: 'untrusted'
      })
    ).toEqual({ pageSize: 50, defaultStatus: 'draft' })
    expect(parseSettings(defaultSettings)).toEqual(defaultSettings)
  })
  it.each([
    null,
    {},
    { pageSize: 100, defaultStatus: 'all' },
    { pageSize: '20', defaultStatus: 'all' },
    { pageSize: 20, defaultStatus: 'unknown' }
  ])('rejects invalid input %j', (value) => {
    expect(() => parseSettings(value)).toThrow()
  })
  it('never replaces an upstream failure with sample data', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() =>
        requireAdminData({ errors: { message: 'denied' } })
      ).toThrow()
      expect(requireAdminData({ data: { products: [] } })).toEqual({
        products: []
      })
    } finally {
      log.mockRestore()
    }
  })
})
