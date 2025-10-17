<template>
  <v-card class="project-card" :loading="loading" flat>
    <MediaThumbnail
      :thumbnailUrl="project.thumbnail_url"
      :projectUrl="project.video_url"
      :access_uuid="project.access_uuid"
      class="project-thumbnail"
    />
    <div class="project-content">
      <div class="project-info">
        <ProjectTitle :title="project.name" :maxLength="50" />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps({
  project: Object,
})

const loading = false // This should be tied to actual loading logic
</script>

<style scoped>
.project-card {
  max-width: 360px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 10px;
  display: flex;
  flex-direction: column;
  background-color: white;
  /* Match the card background to your theme */
}

.project-content {
  padding: 16px;
  display: flex;
  align-items: center;
}

.project-info {
  margin-left: 16px;
  flex: 1;
}

.project-thumbnail .v-img__image {
  border-radius: 12px 12px 0 0;
  /* Apply rounded corners to the top of the thumbnail */
}

.v-avatar.size-small {
  border: 2px solid white;
  /* Make avatar stand out against project thumbnails */
}

.project-info .project-title h3 {
  font-size: 1rem;
  /* Adjust title size */
  color: #333;
  /* Adjust title color for better readability */
  margin-bottom: 5px;
  /* Space between title and subtitle */
}

.project-info .project-watching-details {
  font-size: 0.8rem;
  /* Adjust details size */
  color: #666;
  /* Adjust details color for subtlety */
}
</style>
