<template>
  <div class="cast-and-crew">
    <v-container class="px-0">
      <!-- Header Section -->
      <BaseHeader
        title="Cast & Crew"
        :subtitle="`Showcase your project's talent - from lead actors to behind-the-scenes crew. ${totalMembers} ${
          totalMembers === 1 ? 'member' : 'members'
        } currently on your team.`"
      >
        <template #actionable>
          <v-btn
            color="primary"
            prepend-icon="mdi-account-plus"
            @click="openAddCreditDialog"
            :disabled="isLoading"
          >
            Add Member
          </v-btn>
        </template>
      </BaseHeader>

      <!-- Credits Grid Component -->
      <ProjectCreditGrid
        :is-loading="isLoading"
        :is-loading-more="isLoadingMore"
        :has-more="hasMore"
        :show-actions="true"
        :empty-state-title="'No Cast & Crew Members Yet'"
        :empty-state-message="'Start building your project team by adding cast and crew members.'"
        :show-empty-state-action="true"
        empty-state-action-text="Add First Member"
        @delete-credit="confirmDeleteCredit"
        @edit-credit="openEditCreditDialog"
        @empty-state-action="openAddCreditDialog"
      />

      <!-- Dialogs -->
      <AddProjectCreditDialog
        v-model="showAddCreditDialog"
        :project="project"
        @credit-added="handleCreditAdded"
      />

      <EditProjectCreditDialog
        v-model="showEditCreditDialog"
        :credit="creditToEdit"
        :project-access-uuid="project.access_uuid"
        @credit-updated="handleCreditUpdated"
      />

      <ConfirmDeleteDialog
        v-model="showDeleteDialog"
        title="Delete Member"
        message="Are you sure you want to remove this member? This action cannot be undone."
        :loading="isDeleting"
        @confirm="handleDelete"
        @cancel="handleCancel"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProjectCreditStore } from '@/stores/useProjectCreditStore'
import { useToast } from 'vue-toastification'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

interface Credit {
  id: number
  user: {
    id: number
    username: string
    display_name: string
    profile_photo: string
    talent: string
  }
  role: {
    id: number | null
    name: string
    is_custom: boolean
    category: {
      id: number
      name: string
    } | null
  }
  status: string
  created_at: string
}

const props = defineProps<{
  project: {
    id: number
    access_uuid: string
    name: string
  }
}>()

const toast = useToast()
const store = useProjectCreditStore()

// Dialog controls
const showAddCreditDialog = ref(false)
const showEditCreditDialog = ref(false)
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const creditToDelete = ref<Credit | null>(null)
const creditToEdit = ref<Credit | null>(null)

// State
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const isInitialized = ref(false)

// Computed
const totalMembers = computed(() => store.totalMembers)
const categoryGroups = computed(() => store.categoryGroups)

const PER_PAGE = 16

// Fetch credits with pagination
const fetchCreditsPage = async (page: number) => {
  // Prevent duplicate initial load
  if (page === 1 && isInitialized.value) return []
  if (isLoadingMore.value && page > 1) return []

  try {
    if (page > 1) {
      isLoadingMore.value = true
    }

    const credits = await store.fetchCredits(props.project.access_uuid, page)

    if (page === 1) {
      isInitialized.value = true
    }

    // Update pagination state
    hasMore.value = store.hasMorePages
    currentPage.value = store.page

    return credits.flatMap((group: any) => group.credits)
  } catch (error) {
    console.error('Error fetching credits:', error)
    toast.error('Failed to load members')
    return []
  } finally {
    if (page > 1) {
      isLoadingMore.value = false
    }
    if (page === 1) {
      isLoading.value = false
    }
  }
}

// Initialize infinite scroll
const { error: scrollError } = useInfiniteScroll(fetchCreditsPage, {
  threshold: 200,
  throttle: 300,
  initialLoadDelay: 0,
})

// Methods
const openAddCreditDialog = () => {
  showAddCreditDialog.value = true
}

const openEditCreditDialog = (credit: Credit) => {
  creditToEdit.value = credit
  showEditCreditDialog.value = true
}

const handleCreditAdded = async (newCredit?: Credit) => {
  showAddCreditDialog.value = false

  if (newCredit) {
    // Add the new credit to the store immediately for instant UI update
    store.addCreditToState(newCredit)
    toast.success('Member added successfully')
  } else {
    // Fallback: refresh the first page if no credit data is provided
    try {
      await store.fetchCredits(props.project.access_uuid, 1)
      toast.success('Member added successfully')
    } catch (error) {
      toast.error('Failed to refresh member list')
    }
  }
}

const handleCreditUpdated = (updatedCredit: Credit) => {
  showEditCreditDialog.value = false
  creditToEdit.value = null
  
  // Update the credit in the store immediately for instant UI update
  store.updateCreditInState(updatedCredit)
  toast.success('Member role updated successfully')
}

const confirmDeleteCredit = (credit: Credit) => {
  creditToDelete.value = credit
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!creditToDelete.value) return

  isDeleting.value = true
  try {
    // Use the store's optimized delete method
    await store.deleteCredit(props.project.access_uuid, creditToDelete.value.id)

    showDeleteDialog.value = false
    creditToDelete.value = null
    toast.success('Member removed successfully')

    // Check if we need to load more items to maintain page size
    const currentTotal = store.getTotalCredits
    if (currentTotal < PER_PAGE && store.hasMorePages) {
      try {
        await store.fetchCredits(props.project.access_uuid, store.page + 1)
      } catch (error) {
        console.error('Error loading more items after deletion:', error)
      }
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to remove member')
  } finally {
    isDeleting.value = false
  }
}

const handleCancel = () => {
  showDeleteDialog.value = false
  creditToDelete.value = null
}

// Initialize
onMounted(async () => {
  try {
    await fetchCreditsPage(1)
  } catch (error) {
    console.error('Error during initial load:', error)
  }
})

// Cleanup
onUnmounted(() => {
  store.resetState()
  isInitialized.value = false
})
</script>

<style scoped>
.cast-and-crew {
  min-height: 400px;
}
</style>
