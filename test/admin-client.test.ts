import { describe, expect, it, vi } from 'vitest'
import type { Session, Shopify } from '@shopify/shopify-api'
import { createAdminApiContext } from '../src/runtime/server/utils/clients'

describe('Admin client permission errors', () => {
  for (const code of [401, 403]) {
    it(`preserves Shopify ${code} without exposing the SDK stack or response`, async () => {
      const failure = Object.assign(new Error('private upstream details'), { response: { code } })
      const request = vi.fn().mockRejectedValue(failure)
      const Graphql = class { request = request }
      const api = { clients: { Graphql } } as unknown as Shopify
      const admin = createAdminApiContext(api, {} as Session)
      await expect(admin.graphql('{ shop { name } }')).rejects.toMatchObject({ status: code })
      await expect(admin.graphql('{ shop { name } }')).rejects.not.toThrow('private upstream details')
    })
  }
  it('does not retry or swallow unrelated upstream failures', async () => {
    const error = new Error('network failure')
    const request = vi.fn().mockRejectedValue(error)
    const Graphql = class { request = request }
    const api = { clients: { Graphql } } as unknown as Shopify
    await expect(createAdminApiContext(api, {} as Session).graphql('{ shop { name } }')).rejects.toBe(error)
    expect(request).toHaveBeenCalledTimes(1)
  })
})
