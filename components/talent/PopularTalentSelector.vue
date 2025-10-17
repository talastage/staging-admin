<template>
  <div class="popular-talent-selector">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-row>
        <v-col v-for="n in 8" :key="n" cols="6" sm="4" md="3">
          <v-skeleton-loader type="chip" class="mb-2"></v-skeleton-loader>
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
      <template #append>
        <v-btn size="small" variant="text" @click="fetchPopularTalents">
          Retry
        </v-btn>
      </template>
    </v-alert>

    <!-- Talents Grid -->
    <div v-else-if="talents.length > 0" class="talents-grid">
      <v-chip-group
        v-model="selectedTalentIndex"
        column
        mandatory="{false}"
        class="talent-chips"
      >
        <v-chip
          v-for="(talent, index) in talents"
          :key="talent.id"
          :value="index"
          variant="outlined"
          size="default"
          class="talent-chip"
          :class="{ 'talent-chip--selected': selectedTalentIndex === index }"
          @click="selectTalent(talent, index)"
        >
          {{ talent.name }}
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Empty State -->
    <v-alert v-else type="info" variant="tonal">
      No popular talents available at the moment.
    </v-alert>

    <!-- Confirmation Dialog -->
    <BaseDialog
      v-model="showConfirmDialog"
      title="Confirm Talent Registration"
      max-width="450px"
    >
      <div v-if="selectedTalent" class="confirmation-content">
        <div class="text-center mb-4">
          <v-icon size="48" color="primary" class="mb-2">mdi-star</v-icon>
          <h3 class="text-h6 mb-2">Register Your Talent</h3>
          <p class="text-body-1">
            You're about to register
            <strong>{{ selectedTalent.name }}</strong> in the
            <strong>{{ selectedTalent.category?.name }}</strong> category.
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            This will be added to your profile and help others discover your
            skills.
          </p>
        </div>
      </div>

      <template #actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="cancelSelection" :disabled="registering">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="confirmRegistration"
          :loading="registering"
        >
          Confirm Registration
        </v-btn>
      </template>
    </BaseDialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccessMessage"
      color="success"
      timeout="4000"
      location="top"
    >
      <v-icon>mdi-check-circle</v-icon>
      Talent registered successfully!
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseDialog from '~/components/dialogs/BaseDialog.vue'
import { useAuthStore } from '~/stores/auth'

// Types
interface TalentCategory {
  id: number
  name: string
  slug: string
  avatar_url?: string | null
}

interface PopularTalent {
  id: number
  name: string
  category_id: number
  category?: TalentCategory
}

interface ApiResponse {
  success: boolean
  message: string
  data: PopularTalent[]
  count: number
}

interface TalentRegistrationResponse {
  message: string
  user_talent: {
    name: string
    category: {
      id: number
      name: string
      slug: string
      avatar_url: string | null
    }
    category_id: number
    talent_id: number
  }
}

// Composables
const { $axios } = useNuxtApp()
const authStore = useAuthStore()

// Reactive state
const loading = ref(false)
const registering = ref(false)
const error = ref<string | null>(null)
const talents = ref<PopularTalent[]>([])
const selectedTalent = ref<PopularTalent | null>(null)
const selectedTalentIndex = ref<number | null>(null)
const showConfirmDialog = ref(false)
const showSuccessMessage = ref(false)

// Emits
const emit = defineEmits<{
  talentRegistered: [talent: PopularTalent]
  error: [message: string]
}>()

// Methods
const fetchPopularTalents = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $axios.get<ApiResponse>('/api/talents/popular')

    if (response.data.success) {
      talents.value = response.data.data
    } else {
      throw new Error(
        response.data.message || 'Failed to fetch popular talents'
      )
    }
  } catch (err: any) {
    console.error('Error fetching popular talents:', err)
    error.value =
      err.response?.data?.message ||
      err.message ||
      'Failed to load popular talents'
  } finally {
    loading.value = false
  }
}

const selectTalent = (talent: PopularTalent, index: number) => {
  selectedTalent.value = talent
  selectedTalentIndex.value = index
  showConfirmDialog.value = true
}

const cancelSelection = () => {
  selectedTalent.value = null
  selectedTalentIndex.value = null
  showConfirmDialog.value = false
}

const confirmRegistration = async () => {
  if (!selectedTalent.value) return

  registering.value = true

  try {
    const payload = {
      talent_category_id: selectedTalent.value.category_id,
      talent_id: selectedTalent.value.id,
    }

    const response = await $axios.post<TalentRegistrationResponse>(
      '/api/user/talent',
      payload
    )

    if (response.status === 201) {
      // Update the auth store with the talent information
      const responseData = response.data.user_talent

      authStore.updateUser({
        has_talent: 'yes',
        talent: responseData.name,
        talent_details: {
          category: responseData.category.name,
          talent: responseData.name,
          talent_id: responseData.talent_id,
          category_id: responseData.category_id,
        },
      })

      showSuccessMessage.value = true
      showConfirmDialog.value = false
      emit('talentRegistered', selectedTalent.value)

      // Reset selection
      selectedTalent.value = null
      selectedTalentIndex.value = null
    }
  } catch (err: any) {
    console.error('Error registering talent:', err)
    const errorMessage =
      err.response?.data?.message || 'Failed to register talent'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    registering.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchPopularTalents()
})
</script>

<style scoped>
.popular-talent-selector {
  width: 100%;
}

.loading-container {
  padding: 16px 0;
}

.talents-grid {
  padding: 8px 0;
}

.talent-chips {
  gap: 8px;
}

.talent-chip {
  margin: 4px;
  transition: all 0.2s ease;
}

.talent-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.talent-chip--selected {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.confirmation-content {
  padding: 16px 0;
}

:deep(.v-chip-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.v-chip) {
  height: auto;
  padding: 8px 16px;
  white-space: normal;
  word-wrap: break-word;
}
</style>
