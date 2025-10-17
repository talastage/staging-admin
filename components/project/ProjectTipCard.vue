<template>
  <v-card class="d-flex flex-column">
    <!-- Card content with image to the left -->
    <div class="d-flex">
      <v-img :src="project.thumbnail_url" :alt="project.name" class="white--text" height="200px" width="40%"></v-img>
      <div class="d-flex align-center justify-end" style="width: 60%;">
        <v-btn>Tips: {{ project.tips_count }}</v-btn>
      </div>
      <div class="d-flex align-center justify-end flex-grow-1">
        <NuxtLink :to="`/tips/details/${project.access_uuid}`">
          <v-btn text>Tips Details</v-btn>
        </NuxtLink>
      </div>
    </div>
    <!-- Card actions stretching across the bottom -->
    <InteractionButtons :likes-count="project.likes_count" :views-count="project.views_count" :project-id="project.id" />
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});
</script>
