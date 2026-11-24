import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Unit tests import plain TS from both the module and docs. Neither should
  // require the docs app's generated .nuxt config to transform those files.
  tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url))
})
