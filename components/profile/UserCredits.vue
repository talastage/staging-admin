<!-- components/profile/UserCredits.vue -->
<template>
  <BaseCard>
    <BaseHeader title="My Castings" />
    <div class="user-castings">
      <ProjectGrid
        :projects="projects"
        :current-page="currentPage"
        :last-page="lastPage"
        :is-loading="isLoading"
        title="My Castings"
        variant="grid"
        @load-more="loadMore"
      >
        <template #empty-state>
          <EmptyStateCard title="No Castings" message="No castings yet." />
        </template>
      </ProjectGrid>
    </div>
  </BaseCard>
</template>

<script setup>
import { toRef } from 'vue'
import { useUserProjectCredits } from '@/composables/useUserProjectCredits'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const usernameRef = toRef(props, 'username')
const { projects, isLoading, hasMore, currentPage, lastPage, loadMoreItems } =
  useUserProjectCredits(usernameRef)

// Handle load more from ProjectGrid
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadMoreItems()
  }
}
</script>

<style scoped>
.user-castings {
  max-width: 100%;
}

@media (max-width: 600px) {
  .user-castings {
    padding: 0;
  }
}
</style>
