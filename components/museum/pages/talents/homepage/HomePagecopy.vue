<template>
  <v-container class="home-content pa-0">
    <CompleteProfile v-if="shouldShowCompleteProfile" />
    <!-- Using the component-wrapper class from the spacing system with more specific classes -->
    <div class="component-wrapper trending-projects-wrapper">
      <HomeTrendingProjectsCarousel />
    </div>
    <div class="component-wrapper trending-talents-wrapper">
      <HomeTrendingCreatorsCarousel />
    </div>
    <div class="component-wrapper trending-projects-wrapper">
      <HomeUpcomingProjectsCarousel />
    </div>

    <div class="component-wrapper trending-talents-wrapper">
      <HomeRecommendedTalentCarousel />
    </div>

    <div class="component-wrapper trending-projects-wrapper">
      <HomeProjectInvestorsCarousel />
    </div>

    <!-- <div class="component-wrapper talent-categories-wrapper">
      <TalentCategoriesCarousel />
    </div>
    <div class="component-wrapper premiering-categories-wrapper">
      <PremieringCategoriesCarousel />
    </div> -->
    <div class="component-wrapper recommended-projects-wrapper">
      <RecommendedProjectsInfiniteScroll />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const shouldShowCompleteProfile = computed(() => {
  const user = authStore.user?.value
  if (!user) return false
  return !user.profile_photo || user.has_talent === 'undecided'
})
</script>
