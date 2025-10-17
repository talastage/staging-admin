// stores/usePublishingStore.ts
import { defineStore } from 'pinia'

export type PublishOption = 'now' | 'schedule' | 'draft'

interface PublishingState {
  publishOption: PublishOption
  dateToPost: string
  timeToPost: string
  processingAction: 'premiereNow' | 'schedulePremiere' | 'saveDraft' | null
}

export const usePublishingStore = defineStore('publishing', {
  state: (): PublishingState => ({
    publishOption: 'now',
    dateToPost: '',
    timeToPost: '02:25',
    processingAction: null,
  }),

  getters: {
    actionTitle(): string {
      switch (this.publishOption) {
        case 'schedule':
          return 'Schedule Premiere'
        case 'draft':
          return 'Save Draft'
        default:
          return 'Premiere Now'
      }
    },

    actionIcon(): string {
      switch (this.publishOption) {
        case 'schedule':
          return 'mdi-calendar-check'
        case 'draft':
          return 'mdi-content-save'
        default:
          return 'mdi-rocket-launch'
      }
    },

    actionColor(): string {
      return this.publishOption === 'draft' ? 'secondary' : 'primary'
    },
  },
})
