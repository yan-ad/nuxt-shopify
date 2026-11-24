import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const root = resolve(process.argv[2] || 'docs/.vercel/output')
const domain = 'https://shopify.yan.ad'
for (const path of ['index', 'components/forms/text-field']) {
  const html = await readFile(resolve(root, `static/${path}.html`), 'utf8')
  assert(
    html.includes(`rel="canonical" href="${domain}`),
    `Missing canonical: ${path}`
  )
  const graphs = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
    )
  ].flatMap((match) => JSON.parse(match[1]!)['@graph'] || [])
  const types = graphs.flatMap((node) => [node['@type']].flat())
  for (const type of ['WebSite', 'WebPage', 'SoftwareSourceCode'])
    assert(types.includes(type), `Missing ${type}: ${path}`)
  if (path !== 'index')
    for (const type of ['TechArticle', 'BreadcrumbList'])
      assert(types.includes(type), `Missing ${type}: ${path}`)
}
for (const file of ['llms.txt', 'llms-full.txt']) {
  const text = await readFile(resolve(root, 'static', file), 'utf8')
  assert(text.includes(domain), `Missing canonical domain: ${file}`)
  assert(!text.includes('shopify-app-nuxt.vercel.app'), `Stale domain: ${file}`)
  assert(text.length > 1000, `Incomplete ${file}`)
}
const config = JSON.parse(await readFile(resolve(root, 'config.json'), 'utf8'))
assert(
  config.routes.some(
    (route: { headers?: { Location?: string } }) =>
      route.headers?.Location === '/llms.txt'
  ),
  'Missing llm.txt redirect'
)
console.log(
  'Docs SEO output verified: schema, canonicals, LLM files and alias.'
)
