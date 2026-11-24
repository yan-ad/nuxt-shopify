import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'smol-toml'

/** Build-time only. Never copy the full Shopify config into runtime config. */
export async function resolveAppHandle(
  rootDir: string,
  apiKey: string,
  explicit?: string,
  warn: (message: string) => void = () => {}
): Promise<string> {
  if (explicit?.trim()) return explicit.trim()
  const files = (await readdir(rootDir))
    .filter((name) => /^shopify\.app(?:\.[\w-]+)?\.toml$/.test(name))
    .sort()
  const configs: Array<{ file: string; clientId: string; handle: string }> = []
  for (const file of files) {
    try {
      const config = parse(await readFile(join(rootDir, file), 'utf8'))
      if (
        typeof config.handle === 'string' &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(config.handle)
      ) {
        configs.push({
          file,
          clientId:
            typeof config.client_id === 'string' ? config.client_id : '',
          handle: config.handle
        })
      }
    } catch {
      warn(
        `Could not read ${file}. Set shopify.appHandle explicitly or fix the TOML configuration.`
      )
    }
  }
  const candidates = apiKey
    ? configs.filter((config) => config.clientId === apiKey)
    : configs
  const handles = [...new Set(candidates.map((config) => config.handle))]
  if (handles.length === 1) return handles[0]!
  if (configs.length)
    warn(
      apiKey && !candidates.length
        ? 'No Shopify app config handle matches shopify.apiKey. Set shopify.appHandle explicitly or use matching app credentials.'
        : 'Multiple Shopify app handles were found. Set shopify.appHandle explicitly to select the app.'
    )
  return ''
}
