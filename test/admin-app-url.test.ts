import { describe, expect, it } from 'vitest'
import { shopifyAdminAppUrl } from '../src/runtime/shared/admin-app-url'

describe('Shopify admin app login', () => {
  it('opens the configured app for a store handle or domain', () => {
    const expected = 'https://admin.shopify.com/store/my-store/apps/my-app'
    expect(shopifyAdminAppUrl('my-store', 'my-app')).toBe(expected)
    expect(shopifyAdminAppUrl(' MY-STORE.myshopify.com/ ', 'my-app')).toBe(
      expected
    )
  })
  it.each([
    '',
    'evil.com',
    '../store',
    'my-shop?next=evil',
    'https://evil.test'
  ])('rejects invalid store input %s', (value) => {
    expect(() => shopifyAdminAppUrl(value, 'my-app')).toThrow()
  })
  it('requires an app handle instead of guessing from the API key', () => {
    expect(() => shopifyAdminAppUrl('my-store', '')).toThrow(
      'shopify.appHandle'
    )
    expect(() => shopifyAdminAppUrl('my-store', '../app')).toThrow()
  })
})
