<template>
  <v-card elevation="2" class="investment-card mb-4">
    <v-row no-gutters>
      <!-- Media Column -->
      <v-col cols="12" sm="3" class="media-column">
        <MediaThumbnail
          size="md"
          :videoUrl="investment.project.video_url"
          :thumbnailUrl="investment.project.thumbnail_url"
          :showViews="false"
          :showDuration="true"
          class="project-thumbnail-wrapper"
        />
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
        >
          My Earnings
        </v-btn>

        <!-- Approve button (if pending) -->
        <v-btn
          v-if="investment.status === 'pending'"
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
import { computed, onMounted } from 'vue'
import { usePageAuthStore } from '@/stores/page/pageAuthStore' // your store file
import { useRoute } from 'vue-router'

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
}

const props = defineProps<{ investment: Investment }>()
defineEmits(['openApproveDialog'])

/**
 * Access the pageAuthStore to get the "page" data
 * (which includes the investor's ID if this page is the investor).
 */
const pageAuth = usePageAuthStore()

// If the store isn't loaded, fetch the page data (assuming route param is the page slug)
const route = useRoute()
const pageSlug = route.params.pageSlug as string

onMounted(async () => {
  if (!pageAuth.page && !pageAuth.loading) {
    try {
      await pageAuth.fetchPageData(pageSlug)
    } catch (err) {
      console.error('Error fetching page data in PageInvestmentCard:', err)
    }
  }
})

/**
 * Build the "My Earnings" route. We want:
 * /project/[project.access_uuid]/investors/investor-details-[investorId]
 *
 * The investor ID = pageAuth.page?.id
 */
const earningsRoute = computed(() => {
  const investorId = pageAuth.page?.id
  if (!investorId) {
    return '#'
  }
  return `/investments/earnings/projects/${props.investment.project.access_uuid}/investor-details-${investorId}`
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
