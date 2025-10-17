// stores/loginDialog.ts
import { defineStore } from 'pinia'

export const useLoginDialogStore = defineStore('loginDialog', {
  state: () => ({
    isVisible: false,
    requestedRoute: null,
  }),
  actions: {
    show() {
      this.isVisible = true
    },
    hide() {
      this.isVisible = false
    },
    setRequestedRoute(route) {
      this.requestedRoute = route
    },
    clearRequestedRoute() {
      this.requestedRoute = null
    },
  },
})