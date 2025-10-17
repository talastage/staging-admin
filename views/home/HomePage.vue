<template>
  <v-container class="home-content pa-0">
    <ClientOnly>
      <CompleteProfile v-if="shouldShowCompleteProfile" />
    </ClientOnly>
    
    <!-- Static content for SSR -->
    <div class="hero-section mb-8">
      <v-card class="pa-6 text-center">
        <h1 class="text-h3 mb-4">Welcome to TalaStage</h1>
        <p class="text-h6 text-medium-emphasis">
          Your Stage to the World of Entertainment
        </p>
        <p class="mt-4">
          Connecting talents across the globe with opportunities to shine and thrive ✨
        </p>
      </v-card>
    </div>

    <!-- Dynamic components wrapped in ClientOnly -->
    <ClientOnly>
      <div class="component-wrapper trending-projects-wrapper">
        <HomeTrendingProjectsCarousel />
      </div>
      
      <div
        class="component-wrapper trending-projects-wrapper"
        v-show="hasUpcomingProjects || isLoadingUpcoming"
      >
        <HomeUpcomingProjectsCarousel
          ref="upcomingProjectsRef"
          @has-data="hasUpcomingProjects = $event"
          @loading="isLoadingUpcoming = $event"
        />
      </div>

      <div class="component-wrapper trending-talents-wrapper">
        <HomeTrendingCreatorsCarousel />
      </div>

      <div class="component-wrapper trending-talents-wrapper">
        <HomeRecommendedTalentCarousel />
      </div>

      <div class="component-wrapper recommended-projects-wrapper">
        <RecommendedProjectsInfiniteScroll />
      </div>
      
      <template #fallback>
        <div class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-4">Loading content...</p>
        </div>
      </template>
    </ClientOnly>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const upcomingProjectsRef = ref(null)
const hasUpcomingProjects = ref(false)
const isLoadingUpcoming = ref(true)
const investorsRef = ref(null)
const hasInvestors = ref(false)
const isLoadingInvestors = ref(false)

const shouldShowCompleteProfile = computed(() => {
  const user = authStore.user
  if (!user) return false
  return !user.profile_photo || user.has_talent === 'undecided'
})
</script>

<style scoped>
.home-content {
  width: 100%;
  max-width: none;
}

.component-wrapper {
  margin-bottom: 2rem;
  width: 100%;
}
</style>
