<!-- TalentSettings.vue -->
<template>
  <div class="talent-settings">
    <div class="settings-header mb-6">
      <h3 class="text-h5 font-weight-bold mb-2">Creator Profile</h3>
      <p class="text-body-2 text-medium-emphasis">
        Manage your creator profile and showcase your skills in the entertainment industry
      </p>
    </div>

    <!-- Current Creator Status -->
    <v-card class="creator-status-card mb-6" variant="outlined">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon 
            :color="hasTalent ? 'success' : 'warning'" 
            size="24" 
            class="mr-3"
          >
            {{ hasTalent ? 'mdi-star' : 'mdi-star-outline' }}
          </v-icon>
          <div>
            <h4 class="text-h6 mb-1">
              {{ hasTalent ? 'Verified Creator' : 'Creator Registration' }}
            </h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ statusMessage }}
            </p>
          </div>
        </div>

        <!-- Current Creator Category -->
        <div v-if="hasTalent" class="current-creator mb-4">
          <v-chip
            color="primary"
            variant="elevated"
            size="large"
            prepend-icon="mdi-star"
          >
            {{ currentTalent }}
          </v-chip>
        </div>

        <!-- Action Buttons -->
        <div class="creator-actions">
          <v-btn
            v-if="hasTalent"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-pencil"
            @click="openEditDialog"
            class="mr-3"
          >
            Change Category
          </v-btn>
          
          <v-btn
            v-if="!hasTalent"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-star-plus"
            @click="openRegisterDialog"
            size="large"
          >
            Become a Creator
          </v-btn>

          <v-btn
            v-if="hasTalent"
            color="error"
            variant="text"
            prepend-icon="mdi-delete"
            @click="confirmRemoveCreator"
          >
            Remove Creator Status
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Creator Benefits Info -->
    <v-card class="benefits-card" variant="tonal" color="primary">
      <v-card-text class="pa-6">
        <h4 class="text-h6 mb-3 d-flex align-center">
          <v-icon class="mr-2">mdi-information</v-icon>
          Creator Benefits
        </h4>
        <v-list class="benefits-list" density="compact">
          <v-list-item
            v-for="benefit in creatorBenefits"
            :key="benefit"
            prepend-icon="mdi-check-circle"
            class="px-0"
          >
            <v-list-item-title class="text-body-2">{{ benefit }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Creator Registration/Edit Dialog -->
    <TalentRegisterDialog
      v-model="showDialog"
      :mode="dialogMode"
      @talent-updated="handleCreatorUpdated"
    />

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Remove Creator Status</v-card-title>
        <v-card-text>
          Are you sure you want to remove your creator status? This action cannot be undone and you'll lose access to creator-specific features.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="elevated" @click="removeCreatorStatus">
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const showDialog = ref(false)
const showConfirmDialog = ref(false)
const dialogMode = ref<'create' | 'update'>('create')

const hasTalent = computed(() => {
  return authStore.user?.has_talent === 'yes'
})

const currentTalent = computed(() => {
  return authStore.user?.talent_details?.talent || authStore.user?.talent || ''
})

const statusMessage = computed(() => {
  if (hasTalent.value) {
    return `You're verified as a ${currentTalent.value}`
  }
  return 'Become a creator to access exclusive features and opportunities'
})

const creatorBenefits = [
  'Create and manage entertainment projects',
  'Receive bookings and collaboration requests',
  'Get tips and donations from fans',
  'Access to creator-specific networking features',
  'Enhanced profile visibility',
  'Priority support and resources'
]

const openEditDialog = () => {
  dialogMode.value = 'update'
  showDialog.value = true
}

const openRegisterDialog = () => {
  dialogMode.value = 'create'
  showDialog.value = true
}

const confirmRemoveCreator = () => {
  showConfirmDialog.value = true
}

const removeCreatorStatus = async () => {
  try {
    // Add API call to remove creator status
    // await authStore.removeCreatorStatus()
    showConfirmDialog.value = false
    // Refresh user data
    authStore.fetchUser()
  } catch (error) {
    console.error('Failed to remove creator status:', error)
  }
}

const handleCreatorUpdated = () => {
  showDialog.value = false
  // Refresh user data
  authStore.fetchUser()
}
</script>

<style lang="scss" scoped>
.talent-settings {
  max-width: 800px;
}

.settings-header {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-bottom: 1rem;
}

.creator-status-card {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.current-creator {
  padding: 1rem;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
}

.creator-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.benefits-card {
  .benefits-list {
    background: transparent;
    
    .v-list-item {
      padding-left: 0;
      min-height: 32px;
      
      :deep(.v-list-item__prepend) {
        .v-icon {
          color: rgb(var(--v-theme-primary));
          opacity: 1;
        }
      }
    }
  }
}

@media (max-width: 600px) {
  .creator-actions {
    flex-direction: column;
    align-items: stretch;
    
    .v-btn {
      width: 100%;
    }
  }
}
</style>