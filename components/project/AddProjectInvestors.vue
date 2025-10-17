<template>
  <div class="project-investors-page">
    <!-- Share Distribution Card -->
    <v-row class="mb-4">
      <v-col cols="12">
        <ProjectInvestorSharePercentageTracker :stats="shareStats" />
      </v-col>
    </v-row>

    <!-- Page Header -->
    <BaseHeader title="Investors">
      <template #subtitle>
        Manage project investors and their equity shares. When your project
        earns revenue, profits are automatically distributed based on each
        investor's percentage allocation.
      </template>
      <template #actionable>
        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="openAddInvestorDialog"
          :disabled="store.isLoading"
        >
          Add Investor
        </v-btn>
      </template>
    </BaseHeader>

    <v-container>
      <!-- Initial load skeletons -->
      <v-row v-if="scrollLoading && projectInvestors.length === 0">
        <v-col cols="12">
          <v-skeleton-loader v-for="n in 3" :key="n" type="card" class="mb-4" />
        </v-col>
      </v-row>

      <!-- Empty state -->
      <v-row v-else-if="showEmptyState">
        <v-col cols="12">
          <EmptyStateCard
            icon="mdi-account-group"
            icon-size="64"
            icon-color="grey-lighten-1"
            title="No Investors Yet"
            message="This project doesn't have any investors at the moment."
            button-text="Add an Investor"
            button-color="primary"
            @action-click="openAddInvestorDialog"
          />
        </v-col>
      </v-row>

      <!-- Investors List -->
      <div v-else>
        <v-row>
          <v-col cols="12" v-for="inv in projectInvestors" :key="inv.id">
            <ProjectInvestorCard :investor="inv">
              <!-- Slot: actions -->
              <template #actions>
                <!-- Edit button -->
                <v-tooltip text="Edit Investor" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil"
                      variant="tonal"
                      color="primary"
                      size="small"
                      @click="openEditInvestorDialog(inv)"
                    />
                  </template>
                </v-tooltip>

                <!-- Delete button -->
                <v-tooltip text="Remove Investor" location="top">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-delete"
                      variant="tonal"
                      color="error"
                      size="small"
                      @click="confirmDeleteInvestor(inv)"
                    />
                  </template>
                </v-tooltip>
              </template>
            </ProjectInvestorCard>
          </v-col>
        </v-row>

        <!-- Loading next page indicator -->
        <v-row v-if="scrollLoading && hasMore">
          <v-col cols="12" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="24" />
          </v-col>
        </v-row>

        <!-- No more data alert -->
        <v-row v-if="!hasMore && projectInvestors.length > 0">
          <v-col cols="12" class="text-center py-4">
            <v-alert type="info" variant="tonal" class="ma-0">
              No more investors to load.
            </v-alert>
          </v-col>
        </v-row>
      </div>
    </v-container>

    <!-- Dialogs -->
    <AddProjectInvestorDialog
      v-model="showAddInvestorDialog"
      :access-uuid="project?.access_uuid"
      :editing-investor="editingInvestor"
      @investor-added="handleInvestorAdded"
      @investor-updated="handleInvestorUpdated"
    />

    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :title="deleteDialogTitle"
      :message="deleteDialogMessage"
      :loading="isDeletingInvestor"
      @confirm="deleteInvestor"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectInvestorsStore } from '~/stores/useProjectInvestorsStore'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { Project } from '~/types/project'

/** ========================
 *  Props
 * ========================= */
const props = defineProps<{
  project: Project | null // Explicitly marked as nullable
}>()

/** ========================
 *  Store & Composables
 * ========================= */
const store = useProjectInvestorsStore()
const snackStore = useSnackMessageStore()

// Computed stats for share distribution
const shareStats = computed(() => {
  return (
    store.stats || {
      creator_shares: 100,
      investor_shares: 0,
      total_investors: 0,
    }
  )
})

/** ========================
 *  State & Dialog
 * ========================= */
const showAddInvestorDialog = ref(false)
const showDeleteDialog = ref(false)
const editingInvestor = ref<any>(null)
const selectedInvestor = ref<any>(null)
const isDeletingInvestor = ref(false)

/** ========================
 *  Infinite Scroll Setup
 * ========================= */
async function fetchItems(page: number) {
  // Guard if project is null or undefined
  if (!props.project?.access_uuid) return []

  const initialLength = store.projectInvestors.length
  await store.fetchProjectInvestors(props.project.access_uuid, page, 10)
  const newItems = store.projectInvestors.slice(initialLength)
  return newItems
}

const {
  items: investorItems,
  isLoading: scrollLoading,
  hasMore,
  refresh,
} = useInfiniteScroll(fetchItems, {
  initialLoadDelay: 0,
})

const projectInvestors = computed(() => investorItems.value)
const showEmptyState = computed(
  () => projectInvestors.value.length === 0 && !scrollLoading.value
)

/** ========================
 *  Delete Dialog Computed
 * ========================= */
const deleteDialogTitle = computed(() => {
  // Handle both user and page investorables
  const investorable = selectedInvestor.value?.investorable
  if (!investorable) return 'Remove Investor'

  const type = selectedInvestor.value?.investorable_type?.toLowerCase() || ''

  // Determine name based on whether it's a user or page
  let name
  if (type.includes('user')) {
    name =
      investorable.name ||
      investorable.display_name ||
      investorable.username ||
      'Investor'
  } else {
    name =
      investorable.display_name ||
      investorable.name ||
      investorable.slug ||
      'Investor'
  }

  return `Remove ${name}`
})

const deleteDialogMessage = computed(() => {
  // Handle both user and page investorables
  const investorable = selectedInvestor.value?.investorable
  if (!investorable)
    return 'Are you sure you want to remove this investor from the project?'

  const type = selectedInvestor.value?.investorable_type?.toLowerCase() || ''

  // Determine name based on whether it's a user or page
  let name
  if (type.includes('user')) {
    name =
      investorable.name ||
      investorable.display_name ||
      investorable.username ||
      'this investor'
  } else {
    name =
      investorable.display_name ||
      investorable.name ||
      investorable.slug ||
      'this investor'
  }

  return `Are you sure you want to remove ${name} from the project?`
})

/** ========================
 *  Lifecycle
 * ========================= */
onMounted(() => {
  // Reset the investor store state before loading new data
  store.resetState()
})

/** ========================
 *  Dialog Handlers
 * ========================= */
function openAddInvestorDialog() {
  editingInvestor.value = null
  showAddInvestorDialog.value = true
}

function openEditInvestorDialog(inv: any) {
  editingInvestor.value = inv
  showAddInvestorDialog.value = true
}

function confirmDeleteInvestor(inv: any) {
  selectedInvestor.value = inv
  showDeleteDialog.value = true
}

function cancelDelete() {
  showDeleteDialog.value = false
  selectedInvestor.value = null
}

/** ========================
 *  Investor CRUD Handlers
 * ========================= */
function handleInvestorAdded() {
  snackStore.success('Project investor added successfully.')
  store.resetState()
  refresh()
}

function handleInvestorUpdated() {
  snackStore.success('Project investor updated successfully.')
  store.resetState()
  refresh()
}

async function deleteInvestor() {
  if (!selectedInvestor.value || !props.project?.access_uuid) return
  isDeletingInvestor.value = true
  try {
    // Make sure we have a valid investor ID
    const investorId = selectedInvestor.value.id
    if (!investorId) {
      snackStore.error('Invalid investor information. Please try again.')
      return
    }

    await store.deleteProjectInvestor(props.project.access_uuid, investorId)
    snackStore.success('Project investor removed successfully.')
    store.resetState()
    refresh()
  } catch (error) {
    console.error('Error deleting investor:', error)
    snackStore.error('Failed to remove project investor. Please try again.')
  } finally {
    isDeletingInvestor.value = false
    cancelDelete()
  }
}
</script>

<style scoped lang="scss">
.project-investors-page {
  min-height: 100vh;

  :deep(.v-alert) {
    border-radius: 8px;
  }
}
</style>
