// stores/useProjectReactionsStore.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { useProjectMetadataStore } from '~/stores/useProjectMetadataStore'

interface ReactionState {
  likesCount: number
  dislikesCount: number
  userReaction: string | null
  isLoading: boolean
  projectId: number | null
}

export const useProjectReactionsStore = defineStore('projectReactions', {
  state: (): ReactionState => ({
    likesCount: 0,
    dislikesCount: 0,
    userReaction: null,
    isLoading: false,
    projectId: null,
  }),

  getters: {
    hasReacted: (state) => state.userReaction !== null,
  },

  actions: {
    initializeFromMetadata(metadata: any) {
      if (metadata) {
        this.likesCount = metadata.stats.likes_count
        this.dislikesCount = metadata.stats.dislikes_count
        this.userReaction = metadata.user_interaction.user_reaction
        this.projectId = metadata.project.id
      }
    },

    async toggleReaction(accessUuid: string, reactionType: 'like' | 'dislike') {
      if (this.isLoading) return

      try {
        this.isLoading = true
        const { $axios } = useNuxtApp()

        // Perform the API call
        const response = await $axios.post(
          `/api/projects/${accessUuid}/reaction`,
          {
            reaction_type: reactionType,
          }
        )

        // Update local state
        this.likesCount = response.data.likes_count
        this.dislikesCount = response.data.dislikes_count
        this.userReaction = response.data.user_reaction

        // Update metadata store if needed
        const projectMetadataStore = useProjectMetadataStore()
        if (projectMetadataStore.metadata) {
          projectMetadataStore.metadata.stats.likes_count =
            response.data.likes_count
          projectMetadataStore.metadata.stats.dislikes_count =
            response.data.dislikes_count
          projectMetadataStore.metadata.user_interaction.user_reaction =
            response.data.user_reaction
        }

        return response.data
      } catch (error) {
        console.error('Error toggling reaction:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Reset store state
    reset() {
      this.likesCount = 0
      this.dislikesCount = 0
      this.userReaction = null
      this.isLoading = false
      this.projectId = null
    },
  },
})
