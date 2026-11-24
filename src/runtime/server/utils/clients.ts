import type { Session, Shopify, ApiVersion } from '@shopify/shopify-api'
import { HTTPError } from 'nitro/h3'
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
  onError?: (error: any) => void
): AdminApiContext {
  const graphql: GraphQLClient<AdminOperations> = async (query, options) => {
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
        throw new HTTPError({
          status: code,
          message: code === 403
            ? 'Shopify denied Admin API access. Confirm the app installation has the required scopes and your staff account can access this resource. Approve updated app permissions in Shopify admin, then reopen the app.'
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
