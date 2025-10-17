<!-- views/watch/WatchProjectPage.vue -->
<template>
  <v-container fluid class="watch-project-container">
    <v-row>
      <v-col cols="12">
        <!-- MEDIA (Video) -->
        <div class="media-container mb-4">
          <ClientOnly>
            <Media :project="project" />
            <template #fallback>
              <div class="video-placeholder">
                <img v-if="project.thumbnail_url" :src="project.thumbnail_url" :alt="project.name" />
                <div class="play-button">▶</div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Project Metadata & Credits -->
        <v-row>
          <!-- Metadata -->
          <v-col cols="12">
            <div class="project-metadata">
              <h1>{{ project.name }}</h1>
              <p v-if="project.description">{{ project.description }}</p>
              <div class="metadata-details">
                <span v-if="project.creator">By {{ project.creator.display_name }}</span>
                <span v-if="project.duration">{{ formatDuration(project.duration) }}</span>
              </div>
            </div>
            <ClientOnly>
              <ProjectMetadata :project="project" />
            </ClientOnly>
          </v-col>

          <!-- Credits Carousel -->
          <v-col cols="12" v-if="shouldShowCarousel" class="mb-4">
            <ClientOnly>
              <ProjectCreditCarousel
                :access-uuid="accessUuid"
                :credits="credits"
                :loading="false"
                :error="null"
                :totalMembers="credits.length"
              />
            </ClientOnly>
          </v-col>
        </v-row>

        <!-- Recommended Projects (Infinite Scroll) -->
        <ClientOnly>
          <RecommendedProjectsInfiniteScroll
            :projects="recommendedProjects"
          />
        </ClientOnly>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from '#imports';
import type { WatchProject } from '@/types/watch';
import type { Credit } from '~/composables/useProjectCredits';
import type { Project as RecommendedProject } from '~/types/project';

// Props
const props = defineProps({
  accessUuid: {
    type: String,
    required: true,
  },
  project: {
    type: Object as () => WatchProject,
    required: true,
  },
  credits: {
    type: Array as () => Credit[],
    required: true,
  },
  recommendedProjects: {
    type: Array as () => RecommendedProject[],
    required: true,
  },
});

const shouldShowCarousel = computed(() => props.credits && props.credits.length > 0);

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

</script>

<style scoped>
.watch-project-container {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

.v-skeleton-loader {
  width: 100%;
}

.v-row {
  margin: 0;
}

.v-col {
  padding: 12px;
}

@media (max-width: 600px) {
  .v-col {
    padding: 8px;
  }
}

@media (min-width: 1400px) {
  .watch-project-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.media-container {
  width: 100%;
}

.video-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #000;
}

.project-metadata h1 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.project-metadata p {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.metadata-details {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #888;
}

.metadata-details span {
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>