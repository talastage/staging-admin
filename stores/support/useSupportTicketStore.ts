// stores/support/useSupportTicketStore.ts
import { defineStore } from 'pinia'
import type { SupportTicket } from '~/types/support'

interface State {
  currentTicket: SupportTicket | null
  isLoading: boolean
  error: any
}

export const useSupportTicketStore = defineStore('supportTicket', {
  state: (): State => ({
    currentTicket: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchTicket(uuid: string) {
      this.isLoading = true
      try {
        const { data } = await useNuxtApp().$axios.get(
          `/api/support/tickets/${uuid}`
        )
        this.currentTicket = data.data
        return data.data
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.isLoading = false
      }
    },

    updateTicketStatus(status: string) {
      if (this.currentTicket) {
        this.currentTicket.status = status
      }
    },

    addMessage(message: any) {
      if (this.currentTicket?.messages) {
        this.currentTicket.messages.push(message)
      }
    },
  },
})
