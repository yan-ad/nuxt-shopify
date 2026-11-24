import type { Session, Shopify, ApiVersion } from '@shopify/shopify-api'
import { HTTPError } from 'nitro/h3'
import type { SessionStorage } from '@shopify/shopify-app-session-storage'
import { ensureOfflineSession } from './offline-session'
import { getSessionStorage } from '../services/shopify'
import type {
  AdminOperations,
  AllOperations,
  ApiClientRequestOptions,
  ReturnData,
  ClientResponse
} from '@shopify/admin-api-client'

// ─── GraphQL Client Types ────────────────────────────────────────────────────

export interface GraphQLQueryOptions<
  Operation extends keyof Operations,
  Operations extends AllOperations
> {
  /** The variables to pass to the operation. */
  variables?: ApiClientRequestOptions<Operation, Operations>['variables']
  /** The version of the API to use for the request. */
  apiVersion?: ApiVersion
  /** Additional headers to include in the request. */
  headers?: Record<string, string>
  /** The total number of times to try the request if it fails. */
  tries?: number
  /** An optional AbortSignal to cancel the request. */
  signal?: AbortSignal
}

export type GraphQLResponse<
  TData = undefined,
  Operation extends keyof Operations = string,
  Operations extends AllOperations = AllOperations
> = ClientResponse<
  TData extends undefined ? ReturnData<Operation, Operations> : TData
>

export type GraphQLClient<Operations extends AllOperations> = <
  TData = undefined,
  Operation extends keyof Operations = string
>(
  query: Operation,
  options?: GraphQLQueryOptions<Operation, Operations>
) => Promise<GraphQLResponse<TData, Operation, Operations>>

// ─── Admin API Context ───────────────────────────────────────────────────────

export interface AdminApiContext {
  /** Make a typed GraphQL request to the Shopify Admin API */
  graphql: GraphQLClient<AdminOperations>
}

// ─── Factories ──────────────────────────────────────────────────────────────

export function createAdminApiContext(
  api: Shopify,
  session: Session,
  onError?: (error: any) => void,
  sessionStorage?: SessionStorage
): AdminApiContext {
  const graphql: GraphQLClient<AdminOperations> = async (query, options) => {
    if (!session.isOnline && session.accessToken) {
      const current = await ensureOfflineSession(
        api,
        sessionStorage || getSessionStorage(),
        session
      )
      Object.assign(session, current)
    }
    const client = new api.clients.Graphql({
      session,
      apiVersion: options?.apiVersion
    })
    try {
      const response = await client.request(query as string, {
        variables: options?.variables as Record<string, unknown>,
        retries: options?.tries,
        headers: options?.headers
      })
      return response as GraphQLResponse
    } catch (error) {
      if (onError) onError(error)
      const code = (error as { response?: { code?: number } })?.response?.code
      if (code === 401 || code === 403) {
        const headers = (
          error as {
            response?: { headers?: Record<string, string | string[]> }
          }
        ).response?.headers
        const rawRequestId = Object.entries(headers || {}).find(
          ([name]) => name.toLowerCase() === 'x-request-id'
        )?.[1]
        const requestId = Array.isArray(rawRequestId)
          ? rawRequestId[0]
          : rawRequestId
        console.warn('[@yan-ad/nuxt-shopify] Admin API access rejected', {
          status: code,
          shop: session.shop,
          tokenType: session.isOnline ? 'online' : 'offline',
          scopes: session.scope,
          requestId
        })
        throw new HTTPError({
          status: code,
          data: requestId ? { requestId } : undefined,
          message:
            code === 403
              ? `Shopify denied this Admin API request using an ${session.isOnline ? 'online' : 'offline'} token. Check installed access to determine whether basic shop queries also fail.${requestId ? ` Shopify request ID: ${requestId}.` : ''}`
              : 'Shopify rejected the Admin API access token. Reopen the app from Shopify admin to authenticate again.'
        })
      }
      throw error
    }
  }

  return {
    graphql
  }
}
