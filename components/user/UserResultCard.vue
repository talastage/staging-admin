<template>
  <v-card class="mb-4" elevation="10">
    <v-card-item>
      <div class="d-flex align-center">
        <UserAvatar
          :username="user.username"
          :profile_photo="user.profile_photo"
          size="large"
          class="mr-4"
        />
        <div>
          <v-card-title>{{ user.display_name }}</v-card-title>
          <v-card-subtitle>@{{ user.username }}</v-card-subtitle>
        </div>
        <v-spacer></v-spacer>
        <slot name="actions">
          <FanButton
            :username="user.username"
            :initial-fanning-state="user.is_fanned_by_auth_user"
          />
        </slot>
      </div>
    </v-card-item>
    <v-card-text v-if="projects.length">
      <h3 class="text-h6 mb-2">Projects</h3>
      <div class="projects-container">
        <ProjectGrid
          :projects="projects"
          :current-page="1"
          :last-page="1"
          :is-loading="false"
          variant="grid"
          :skeleton-count="2"
          class="custom-project-grid"
        >
          <template #empty-state>
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-folder-open-outline
            </v-icon>
            <p class="text-body-1">No projects available.</p>
          </template>
        </ProjectGrid>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Project } from '@/types/project'

interface User {
  username: string
  profile_photo: string
  display_name: string
  is_fanned_by_auth_user: boolean
}

interface Props {
  user: User
  projects: Project[]
}

defineProps<Props>()
</script>

<style scoped>
.projects-container {
  margin: -16px;
  padding: 16px;
}

:deep(.custom-project-grid) {
  /* Container adjustments */
  .v-container {
    padding: 8px !important;
  }

  /* Row adjustments */
  .v-row {
    margin: -8px;
  }

  /* Column adjustments for grid layout */
  .v-col {
    padding: 8px;
  }

  /* Project card styles */
  .project-card {
    position: relative;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;

    /* Thumbnail container */
    :deep(.thumbnail-container) {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 aspect ratio */
      background: #000;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.3s ease;
      }
    }

    /* Play button overlay */
    :deep(.v-btn.play-button) {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    /* Hover effects */
    &:hover {
      :deep(.thumbnail-container) {
        img {
          opacity: 0.7;
        }
      }

      :deep(.v-btn.play-button) {
        opacity: 1;
      }
    }
  }

  /* Ensure proper spacing in grid mode */
  &.grid-mode {
    .v-col {
      display: flex;

      .project-card {
        flex: 1;
      }
    }
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  :deep(.custom-project-grid) {
    .v-row {
      margin: -4px;
    }

    .v-col {
      padding: 4px;
    }
  }
}
</style>
