// stores/useTalentCollectionStore.ts

import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { useRouter } from 'vue-router'

interface TalentPreview {
  id: number
  username: string
  first_name?: string
  last_name?: string
  profile_photo?: string
  display_name?: string
}

interface Collection {
  id: number
  name: string
  talents_count: number
  display_order: number
  created_at: string
  updated_at: string
  preview_talents?: TalentPreview[]
}

interface CollectionState {
  collections: Collection[]
  isLoading: boolean
  error: string | null
  lastFetchTime: number
  activeCollection: Collection | null
}

export const useTalentCollectionStore = defineStore('talentCollections', {
  state: (): CollectionState => ({
    collections: [],
    isLoading: false,
    error: null,
    lastFetchTime: 0,
    activeCollection: null,
  }),

  getters: {
    sortedCollections: (state) => {
      return [...state.collections].sort((a, b) => {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      })
    },

    getCollectionById: (state) => (id: number) => {
      return state.collections.find((c) => c.id === id)
    },

    isTalentInCollection:
      (state) => (collectionId: number, talentId: string | number) => {
        const collection = state.collections.find((c) => c.id === collectionId)
        if (!collection || !collection.preview_talents) return false

        const talentIdString = talentId?.toString()
        if (!talentIdString) return false

        return collection.preview_talents.some(
          (t) => t.username === talentIdString || t.id === talentId
        )
      },
  },

  actions: {
    async fetchCollections(force = false) {
      const CACHE_TIME = 5 * 60 * 1000 // 5 minutes
      if (
        !force &&
        this.collections.length > 0 &&
        Date.now() - this.lastFetchTime < CACHE_TIME
      ) {
        return this.collections
      }

      this.isLoading = true
      this.error = null

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.get('/api/talent/collections')
        this.collections = response.data.data
        this.lastFetchTime = Date.now()
        return this.collections
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Failed to load collections'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchCollection(id: string | number) {
      try {
        const { $axios } = useNuxtApp()

        // Single request to get both collection and its talents
        const response = await $axios.get(`/api/talent/collections/${id}`)

        return {
          collection: response.data.collection,
          talents: response.data.talents,
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Failed to fetch collection'
        throw error
      }
    },

    async createCollection(name: string) {
      const { $axios } = useNuxtApp()
      const router = useRouter()

      if (!name.trim()) {
        throw new Error('Collection name is required')
      }

      // Check for duplicates
      const isDuplicate = this.collections.some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      )
      if (isDuplicate) {
        throw new Error('A collection with this name already exists')
      }

      try {
        const response = await $axios.post('/api/talent/collections', { name })
        const newCollection = response.data.data // Make sure we're accessing the correct data structure

        // Only add to collections if we got valid data
        if (newCollection && newCollection.id) {
          this.collections.unshift(newCollection)
          // Don't navigate if we're in the dialog
          // await router.push(`/talents/collections/${newCollection.id}`)
        }
        return newCollection
      } catch (error: any) {
        // Make sure we're only throwing errors for actual errors
        if (error.response?.status >= 400) {
          throw new Error(
            error.response?.data?.message || 'Failed to create collection'
          )
        }
        // If we have data in the response, don't treat it as an error
        if (error.response?.data?.data) {
          return error.response.data.data
        }
        throw error
      }
    },

    async updateCollection(id: number, data: { name: string }) {
      const { $axios } = useNuxtApp()

      if (!data.name.trim()) {
        throw new Error('Collection name is required')
      }

      try {
        const response = await $axios.put(`/api/talent/collections/${id}`, data)
        const updatedCollection = response.data.data

        const index = this.collections.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.collections[index] = {
            ...this.collections[index],
            ...updatedCollection,
          }
        }

        return updatedCollection
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || 'Failed to update collection'
        )
      }
    },

    async deleteCollection(id: number) {
      try {
        const { $axios } = useNuxtApp()
        await $axios.delete(`/api/talent/collections/${id}`)

        // Remove from local state
        this.collections = this.collections.filter((c) => c.id !== id)

        return true
      } catch (error: any) {
        console.error('Failed to delete collection:', error)
        throw new Error(
          error.response?.data?.message || 'Failed to delete collection'
        )
      }
    },

    async addTalentToCollection(collectionId: number, username: string) {
      if (!username) {
        throw new Error('Username is required')
      }

      console.log('Store addTalentToCollection:', { collectionId, username })
      const { $axios } = useNuxtApp()
      try {
        const response = await $axios.post(
          `/api/talent/collections/${collectionId}/talents`,
          { talent_id: username } // The backend expects talent_id
        )

        // Update local collection
        const collection = this.collections.find((c) => c.id === collectionId)
        if (collection) {
          collection.talents_count++
          if (response.data.talent && collection.preview_talents?.length < 4) {
            collection.preview_talents?.unshift(response.data.talent)
          }
        }

        return response.data
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || 'Failed to add talent to collection'
        )
      }
    },

    async removeTalentFromCollection(
      collectionId: number,
      talentId: number | string
    ) {
      const { $axios } = useNuxtApp()
      try {
        await $axios.delete(
          `/api/talent/collections/${collectionId}/talents/${talentId}`
        )

        // Update local collection
        const collection = this.collections.find((c) => c.id === collectionId)
        if (collection) {
          collection.talents_count--
          if (collection.preview_talents) {
            collection.preview_talents = collection.preview_talents.filter(
              (t) => t.username !== talentId.toString() && t.id !== talentId
            )
          }
        }
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message ||
            'Failed to remove talent from collection'
        )
      }
    },

    async reorderCollections(collectionIds: number[]) {
      const { $axios } = useNuxtApp()
      try {
        await $axios.post('/api/talent/collections/reorder', {
          collection_ids: collectionIds,
        })

        // Update local order
        this.collections = collectionIds
          .map((id) => this.collections.find((c) => c.id === id))
          .filter((c): c is Collection => c !== undefined)
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || 'Failed to reorder collections'
        )
      }
    },
  },
})
