<template>
  <v-card class="project-card-compact" :class="sizeClass" elevation="2" flat>
    <div class="d-flex flex-column flex-sm-row">
      <div class="project-card-compact__thumbnail mb-3 mb-sm-0 mr-sm-3">
        <MediaThumbnail
          :thumbnailUrl="project.thumbnail_url"
          :video_url="project.video_url"
          :access_uuid="project.access_uuid"
          size="md"
          class="project-card__thumbnail"
        />
      </div>
      <div
        class="project-card-compact__content d-flex flex-column justify-space-between"
      >
        <div>
          <ProjectTitle
            :title="project.name"
            :maxLength="titleMaxLength"
            :size="titleSize"
            class="mb-1 font-weight-medium"
          />
          <div class="project-card-compact__meta">
            <div class="d-flex align-center">
              <CountStats
                :count="project.views_count"
                label="views"
                :isDarkMode="false"
                :isHighlighted="false"
              />
              <v-icon x-small class="mx-1">mdi-circle-small</v-icon>
              <DateDisplay :date="project.created_at" />
            </div>
          </div>
        </div>
        <NuxtLink
          :to="`/project/${project.access_uuid}/credits`"
          custom
          v-slot="{ navigate }"
        >
          <v-btn
            color="primary"
            text
            @click="navigate"
            class="mt-2 align-self-start"
          >
            View Credits
          </v-btn>
        </NuxtLink>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
})

const sizeClass = computed(() => `project-card-compact--${props.size}`)

const thumbnailSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'small'
    case 'large':
      return 'large'
    default:
      return 'medium'
  }
})

const titleSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'small'
    case 'large':
      return 'large'
    default:
      return 'medium'
  }
})

const titleMaxLength = computed(() => {
  switch (props.size) {
    case 'small':
      return 40
    case 'large':
      return 70
    default:
      return 60
  }
})
</script>

<style scoped>
.project-card-compact {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
}
.project-card-compact:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1) !important;
}
.project-card-compact__thumbnail {
  flex-shrink: 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.project-card-compact__content {
  flex-grow: 1;
}
.project-card-compact__meta {
  font-size: 0.75rem;
  color: #6c757d;
}

.project-card-compact--small .project-card-compact__thumbnail {
  width: 160px;
}
.project-card-compact--medium .project-card-compact__thumbnail {
  width: 240px;
}
.project-card-compact--large .project-card-compact__thumbnail {
  width: 320px;
}

@media (max-width: 600px) {
  .project-card-compact__thumbnail {
    width: 100% !important;
  }
}
</style>
