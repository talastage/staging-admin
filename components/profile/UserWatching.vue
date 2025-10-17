<!-- components/profile/UserWatching.vue -->
<template>
  <BaseCard>
    <BaseHeader title="Watching" />
    <div class="user-watching">
      <ProjectGrid
        :projects="projects"
        :current-page="currentPage"
        :last-page="lastPage"
        :is-loading="isLoading"
        title="Watching"
        variant="grid"
        @load-more="loadMore"
      >
        <template #empty-state>
          <EmptyStateCard
            title="No Watchings"
            message="This user isn't watching any projects yet."
          />
        </template>
      </ProjectGrid>
    </div>
  </BaseCard>
</template>

<script setup>
import { toRef } from 'vue'
import { useUserWatchingProjects } from '@/composables/useUserWatchingProjects'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const usernameRef = toRef(props, 'username')
const { projects, isLoading, hasMore, currentPage, lastPage, loadMoreItems } =
  useUserWatchingProjects(usernameRef)

// Handle load more from ProjectGrid
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadMoreItems()
  }
}
</script>

<style scoped>
.user-watching {
  max-width: 100%;
}

@media (max-width: 600px) {
  .user-watching {
    padding: 0;
  }
}
</style>
