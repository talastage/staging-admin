<template>
  <v-card class="project-card-horizontal" :loading="loading" flat>
    <div class="d-flex align-center">
      <MediaThumbnail
        :thumbnailUrl="project.thumbnail_url"
        :projectUrl="project.video_url"
        :access_uuid="project.access_uuid"
        class="project-thumbnail"
      />
      <div class="project-content">
        <h3>{{ project.name }}</h3>

        <ProjectWatchingDetails :watchingCount="project.watchings_count" />
        <!-- NuxtLink to navigate to earnings page -->
        <NuxtLink
          :to="`/project/${project.access_uuid}/earnings`"
          class="earnings-button"
        >
          <v-btn color="primary">Earnings</v-btn>
        </NuxtLink>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  project: Object,
})

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

const isCreator = computed(() => {
  return authStore.user?.value?.id === props.project.creator.id
})
</script>

<style scoped>
.project-card-horizontal {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 16px;
  position: relative;
}

.project-thumbnail {
  width: 160px;
  height: 90px;
  flex-shrink: 0;
}

.project-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  padding-left: 16px;
  overflow: hidden;
}

.earnings-button {
  margin-top: 12px; /* Adjust margin as necessary */
}
</style>
