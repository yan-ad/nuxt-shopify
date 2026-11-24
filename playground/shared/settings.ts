export interface PlaygroundSettings {
  pageSize: number
  defaultStatus: 'all' | 'active' | 'draft' | 'archived'
}

// Initial preferences only: products and store data always come from Shopify.
export const defaultSettings: PlaygroundSettings = {
  pageSize: 20,
  defaultStatus: 'all'
}

export function parseSettings(value: unknown): PlaygroundSettings {
  if (!value || typeof value !== 'object') throw new Error('Invalid settings')
  const input = value as Record<string, unknown>
  if (
    ![10, 20, 50].includes(input.pageSize as number) ||
    !['all', 'active', 'draft', 'archived'].includes(
      input.defaultStatus as string
    )
  ) {
    throw new Error(
      'Choose a page size of 10, 20, or 50 and a valid product status.'
    )
  }
  return {
    pageSize: input.pageSize as number,
    defaultStatus: input.defaultStatus as PlaygroundSettings['defaultStatus']
  }
}
