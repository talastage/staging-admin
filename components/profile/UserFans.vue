<template>
  <BaseCard>
    <div class="user-fans">
      <!-- Header -->
      <BaseHeader :title="headerTitle"> </BaseHeader>

      <v-container fluid class="pa-0">
        <!-- Fans List -->
        <div v-if="!isLoading && fans.length > 0" class="fans-grid">
          <UserTalentCard
            v-for="fan in fans"
            :key="fan.id"
            :user="fan"
            :size="cardSize"
          >
            <template #action>
              <FanButton
                :username="fan.username"
                :initial-fanning-state="fan.is_fanned_by_auth_user"
                @fanning-updated="handleFanningUpdate(fan.id, $event)"
              />
            </template>
          </UserTalentCard>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="fans-grid">
          <UserTalentSkeleton
            v-for="n in 6"
            :key="'skeleton-' + n"
          />
        </div>

        <!-- Infinite Scroll Trigger -->
        <div
          v-show="!isLoading && hasMorePages"
          ref="scrollTrigger"
          class="scroll-trigger"
        >
          <div v-if="isLoadingMore" class="fans-grid mt-4">
            <UserTalentSkeleton
              v-for="n in 6"
              :key="'skeleton-more-' + n"
            />
          </div>
          <div v-if="isLoadingMore" class="text-center mt-4">
            <v-progress-circular
              indeterminate
              color="primary"
              size="24"
            />
          </div>
        </div>

        <!-- No Followers Found -->
        <NoContentFound
          v-if="!isLoading && fans.length === 0"
          message="No followers yet!"
        />

        <!-- Error State -->
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
          {{ error }}
        </v-alert>
      </v-container>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onActivated } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useNuxtApp } from '#app'

// Define Props
const props = defineProps<{
  username: string
}>()

// State Management
const fans = ref([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const scrollTrigger = ref<HTMLElement | null>(null)
const lastPage = ref(1)
const currentPage = ref(1)
const lastFetchTime = ref<number | null>(null)
const isFetched = ref(false)

// Pagination Constants
const ITEMS_PER_FETCH = 12
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Display Settings
const cardSize = computed(() => 'medium')

// Computed Properties
const hasMorePages = computed(() => {
  return currentPage.value < lastPage.value
})

const needsRefresh = computed(() => {
  if (!lastFetchTime.value) return true
  return Date.now() - lastFetchTime.value > CACHE_DURATION
})

// Header Title
const headerTitle = computed(() => {
  if (!isLoading.value && fans.value.length === 0) {
    return 'No followers yet.'
  }
  return 'Followers'
})

// API Calls
const fetchFans = async (reset = false) => {
  if (reset) {
    isLoading.value = true
    currentPage.value = 1
    fans.value = []
  } else {
    if (isLoadingMore.value || !hasMorePages.value) return
    isLoadingMore.value = true
  }

  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get(`/api/fans/${props.username}/fans`, {
      params: {
        page: currentPage.value,
        per_page: ITEMS_PER_FETCH,
      },
    })

    const { fans: newFans, pagination } = response.data

    // Update data
    fans.value = reset ? newFans : [...fans.value, ...newFans]
    lastPage.value = pagination.last_page
    currentPage.value++

    // Update cache timestamp
    lastFetchTime.value = Date.now()
    isFetched.value = true
  } catch (err) {
    error.value = 'Failed to fetch fans. Please try again later.'
    console.error('Error fetching fans:', err)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Reset State
const resetState = () => {
  fans.value = []
  currentPage.value = 1
  lastPage.value = 1
  error.value = null
  lastFetchTime.value = null
  isFetched.value = false
}

// Event Handlers
const handleFanningUpdate = (fanId: number, newState: boolean) => {
  const fan = fans.value.find((f) => f.id === fanId)
  if (fan) {
    fan.is_fanned_by_auth_user = newState
  }
}

// Infinite Scroll Setup
useIntersectionObserver(
  scrollTrigger,
  ([{ isIntersecting }]) => {
    if (
      isIntersecting &&
      !isLoading.value &&
      hasMorePages.value &&
      !isLoadingMore.value
    ) {
      fetchFans(false)
    }
  },
  { threshold: 0.1 }
)

// Lifecycle Hooks
onMounted(() => {
  if (!isFetched.value) {
    fetchFans(true)
  }
})

// Handle cached component reactivation
onActivated(() => {
  if (needsRefresh.value) {
    fetchFans(true)
  }
})

// Watchers
watch(
  () => props.username,
  (newUsername, oldUsername) => {
    if (newUsername !== oldUsername) {
      resetState()
      fetchFans(true)
    }
  }
)
</script>

<style scoped>
.user-fans {
  max-width: 1400px;
  margin: 0 auto;
}

.fans-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

@media (max-width: 600px) {
  .fans-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 400px) {
  .fans-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.scroll-trigger {
  min-height: 20px;
  margin: 20px 0;
}

/* Optional: Adjust the skeleton loader styles for better appearance */
.v-skeleton-loader {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}
</style>
