<template>
  <!-- Minimized Skeleton Loaders -->
  <v-card
    v-if="isLoading"
    class="project-metadata-card bg-white pa-4 mb-4"
    flat
    elevation="0"
  >
    <!-- Project Title Skeleton -->
    <v-row>
      <v-col cols="12">
        <v-skeleton-loader
          type="text"
          class="mb-3 skeleton-loader"
          height="24"
        />
      </v-col>
    </v-row>

    <!-- Creator & Actions Row Skeleton -->
    <v-row align="center" no-gutters>
      <!-- Avatar skeleton -->
      <v-col cols="auto" class="mr-3">
        <v-skeleton-loader
          type="avatar"
          width="40"
          height="40"
          class="skeleton-loader"
        />
      </v-col>

      <!-- Creator info skeleton -->
      <v-col cols="5" sm="4">
        <v-skeleton-loader
          type="text"
          class="mb-1 skeleton-loader"
          height="16"
        />
        <v-skeleton-loader
          type="text"
          width="60%"
          class="skeleton-loader"
          height="14"
        />
      </v-col>

      <!-- Action Buttons Skeleton - Minimized -->
      <v-col cols="6" sm="7" class="d-flex justify-end">
        <v-skeleton-loader
          type="button"
          width="80"
          height="32"
          class="skeleton-loader"
        />
      </v-col>
    </v-row>
  </v-card>

  <!-- Error State -->
  <v-card
    v-else-if="error"
    class="project-metadata-card pa-4 mb-4"
    flat
    elevation="0"
  >
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          border="start"
          class="mb-0"
          closable
        >
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            <span>{{ error }}</span>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-card>

  <!-- Actual Metadata -->
  <v-card
    v-else-if="metadata"
    class="project-metadata-card bg-white pa-4 mb-4"
    flat
    elevation="0"
  >
    <!-- PROJECT TITLE -->
    <v-row>
      <v-col cols="12">
        <h1 class="project-title text-h4 font-weight-bold mb-2">
          {{ metadata.project.name }}
        </h1>
      </v-col>
    </v-row>

    <!-- CREATOR & ACTIONS ROW -->
    <v-row align="center" class="mb-2">
      <!-- Avatar & Creator Info -->
      <v-col cols="12" sm="auto" class="d-flex align-center">
        <UserAvatar
          :username="metadata.creator.username"
          :profile_photo="metadata.creator.profile_photo"
          :size="48"
          elevation="2"
          class="mr-3"
        />
        <div class="d-flex flex-column">
          <div class="text-subtitle-1 font-weight-medium">
            {{ metadata.creator.display_name }}
          </div>
          <!-- Using the new CountViews component -->
          <!-- <CountViews :count="viewsCount" size="default" /> -->
        </div>
      </v-col>

      <!-- Action Buttons - Responsive layout -->
      <v-col
        cols="12"
        sm
        class="d-flex flex-wrap justify-sm-end align-center gap-2 mt-3 mt-sm-0"
      >
        <!-- Reactions -->
        <div class="d-flex reaction-buttons">
          <LikeButton
            :isLiked="reactionStore.userReaction === 'like'"
            :count="reactionStore.likesCount"
            :isLoading="reactionStore.isLoading"
            @reaction="handleReaction"
            class="mr-2"
          />

          <DislikeButton
            :isDisliked="reactionStore.userReaction === 'dislike'"
            :count="reactionStore.dislikesCount"
            :isLoading="reactionStore.isLoading"
            @reaction="handleReaction"
          />
        </div>

        <!-- Creator-Only Buttons -->
        <template v-if="metadata.user_interaction.is_creator">
          <v-btn
            color="primary"
            variant="tonal"
            class="action-btn"
            prepend-icon="mdi-cash"
            @click="handleViewEarnings(metadata.project)"
          >
            Earnings
          </v-btn>
          <ProjectEditButton :project="metadata.project" class="action-btn" />
        </template>

        <!-- Non-Creator Buttons -->
        <FanButton
          v-if="!metadata.user_interaction.is_creator"
          :username="metadata.creator.username"
          @fanningUpdated="handleFanningUpdated"
          class="action-btn"
          size="medium"
        />

        <!-- Tip & Share Buttons - Always visible -->
        <TipButton
          :entity="metadata.creator"
          entityType="user"
          @transactionComplete="handleTipComplete"
          class="action-btn"
        />
        <ShareProjectButton
          entityType="project"
          :entity="metadata.project"
          :isLoading="isLoading"
          class="action-btn"
        />
      </v-col>
    </v-row>

    <!-- Using the new DescriptionDisplay component -->
    <v-row v-if="metadata.project.description" class="mt-2">
      <v-col cols="12">
        <DescriptionDisplay
          :description="metadata.project.description"
          :initially-expanded="showDescription"
          @update:expanded="showDescription = $event"
        />
      </v-col>
    </v-row>

    <!-- Tags/Categories (if available) -->
    <v-row
      v-if="metadata.project.categories && metadata.project.categories.length"
      class="mt-2"
    >
      <v-col cols="12">
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="category in metadata.project.categories"
            :key="category.id"
            size="small"
            color="primary"
            variant="flat"
            class="category-chip"
          >
            {{ category.name }}
          </v-chip>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref, defineProps, type PropType } from 'vue'
import { useRuntimeConfig, useNuxtApp, navigateTo } from '#app'
import { storeToRefs } from 'pinia'

// Import custom components
import LikeButton from '~/components/reactions/LikeButton.vue'
import DislikeButton from '~/components/reactions/DislikeButton.vue'
import CountViews from '~/components/common/CountViews.vue'
import DescriptionDisplay from '~/components/common/DescriptionDisplay.vue'

// Project, store, composables
import type { Project } from '~/types/project'
import { useProjectMetadataStore } from '~/stores/useProjectMetadataStore'
import { useProjectReactionsStore } from '~/stores/useProjectReactionsStore'
import { useProjectViews } from '~/composables/useProjectViews'
import { useFormatting } from '@/composables/useFormatting'

/** Props */
const props = defineProps({
  project: {
    type: Object as PropType<Project>,
    required: true,
  },
})

/** Local state */
const showDescription = ref(false)

/** Runtime config & Nuxt app */
const config = useRuntimeConfig()
const nuxtApp = useNuxtApp()

/** Access the project metadata store and reaction store */
const projectMetadataStore = useProjectMetadataStore()
const reactionStore = useProjectReactionsStore()
const { metadata, isLoading, error } = storeToRefs(projectMetadataStore)

/** Access the views composable */
const { viewsCount, recordProjectView } = useProjectViews()

/** Import the formatting function for views */
const { formatViewCount } = useFormatting()

/** Compute a formatted version of viewsCount (e.g., "2.1K views") */
const formattedViews = computed(() => formatViewCount(viewsCount.value))

/** Compute share URL and text */
const shareUrl = computed(
  () => `${config.public.frontendUrl}/watch/${props.project.access_uuid}`
)
const shareText = computed(
  () => `Check out this awesome project: ${props.project.name}`
)

/** Handlers */
function handleFanningUpdated(newFanningState: boolean, fanCount: number) {
  if (metadata.value) {
    metadata.value.fanning_status.is_fanned_by_auth_user = newFanningState
  }
}

function handleTipComplete(amount: number) {
  console.log(`Tip of ${amount} completed`)
}

function handleViewEarnings(project: any) {
  navigateTo(`/project/${project.access_uuid}/earnings/`)
}

async function handleReaction(reactionType: 'like' | 'dislike') {
  nuxtApp.$protectedAction(
    async () => {
      // Optimistic update before API call
      const previousReaction = reactionStore.userReaction
      const originalLikes = reactionStore.likesCount
      const originalDislikes = reactionStore.dislikesCount

      // Optimistically update the UI
      if (reactionType === 'like') {
        if (previousReaction === 'like') {
          // User is unliking
          reactionStore.likesCount--
          reactionStore.userReaction = null
        } else {
          // User is liking
          reactionStore.likesCount++
          if (previousReaction === 'dislike') reactionStore.dislikesCount--
          reactionStore.userReaction = 'like'
        }
      } else if (reactionType === 'dislike') {
        if (previousReaction === 'dislike') {
          // User is un-disliking
          reactionStore.dislikesCount--
          reactionStore.userReaction = null
        } else {
          // User is disliking
          reactionStore.dislikesCount++
          if (previousReaction === 'like') reactionStore.likesCount--
          reactionStore.userReaction = 'dislike'
        }
      }

      try {
        // Make the actual API call
        return await reactionStore.toggleReaction(
          props.project.access_uuid,
          reactionType
        )
      } catch (error) {
        // Revert optimistic update on error
        reactionStore.likesCount = originalLikes
        reactionStore.dislikesCount = originalDislikes
        reactionStore.userReaction = previousReaction
        throw error
      }
    },
    {
      requiresAuth: true,
      onError: (err: any) => {
        console.error('Error handling reaction:', err)
      },
    }
  )
}

/** Watchers & Lifecycle */
watch(
  () => metadata.value,
  (newMetadata) => {
    // Initialize reaction store if we have fresh metadata
    if (newMetadata) {
      try {
        reactionStore.initializeFromMetadata(newMetadata)
      } catch (error) {
        console.warn('Error initializing reaction store:', error)
      }
    }
  },
  { immediate: true }
)

// Fetch metadata and record a view on mount
onMounted(async () => {
  // Ensure we're on the client side before making API calls
  if (!process.client) {
    console.log('Skipping API calls - not on client side')
    return
  }

  try {
    await projectMetadataStore.fetchProjectMetadata(props.project.access_uuid)
  } catch (error) {
    console.error('Error fetching project metadata:', error)
    // Don't return - we can still try to record the view
  }

  // Record project view (this now checks auth internally and fails gracefully)
  try {
    await recordProjectView(props.project.access_uuid)
  } catch (error) {
    // View recording is non-critical, just log and continue
    console.warn('Error recording project view:', error)
  }
})

// If the project changes, re-fetch
watch(
  () => props.project.access_uuid,
  async (newUuid) => {
    // Ensure we're on the client side before making API calls
    if (!process.client || !newUuid) {
      return
    }

    try {
      await projectMetadataStore.fetchProjectMetadata(newUuid)
    } catch (error) {
      console.error('Error fetching project metadata:', error)
    }

    // Record view for new project
    try {
      await recordProjectView(newUuid)
    } catch (error) {
      console.warn('Error recording project view:', error)
    }
  }
)
</script>

<style scoped>
.project-metadata-card {
  transition: all 0.3s ease;
  border: 1px solid #f0f2f5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 16px auto;
}

.project-title {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: #1c1e21;
}

.action-btn {
  transition: all 0.2s ease;
  border-radius: 8px;
}

.reaction-buttons {
  transition: all 0.2s ease;
}

.category-chip {
  transition: all 0.2s ease;
}

/* Facebook-style skeleton loaders */
.skeleton-loader {
  background-color: #e4e6eb !important;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-loader::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .project-metadata-card {
    padding: 16px !important;
  }

  .project-title {
    font-size: 1.5rem;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .action-btn {
    padding: 0 12px;
  }
}
</style>
