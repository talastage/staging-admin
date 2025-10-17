<template>
  <v-card class="project-contribution-item" :loading="loading" flat>
    <div class="d-flex align-center">
      <MediaThumbnail
        :thumbnailUrl="project.thumbnail_url"
        :videoUrl="project.video_url"
        :showViews="false"
        :showDuration="true"
        size="lg"
        class="project-card__thumbnail"
      />
      <div class="project-content">
        <div class="project-title">
          <ProjectTitle
            :title="project.name"
            :creator="project.creator.display_name"
            :maxLength="12"
            class="project-title"
          />
        </div>

        <ContributionDetails :contribution="project.contribution_details" />

        <v-card-actions
          v-if="project.contribution_details.status === 'pending'"
        >
          <v-btn
            color="success"
            @click="
              acceptContribution(
                project.contribution_details.id,
                project.access_uuid
              )
            "
            :loading="loading"
          >
            Accept
          </v-btn>
          <v-btn
            color="error"
            @click="
              declineContribution(
                project.contribution_details.id,
                project.access_uuid
              )
            "
            :loading="loading"
          >
            Decline
          </v-btn>
        </v-card-actions>

        <v-card-actions
          v-if="project.contribution_details.status === 'confirmed'"
        >
          <NuxtLink :to="`/project/${project.access_uuid}/earnings/investor`">
            <v-btn color="primary">View Earnings</v-btn>
          </NuxtLink>
          <v-btn
            color="warning"
            @click="
              cancelContribution(
                project.contribution_details.id,
                project.access_uuid
              )
            "
            :loading="loading"
          >
            Cancel
          </v-btn>
          <v-btn disabled>Accepted</v-btn>
        </v-card-actions>

        <v-card-actions
          v-if="project.contribution_details.status === 'cancelled'"
        >
          <v-btn
            color="success"
            @click="
              acceptContribution(
                project.contribution_details.id,
                project.access_uuid
              )
            "
            :loading="loading"
          >
            Accept
          </v-btn>
          <v-btn disabled>Cancelled</v-btn>
        </v-card-actions>

        <v-card-actions
          v-if="project.contribution_details.status === 'declined'"
        >
          <v-btn disabled>Declined</v-btn>
        </v-card-actions>

        <v-card-actions
          v-if="project.contribution_details.status === 'invited'"
        >
          <v-btn
            color="success"
            @click="
              acceptContribution(
                project.contribution_details.id,
                project.access_uuid
              )
            "
            :loading="loading"
          >
            Accept
          </v-btn>
          <v-btn
            color="error"
            @click="
              declineContribution(
                project.contribution_details.id,
                project.access_uuid
              )
            "
            :loading="loading"
          >
            Decline
          </v-btn>
        </v-card-actions>
      </div>
    </div>
    <Snackbar :message="snackbar.message" :visible="snackbar.show" />
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'

const props = defineProps({
  project: Object,
})

const loading = ref(false)
const { $axios } = useNuxtApp()
const snackbar = ref({
  show: false,
  message: '',
  timeout: 3000,
})

const acceptContribution = async (contributionId, accessUuid) => {
  loading.value = true
  try {
    await $axios.post(
      `/api/projects/${accessUuid}/investors/${contributionId}/accept`
    )
    snackbar.value.message = 'Contribution accepted successfully.'
    snackbar.value.show = true
    props.project.contribution_details.status = 'confirmed' // Update the status to confirmed
  } catch (error) {
    console.error('Error accepting contribution:', error)
  } finally {
    loading.value = false
  }
}

const declineContribution = async (contributionId, accessUuid) => {
  loading.value = true
  try {
    await $axios.post(
      `/api/projects/${accessUuid}/investors/${contributionId}/decline`
    )
    snackbar.value.message = 'Contribution declined successfully.'
    snackbar.value.show = true
    props.project.contribution_details.status = 'declined' // Update the status to declined
  } catch (error) {
    console.error('Error declining contribution:', error)
  } finally {
    loading.value = false
  }
}

const cancelContribution = async (contributionId, accessUuid) => {
  loading.value = true
  try {
    await $axios.post(
      `/api/projects/${accessUuid}/investors/${contributionId}/cancel`
    )
    snackbar.value.message = 'Contribution cancelled successfully.'
    snackbar.value.show = true
    props.project.contribution_details.status = 'cancelled' // Update the status to cancelled
  } catch (error) {
    console.error('Error cancelling contribution:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.project-contribution-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 16px;
  position: relative;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.project-title {
  font-size: 1rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
