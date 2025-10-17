import { createPersistedState } from 'pinia-plugin-persistedstate'

import { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp: { $pinia: Pinia }) => {
  nuxtApp.$pinia.use(
    createPersistedState({
      storage: localStorage,
    }) // This closing parenthesis was missing
  )
})
