import type { Session } from '@shopify/shopify-api'
import type { ResolvedConfig } from '../../types'

export function getDevtoolsInfo(config: ResolvedConfig, session: Session) {
  // Explicit allowlist: never serialize runtime config or the Session wholesale.
  return {
    configuration: {
      apiVersion: config.apiVersion,
      appUrl: config.appUrl,
      distribution: config.distribution,
      requestedScopes: config.scopes || []
    },
    session: {
      shop: session.shop,
      mode: session.isOnline ? 'online' : 'offline',
      grantedScopes:
        session.scope?.split(',').map((scope) => scope.trim()) || [],
      accessTokenExpires: session.expires?.toISOString() || null,
      refreshTokenExpires: session.refreshTokenExpires?.toISOString() || null,
      refreshAvailable: Boolean(session.refreshToken)
    }
  }
}
