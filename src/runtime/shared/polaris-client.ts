import { onMounted, shallowRef } from 'vue'

/** Match SSR with the first client render before mounting browser-only elements. */
export function usePolarisClient() {
  const mounted = shallowRef(false)
  onMounted(() => {
    mounted.value = true
  })
  return mounted
}
