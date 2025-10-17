<template>
  <v-card elevation="2" class="investment-card mb-4">
    <v-row no-gutters>
      <!-- Media Column -->
      <v-col cols="12" sm="3" class="media-column">
        <NuxtLink :to="watchRoute" class="media-link">
          <MediaThumbnail
            size="md"
            :videoUrl="investment.project.video_url"
            :thumbnailUrl="investment.project.thumbnail_url"
            :showViews="false"
            :showDuration="true"
            class="project-thumbnail-wrapper"
          />
        </NuxtLink>
      </v-col>

      <!-- Content Column -->
      <v-col cols="12" sm="6" class="content-column pa-4">
        <h3 class="text-h6 font-weight-medium text-truncate">
          {{ investment.project.name }}
        </h3>
        <div class="text-body-2 text-grey-darken-1 mt-1">
          {{ investment.project.views_count?.toLocaleString() }} views •
          {{ formatDate(investment.project.created_at) }}
        </div>
        <div class="mt-2 d-flex gap-2">
          <v-chip
            small
            :color="investment.is_creator ? 'primary' : 'grey'"
            variant="flat"
          >
            {{ investment.is_creator ? 'Creator' : 'Investor' }}
          </v-chip>
          <v-chip
            small
            :color="getStatusColor(investment.status)"
            variant="flat"
          >
            {{ investment.status }}
          </v-chip>
          <v-chip small color="success" variant="flat">
            {{ investment.share_percentage }}% Share
          </v-chip>
        </div>
      </v-col>

      <!-- Actions Column -->
      <v-col cols="12" sm="3" class="actions-column pa-4">
        <!-- My Earnings button -->
        <v-btn
          :to="earningsRoute"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-information"
          block
          class="mb-2"
        >
          My Earnings
        </v-btn>

        <!-- Approve button (if pending and user is project creator) -->
        <v-btn
          v-if="investment.status === 'pending' && investment.can_approve"
          color="success"
          variant="tonal"
          prepend-icon="mdi-check"
          block
          @click="$emit('openApproveDialog', investment)"
        >
          Approve
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Interfaces for clarity
 */
interface Project {
  id: number
  access_uuid: string
  name: string
  thumbnail_url: string
  video_url: string
  created_at: string
  views_count: number
}

interface Investment {
  id: number
  share_percentage: string | number
  status: string
  project: Project
  is_creator: boolean
  can_approve: boolean
}

const props = defineProps<{ investment: Investment }>()
defineEmits(['openApproveDialog'])

// Get auth store to access the authenticated user
const authStore = useAuthStore()

// Get the authenticated user ID
const investorId = computed(() => {
  return authStore.user?.id || ''
})

/**
 * Build the watch route using the project's access_uuid
 * /watch/[access_uuid]
 */
const watchRoute = computed(() => {
  return `/watch/${props.investment.project.access_uuid}`
})

/**
 * Build the "My Earnings" route.
 * /investments/earnings/projects/[project.access_uuid]/investor-details-[user-id]
 */
const earningsRoute = computed(() => {
  return `/investments/earnings/projects/${props.investment.project.access_uuid}/investor-details-${investorId.value}`
})

/**
 * Build the "Project Earnings" route for creators.
 * /project/[access_uuid]/earnings
 */
const projectEarningsRoute = computed(() => {
  return `/project/${props.investment.project.access_uuid}/earnings/`
})
/**
 * Utility: approximate how many months ago a date is
 */
const formatDate = (date?: string) => {
  if (!date) return ''
  const diffMonths = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  return `${diffMonths} months ago`
}

/**
 * Utility: map status => color
 */
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
  }
  return colors[status] || 'grey'
}
</script>

<style scoped>
.investment-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.investment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
}

.media-column {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-link {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.media-link:hover {
  opacity: 0.9;
}

.project-thumbnail-wrapper {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-column {
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.actions-column {
  background: rgb(252, 252, 252);
}

/* Responsive */
@media (max-width: 600px) {
  .investment-card {
    border-radius: 8px;
  }
  .content-column {
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .actions-column {
    padding: 1rem !important;
  }
  .v-chip {
    margin-bottom: 0.25rem;
  }
}
</style>
