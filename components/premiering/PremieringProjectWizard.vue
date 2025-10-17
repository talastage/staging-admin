<!-- PremieringProjectWizard.vue -->
<template>
  <v-container>
    <!-- Initial Upload Content -->
    <PremieringUploadVideoContent
      v-if="!project?.access_uuid || project.main_upload_status !== 'completed'"
    />

    <!-- Project Details with Stepper -->
    <PremieringProjectDetailsContent v-else :initial-step="1" />

    <!-- Loading Overlay -->
    <v-overlay :model-value="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectPremieringStore } from '~/stores/premiering/projectPremieringStoreDELETE'

const projectStore = useProjectPremieringStore()

// Computed
const project = computed(() => projectStore.project)
const isLoading = computed(() => projectStore.isLoading)
</script>
