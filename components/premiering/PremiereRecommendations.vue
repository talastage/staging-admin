<!-- components/PremiereRecommendations.vue -->
<template>
  <div class="premiere-recommendations">
    <h3>Recommended Premieres</h3>
    <div class="recommendations-grid">
      <div
        v-for="premiere in recommendations"
        :key="premiere.id"
        class="recommendation-card"
      >
        <ProjectPremiereCard
          :project="premiere"
          :show-countdown="true"
          @click="navigateTo(`/project/${premiere.access_uuid}`)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const recommendations = computed(() => {
  // Filter and sort premieres based on user preferences
  return premieres.value
    .filter((p) => !userWatched.value.includes(p.id))
    .sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a))
    .slice(0, 6)
})
</script>
