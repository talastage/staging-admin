<template>
  <v-container>
    <BaseHeader :title="headerTitle" class="mb-3" />

    <!-- Error State -->
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Projects Section -->
    <section v-if="projects.length > 0" class="mb-8">
      <div class="d-flex align-center justify-space-between mb-4">
        <h2>Projects ({{ projects.length }})</h2>
      </div>
      <v-list>
        <v-list-item v-for="project in projects" :key="project.id">
          <ProjectCardCompact :project="project" />
        </v-list-item>
      </v-list>
    </section>

    <!-- Users Section -->
    <section v-if="users.length > 0" class="mb-8">
      <div class="d-flex align-center justify-space-between mb-4">
        <h2>Users ({{ users.length }})</h2>
      </div>
      <v-list>
        <v-list-item
          v-for="user in users"
          :key="user.id"
          @click="navigateToUserProfile(user)"
        >
          <UserCard :user="user" layout="compact" />
        </v-list-item>
      </v-list>
    </section>

    <!-- Enhanced Loading States -->
    <template v-if="isLoading">
      <template v-if="noResults">
        <!-- Projects Loading Skeleton -->
        <section class="mb-8">
          <div class="d-flex align-center justify-space-between mb-4">
            <v-skeleton-loader
              type="text"
              width="150"
              class="mb-2"
            ></v-skeleton-loader>
          </div>

          <v-sheet class="px-2">
            <v-row>
              <v-col cols="12" v-for="n in 3" :key="`project-${n}`">
                <v-sheet class="pa-3" rounded="lg">
                  <v-row no-gutters>
                    <v-col cols="12" sm="4">
                      <v-skeleton-loader
                        type="image"
                        height="180"
                        class="rounded-lg"
                      ></v-skeleton-loader>
                    </v-col>
                    <v-col cols="12" sm="8" class="pl-sm-4 pt-4 pt-sm-0">
                      <v-skeleton-loader
                        type="article"
                        class="mt-2"
                      ></v-skeleton-loader>
                    </v-col>
                  </v-row>
                </v-sheet>
              </v-col>
            </v-row>
          </v-sheet>
        </section>

        <!-- Users Loading Skeleton -->
        <section class="mb-8">
          <div class="d-flex align-center justify-space-between mb-4">
            <v-skeleton-loader
              type="text"
              width="120"
              class="mb-2"
            ></v-skeleton-loader>
          </div>

          <v-sheet class="px-2">
            <v-row>
              <v-col cols="12" md="6" v-for="n in 4" :key="`user-${n}`">
                <v-sheet class="pa-3" rounded="lg" :elevation="0">
                  <v-skeleton-loader
                    type="list-item-avatar-two-line"
                    class="rounded-lg"
                  ></v-skeleton-loader>
                </v-sheet>
              </v-col>
            </v-row>
          </v-sheet>
        </section>
      </template>

      <!-- Loading More Content Skeleton -->
      <div v-else class="py-4">
        <v-sheet class="px-2">
          <v-row>
            <v-col cols="12">
              <v-sheet class="pa-3" rounded="lg">
                <v-skeleton-loader
                  type="article, actions"
                  class="mb-4 rounded-lg"
                ></v-skeleton-loader>
              </v-sheet>
            </v-col>
          </v-row>
        </v-sheet>
      </div>
    </template>

    <!-- No Results -->
    <EmptyStateCard
      v-if="!isLoading && noResults && !error"
      title="No Results Found"
      message="Try different keywords or check your spelling."
    />
  </v-container>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchApp } from '~/stores/useSearchApp'

const route = useRoute()
const router = useRouter()
const query = computed(() => (route.query.search_query as string) || '')

// Access the Pinia store
const searchStore = useSearchApp()

// Clear + search when query changes
watch(
  query,
  async (newQuery) => {
    searchStore.clearResults()
    if (!newQuery.trim()) return
    await searchStore.search(newQuery, 1)
  },
  { immediate: true }
)

// Computed store data
const projects = computed(() => searchStore.searchResults.projects.results)
const users = computed(() => searchStore.searchResults.users.results)
const isLoading = computed(() => searchStore.loading)
const error = computed(() => searchStore.error)
const noResults = computed(
  () => projects.value.length === 0 && users.value.length === 0
)

// Function to navigate to user profile page
const navigateToUserProfile = (user) => {
  if (user && user.username) {
    router.push(`/${user.username}`)
  }
}

// Optional infinite-scroll logic
const threshold = 100
let ticking = false

function handleScroll() {
  if (ticking) return
  window.requestAnimationFrame(() => {
    const scrollPosition = window.innerHeight + window.scrollY
    const bodyHeight = document.body.offsetHeight

    if (bodyHeight - scrollPosition < threshold && !searchStore.loading) {
      const currentPage = searchStore.searchResults.projects.current_page
      const lastPage = searchStore.searchResults.projects.last_page
      if (currentPage < lastPage) {
        searchStore.search(query.value, currentPage + 1)
      }
    }
    ticking = false
  })
  ticking = true
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const headerTitle = computed(() => {
  return query.value ? `Search Results for '${query.value}'` : 'Search Results'
})
</script>

<style scoped>
.v-skeleton-loader {
  border-radius: 8px;
}

.v-sheet {
  background: transparent !important;
}

.v-skeleton-loader ::v-deep .v-skeleton-loader__image {
  height: 180px;
  border-radius: 8px;
}

.v-skeleton-loader ::v-deep .v-skeleton-loader__text {
  margin-bottom: 12px;
}

.v-skeleton-loader
  ::v-deep
  .v-skeleton-loader__article
  .v-skeleton-loader__text {
  height: 14px;
}

.v-skeleton-loader
  ::v-deep
  .v-skeleton-loader__article
  .v-skeleton-loader__text:first-child {
  height: 24px;
  width: 80%;
  margin-bottom: 16px;
}

.project-card-compact {
  width: 100%;
  margin-bottom: 10px;
  overflow: hidden;
}

.project-card-compact__thumbnail {
  width: 360px;
  height: 180px;
  overflow: hidden;
}

.project-card-compact__info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.project-card-compact__meta {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
}

.project-title {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 4px;
}
</style>
