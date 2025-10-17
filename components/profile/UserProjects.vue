<template>
  <BaseCard>
    <!-- <BaseHeader title="My Premiered Projects" /> -->
    <ProjectGrid
      :projects="store.projects"
      :total-projects="store.totalProjects"
      :current-page="store.pagination.currentPage"
      :last-page="store.pagination.lastPage"
      :is-loading="store.isLoading"
      variant="grid"
      title="User Projects"
      @load-more="fetchProjects"
    >
      <template #header>
        <BaseHeader :title="headerTitle">
          <template #subtitle>
            <p class="text-subtitle-1">{{ store.totalProjects }} premieres</p>
          </template>
        </BaseHeader>
      </template>

      <template #empty-state>
        <!-- Empty State for Profile Owner -->
        <EmptyStateCard
          v-if="isProfileOwner"
          title="Start Your Creative Journey"
          :message="ownerEmptyMessage"
          action-text="Premiere Your First Project"
          link="/premiering"
        >
          <template #icon>
            <v-icon size="64" color="primary" class="mb-4">
              mdi-movie-plus-outline
            </v-icon>
          </template>
          <template #extra-content>
            <v-card-text class="text-center">
              <v-chip
                v-for="(tip, index) in creatorTips"
                :key="index"
                class="ma-1"
                color="primary"
                variant="outlined"
                size="small"
              >
                {{ tip }}
              </v-chip>
            </v-card-text>
          </template>
        </EmptyStateCard>

        <!-- Empty State for Visitors -->
        <EmptyStateCard
          v-else
          :title="`${username}'s Premieres`"
          :message="visitorEmptyMessage"
        >
          <template #icon>
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-movie-open-outline
            </v-icon>
          </template>
          <template #extra-content>
            <v-card-text class="text-center text-caption text-grey-darken-1">
              Follow {{ username }} to get notified when they share new projects
            </v-card-text>
          </template>
        </EmptyStateCard>
      </template>
    </ProjectGrid>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProjectsStore } from '~/stores/userProjectsStore'
import { useProfileOwnership } from '~/composables/useProfileOwnership'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const store = useUserProjectsStore()
const { isProfileOwner } = useProfileOwnership(props.username)

// Cache management
const lastFetchTime = ref<number | null>(null)
const isFetched = ref(false)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Computed properties
const headerTitle = computed(() =>
  isProfileOwner.value ? 'My Premieres' : `${props.username}'s Premieres`
)

const ownerEmptyMessage = computed(
  () => `
  Ready to showcase your talent? Start by premiering your first project.
  Share your creative work with the world and build your portfolio.
`
)

const visitorEmptyMessage = computed(
  () => `
  ${props.username} hasn't shared any premieres yet.
  Check back later to see what they create!
`
)

const needsRefresh = computed(() => {
  if (!lastFetchTime.value) return true
  return Date.now() - lastFetchTime.value > CACHE_DURATION
})

const creatorTips = [
  '🎬 Share Your Work',
  '🌟 Build Your Portfolio',
  '🤝 Connect with Others',
  '💡 Inspire & Get Inspired',
]

// Methods
const fetchProjects = async (force = false) => {
  // Skip if data is cached and fresh, unless forced
  if (!force && !needsRefresh.value && isFetched.value) {
    return
  }

  try {
    await store.fetchProjects(props.username)
    lastFetchTime.value = Date.now()
    isFetched.value = true
  } catch (err) {
    console.error('Error fetching projects:', err)
  }
}

const resetState = () => {
  store.resetState()
  lastFetchTime.value = null
  isFetched.value = false
}

const navigateToCreate = () => {
  router.push('/premiering')
}

// Watchers
watch(
  () => props.username,
  (newUsername, oldUsername) => {
    if (newUsername && newUsername !== oldUsername) {
      resetState()
      fetchProjects(true) // Force fetch on username change
    }
  }
)

// Lifecycle hooks
onMounted(() => {
  if (props.username && !isFetched.value) {
    fetchProjects()
  }
})

// Handle cached component reactivation
onActivated(() => {
  if (props.username && needsRefresh.value) {
    fetchProjects()
  }
})

// Optional: Add method to force refresh
const forceRefresh = async () => {
  resetState()
  await fetchProjects(true)
}
</script>

<style scoped>
.empty-state-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.creator-tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 1rem;
}

@media (max-width: 600px) {
  .empty-state-container {
    padding: 1rem;
  }
  
  .creator-tips {
    gap: 4px;
  }
}
</style>
