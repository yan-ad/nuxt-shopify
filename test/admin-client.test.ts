import { describe, expect, it, vi } from 'vitest'
import type { Session, Shopify } from '@shopify/shopify-api'
import { createAdminApiContext } from '../src/runtime/server/utils/clients'

describe('Admin client permission errors', () => {
  it('extracts the request ID from SDK-canonicalized headers', async () => {
    const failure = Object.assign(new Error('private details'), {
      response: {
        code: 403,
        headers: { 'X-Request-Id': ['shopify-request-123'] }
      }
    })
    const request = vi.fn().mockRejectedValue(failure)
    const Graphql = class {
      request = request
    }
    const api = { clients: { Graphql } } as unknown as Shopify
    await expect(
      createAdminApiContext(api, { isOnline: false } as Session).graphql(
        '{ shop { name } }'
      )
    ).rejects.toMatchObject({
      status: 403,
      data: { requestId: 'shopify-request-123' }
    })
  })
  for (const code of [401, 403]) {
    it(`preserves Shopify ${code} without exposing the SDK stack or response`, async () => {
      const failure = Object.assign(new Error('private upstream details'), {
        response: { code }
      })
      const request = vi.fn().mockRejectedValue(failure)
      const Graphql = class {
        request = request
      }
      const api = { clients: { Graphql } } as unknown as Shopify
      const admin = createAdminApiContext(api, {} as Session)
      await expect(admin.graphql('{ shop { name } }')).rejects.toMatchObject({
        status: code
      })
      await expect(admin.graphql('{ shop { name } }')).rejects.not.toThrow(
        'private upstream details'
      )
    })
  }
  it('does not retry or swallow unrelated upstream failures', async () => {
    const error = new Error('network failure')
    const request = vi.fn().mockRejectedValue(error)
    const Graphql = class {
      request = request
    }
    const api = { clients: { Graphql } } as unknown as Shopify
    await expect(
      createAdminApiContext(api, {} as Session).graphql('{ shop { name } }')
    ).rejects.toBe(error)
    expect(request).toHaveBeenCalledTimes(1)
  })
})
