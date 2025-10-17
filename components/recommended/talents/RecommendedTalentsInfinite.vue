<template>
  <div class="recommended-talents-page">
    <!-- 
      Show an EmptyStateCard if no items & not loading
    -->
    <EmptyStateCard
      v-if="items.length === 0 && !isLoading"
      title="No Talents Found"
      message="We haven't found any recommended talents at the moment. Please try again later."
    />

    <!-- 
      Otherwise, show the talents container
    -->
    <div v-else class="talents-container">
      <!-- Loop through your items to display each user in a UserTalentCard -->
      <UserTalentCard
        v-for="(talentUser, index) in items"
        :key="index"
        :user="talentUser"
        size="medium"
      >
        <!-- Optional slot for custom actions like a Follow button, etc. -->
        <template #action>
          <!-- <v-btn color="primary">Follow</v-btn> -->
        </template>
      </UserTalentCard>

      <!-- Display 16 skeleton loaders whenever isLoading is true -->
      <div class="skeleton-loaders" v-if="isLoading">
        <UserTalentSkeleton v-for="n in 16" :key="'skeleton-' + n" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll' // or your local path

const { $axios } = useNuxtApp()

/**
 * We'll fetch 18 items each time.
 * The response is assumed to have the shape:
 * {
 *   data: [...],   // array of user items
 *   links: {...},
 *   meta: {...}
 * }
 */
async function fetchItems(page: number) {
  const response = await $axios.get(`/guest/recommended/talents?page=${page}`)
  return response.data.data // Return the array of user talents
}

/**
 * Use the infinite scroll composable
 * - threshold: trigger load when we're 200px from bottom
 * - throttle: check scroll at most every 300ms
 */
const { items, isLoading, error, hasMore, reset } = useInfiniteScroll(
  fetchItems,
  {
    threshold: 200,
    throttle: 300,
    direction: 'vertical',
    initialLoadDelay: 0,
  }
)
</script>

<style scoped>
.recommended-talents-page {
  padding: 16px;
}

.talents-container {
  display: grid;
  gap: 16px;
  /* Adjust grid columns as needed */
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

/* Skeletons take a full row when displayed */
.skeleton-loaders {
  grid-column: 1 / -1;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
</style>
