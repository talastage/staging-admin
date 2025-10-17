<template>
  <v-container>
    <ProjectPageHeader
      :project="project"
      :loading="projectLoading"
      subtitle="Project Investors & Earnings"
      :elevation="10"
    >
      <template #actions>
        <BaseButton
          title="Back to Earnings"
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-arrow-left"
          :action="navigateToProjectEarnings"
        />
      </template>
    </ProjectPageHeader>

    <BaseContent title="Investors & Earnings" :subtitle="project?.name">
      <template #action>
        <BaseViewToggle v-model="viewType" />
      </template>

      <template #content>
        <v-row v-if="loading">
          <v-col cols="12" class="d-flex justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
          </v-col>
        </v-row>

        <v-row v-else-if="error">
          <v-col cols="12">
            <v-alert type="error" variant="tonal">
              {{ error }}
              <template #append>
                <v-btn color="error" variant="text" @click="retryFetch">
                  Retry
                </v-btn>
              </template>
            </v-alert>
          </v-col>
        </v-row>

        <template v-else-if="investors.length > 0">
          <project-investor-earnings-list
            :investors="investors"
            :access-uuid="accessUuid"
            :view-type="viewType"
          />

          <v-row class="mt-6">
            <v-col cols="12" class="d-flex justify-center">
              <v-pagination
                v-if="pagination.totalPages > 1"
                v-model="pagination.currentPage"
                :length="pagination.totalPages"
                :total-visible="7"
                @update:model-value="handlePageChange"
              />
            </v-col>
          </v-row>
        </template>

        <v-row v-else>
          <v-col cols="12">
            <v-alert type="info" variant="tonal">
              No investors found for this project.
            </v-alert>
          </v-col>
        </v-row>
      </template>
    </BaseContent>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectInvestorsEarnings } from '~/composables/useProjectInvestorsEarnings'

type ViewType = 'grid' | 'list'

// Props
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  accessUuid: {
    type: String,
    required: true,
  },
  projectLoading: {
    type: Boolean,
    default: false,
  },
})

// Router setup
const router = useRouter()
const viewType = ref<ViewType>('grid')

// Get user preferred view from localStorage if available
onMounted(() => {
  try {
    const savedViewType = localStorage.getItem('investor-earnings-view-type')
    if (savedViewType === 'list' || savedViewType === 'grid') {
      viewType.value = savedViewType
    }
  } catch (e) {
    // Silent fail if localStorage is not available
  }
})

// Save view preference when it changes
watch(viewType, (newValue) => {
  try {
    localStorage.setItem('investor-earnings-view-type', newValue)
  } catch (e) {
    // Silent fail if localStorage is not available
  }
})

/**
 * Navigate to the project earnings page
 */
function navigateToProjectEarnings(): void {
  router.push(`/project/${props.accessUuid}/earnings`)
}

// Investors earnings composable
const { investors, loading, error, pagination, fetchInvestors } =
  useProjectInvestorsEarnings()

// Fetch investors data only when project is ready and not already loaded
const hasFetchedInitialData = ref(false)

// Lifecycle hooks
onMounted(async () => {
  // Only fetch if we have a project and haven't already fetched
  if (!props.projectLoading && !hasFetchedInitialData.value) {
    await fetchInvestors(props.accessUuid)
    hasFetchedInitialData.value = true
  }
})

// Watch project loading state to fetch investors when project is ready
// but only if we haven't already fetched the data
watch(
  () => props.projectLoading,
  async (newValue, oldValue) => {
    if (!newValue && oldValue && !hasFetchedInitialData.value) {
      await fetchInvestors(props.accessUuid)
      hasFetchedInitialData.value = true
    }
  }
)

// Retry fetching data
async function retryFetch(): Promise<void> {
  await fetchInvestors(props.accessUuid, pagination.currentPage)
}

/**
 * Handle pagination changes
 */
async function handlePageChange(page: number): Promise<void> {
  await fetchInvestors(props.accessUuid, page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.v-pagination {
  background-color: var(--v-surface-variant);
  border-radius: 8px;
  padding: 8px;
}
</style>
