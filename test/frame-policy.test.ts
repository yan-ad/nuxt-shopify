import { describe, expect, it } from 'vitest'
import { shopifyFramePolicy } from '../src/runtime/server/utils/frame-policy'

describe('Shopify iframe policy', () => {
  it('allows same-origin DevTools ancestors only in development', () => {
    expect(
      shopifyFramePolicy('https://app.test/_shopify/devtools', true)
    ).toContain("frame-ancestors 'self'")
    expect(
      shopifyFramePolicy('https://app.test/_shopify/devtools/store', true)
    ).toContain("'self'")
    expect(
      shopifyFramePolicy('https://app.test/_shopify/devtools', false)
    ).not.toContain("'self'")
    expect(shopifyFramePolicy('https://app.test/products', true)).not.toContain(
      "'self'"
    )
    expect(
      shopifyFramePolicy('https://app.test/_shopify/devtools-other', true)
    ).not.toContain("'self'")
  })
  it('retains Shopify ancestors for the complete embedded frame chain', () => {
    const policy = shopifyFramePolicy(
      'https://app.test/_shopify/devtools?shop=test.myshopify.com',
      true
    )
    expect(policy).toContain('https://test.myshopify.com')
    expect(policy).toContain('https://admin.shopify.com')
  })
  it('does not interpolate untrusted shop query strings into CSP', () => {
    const policy = shopifyFramePolicy(
      'https://app.test/?shop=' + encodeURIComponent('evil.test; script-src *'),
      true
    )
    expect(policy).not.toContain('evil.test')
    expect(policy).not.toContain('script-src')
  })
})
