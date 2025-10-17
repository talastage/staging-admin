<template>
  <v-card
    class="project-card"
    :class="{ 'no-elevation': !hasElevation }"
    :elevation="hasElevation ? 10 : 0"
    :loading="loading"
    @click="navigateToProject"
  >
    <!-- Thumbnail Container -->
    <div class="project-card__thumbnail-container">
      <MediaThumbnail
        :thumbnailUrl="project.thumbnail_url"
        :videoUrl="project.video_url"
        :showViews="false"
        :showDuration="true"
        size="2xl"
        class="project-card__thumbnail"
      />

      <!-- Play button overlay -->
      <div class="project-card__play-overlay">
        <v-icon icon="mdi-play-circle" size="x-large" color="white" />
      </div>
    </div>

    <!-- Content Wrapper -->
    <div class="project-card__wrapper">
      <!-- User Avatar -->
      <div class="project-card__avatar-container" v-if="project.creator">
        <UserAvatar
          :username="project.creator.username"
          :profile_photo="project.creator.profile_photo"
          :size="36"
          class="project-card__avatar"
        />
      </div>

      <!-- Info Container -->
      <div class="project-card__info-container">
        <!-- Title Container -->
        <div class="project-card__title-container">
          <h3 class="project-card__title">
            {{ project.name }}
          </h3>
        </div>

        <!-- Creator Container -->
        <div class="project-card__creator-container">
          <span class="project-card__creator-name">
            {{ project.creator?.display_name }}
          </span>
        </div>

        <!-- Stats Container -->
        <!-- <div class="project-card__stats-container">
          <div class="project-card__stats-item">
            <v-icon icon="mdi-eye-outline" size="x-small" class="mr-1" />
            <CountStats
              :count="project.views_count"
              label="views"
              :isDarkMode="false"
              :isHighlighted="false"
              class="project-card__count-stats"
            />
          </div>
          <span class="project-card__separator">•</span>
          <div class="project-card__stats-item">
            <v-icon icon="mdi-calendar-outline" size="x-small" class="mr-1" />
            <DateDisplay
              :date="project.created_at"
              class="project-card__date"
            />
          </div>
        </div> -->
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { Video } from '~/types/video'

const props = defineProps<{
  project: Video
  loading?: boolean
  hasElevation?: boolean
}>()

const hasElevation = props.hasElevation ?? true

const navigateToProject = () => {
  navigateTo(`/watch/${props.project.access_uuid}`)
}
</script>

<style lang="scss" scoped>
.project-card {
  background: #ffffff !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);

    .project-card__play-overlay {
      opacity: 1;
    }

    .project-card__thumbnail {
      transform: scale(1.05);
    }
  }

  &__thumbnail-container {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16/9;
  }

  &__thumbnail {
    transition: transform 0.5s ease;
  }

  &__play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;

    .v-icon {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      transform: scale(1.2);
      font-size: 3rem;
    }
  }

  &__wrapper {
    display: flex;
    gap: 12px;
    padding: 16px;
    flex: 1;
  }

  &__avatar-container {
    flex-shrink: 0;
  }

  &__avatar {
    /* Removed border and shadow to eliminate square wrapper effect */
  }

  &__info-container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__title-container {
    margin-bottom: 8px;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: #121212;
  }

  &__creator-container {
    margin-bottom: 8px;
  }

  &__creator-name {
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.7);
    font-weight: 500;
  }

  &__stats-container {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.6);
    margin-top: auto;
  }

  &__stats-item {
    display: flex;
    align-items: center;
  }

  &__separator {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  @media (max-width: 600px) {
    border-radius: 8px;

    &__wrapper {
      padding: 12px;
      gap: 10px;
    }

    &__title {
      font-size: 1rem;
    }

    &__creator-name {
      font-size: 0.85rem;
    }

    &__stats-container {
      font-size: 0.8125rem;
    }
  }

  // Dark mode support
  :deep(.v-theme--dark) & {
    background: #1e1e1e !important;

    &__title {
      color: rgba(255, 255, 255, 0.95);
    }

    &__creator-name {
      color: rgba(255, 255, 255, 0.7);
    }

    &__stats-container {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
