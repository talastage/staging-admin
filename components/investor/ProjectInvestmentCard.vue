<template>
  <v-card class="project-investment-card elevation-3">
    <div class="d-flex flex-no-wrap">
      <div class="project-thumbnail-wrapper">
        <MediaThumbnail
          :thumbnailUrl="projectData.thumbnail_url"
          :access_uuid="projectData.access_uuid"
          size="medium"
        />
      </div>
      <div
        class="project-details d-flex flex-column justify-space-between pa-4"
      >
        <div>
          <div class="d-flex align-center justify-space-between mb-2">
            <h3 class="text-h6 font-weight-bold">{{ projectData.name }}</h3>
            <StatusBadge :status="projectData.status" />
          </div>
          <h4 class="text-subtitle-1 font-weight-medium mb-4">Earnings</h4>
          <div class="d-flex flex-wrap">
            <v-chip class="mr-2 mb-2" color="primary" outlined>
              {{ earnings.watchings_count }} Watchings
            </v-chip>
            <v-chip class="mr-2 mb-2" color="success" outlined>
              Total Watching: {{ earnings.total_watching_earnings.formatted }}
            </v-chip>
            <v-chip class="mb-2" color="info" outlined>
              Tips: {{ earnings.total_tip_earnings.formatted }}
            </v-chip>
          </div>
        </div>
        <div class="mt-4">
          <v-btn
            color="primary"
            :to="`/earnings/project/${projectData.access_uuid}`"
            rounded
            elevation="2"
          >
            View Earnings
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
const props = defineProps({
  investment: {
    type: Object,
    required: true,
  },
})

const projectData = computed(() => ({
  access_uuid: props.investment?.project?.access_uuid || '',
  thumbnail_url: props.investment?.project?.thumbnail_url || '',
  name: props.investment?.project?.name || 'Untitled Project',
  status: props.investment?.project?.status || 'unknown',
}))

const earnings = computed(() => ({
  watchings_count: props.investment?.earnings?.watchings_count || 0,
  total_watching_earnings: {
    formatted:
      props.investment?.earnings?.total_watching_earnings?.formatted || '$0.00',
  },
  total_tip_earnings: {
    formatted:
      props.investment?.earnings?.total_tip_earnings?.formatted || '$0.00',
  },
}))
</script>

<style scoped>
.project-investment-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.project-investment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.project-thumbnail-wrapper {
  flex: 0 0 320px;
}

.project-details {
  flex: 1;
}

@media (max-width: 960px) {
  .project-investment-card > div {
    flex-direction: column;
  }

  .project-thumbnail-wrapper,
  .project-details {
    width: 100%;
  }
}
</style>
