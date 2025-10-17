<template>
  <v-dialog v-model="dialogVisible" max-width="500px">
    <v-card elevation="10" class="rounded-lg">
      <!-- Regular Content -->
      <template v-if="!registrationSuccess">
        <v-card-title
          class="d-flex justify-space-between align-center py-3 px-4"
        >
          <span class="text-h6 font-weight-medium">
            {{ selectedCategory?.name }} Talents
          </span>
          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            @click="closeDialog"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="px-4 py-3">
          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-3"
            border="start"
          >
            Please select your talent from the list below
          </v-alert>

          <div v-if="selectedTalent" class="mb-3">
            <v-alert
              type="success"
              variant="tonal"
              density="comfortable"
              border="start"
            >
              Selected: {{ selectedTalent.name }}
            </v-alert>
          </div>

          <div class="talents-list">
            <div
              v-if="talentCategoryStore.isFetchingTalents"
              class="d-flex justify-center py-4"
            >
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>

            <v-alert
              v-else-if="
                !talentCategoryStore.talents.length &&
                !talentCategoryStore.talentsError
              "
              type="info"
              text="No talents found for this category."
              class="mt-2"
              density="comfortable"
            />

            <v-alert
              v-else-if="talentCategoryStore.talentsError"
              type="error"
              :text="talentCategoryStore.talentsError"
              class="mt-2"
              density="comfortable"
            />

            <div v-else class="talents-grid">
              <div class="talents-grid">
                <SelectTalentCard
                  v-for="talent in talentCategoryStore.talents"
                  :key="talent.id"
                  :talent="talent"
                  v-model="selectedTalent"
                  size="sm"
                  class="talent-card-item"
                />
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-4 py-3">
          <BaseButton
            title="Register Talent"
            :action="registerTalent"
            :disabled="!selectedTalent"
            :loading="isRegistering"
            prependIcon="mdi-check"
            fullWidth
            color="primary"
            height="44"
          />
        </v-card-actions>

        <v-divider></v-divider>

        <v-card-text class="px-4 py-3">
          <ReportMissingTalentDialog :selected-category="selectedCategory" />
        </v-card-text>
      </template>

      <!-- Success State -->
      <template v-else>
        <v-card-text class="success-content text-center pa-6">
          <v-icon color="success" size="64" class="mb-4">
            mdi-check-circle-outline
          </v-icon>

          <h3 class="text-h5 font-weight-medium mb-2">
            Registration Successful!
          </h3>

          <p class="text-body-1 mb-6">
            You have been registered as a
            <span class="font-weight-medium">{{ registeredTalent?.name }}</span>
          </p>

          <div class="d-flex flex-column gap-3">
            <v-btn
              color="primary"
              variant="elevated"
              block
              height="44"
              :to="`/talents/${registeredCategory?.slug}`"
              @click="closeDialog"
            >
              <v-icon start>mdi-account-group</v-icon>
              <span>
                Start Connecting with
                <span class="font-weight-medium">{{
                  registeredCategory?.name
                }}</span>
              </span>
            </v-btn>

            <v-btn
              color="secondary"
              variant="tonal"
              block
              height="44"
              @click="closeDialog"
            >
              <v-icon start>mdi-close</v-icon>
              Close
            </v-btn>
          </div>
        </v-card-text>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'

const router = useRouter()
const { $axios } = useNuxtApp()
const talentCategoryStore = useTalentCategoryStore()
const registeredCategory = ref<RegistrationResponse['data']['category'] | null>(
  null
)

interface Talent {
  id: number
  name: string
  avatar_url?: string
}

interface Category {
  id: number
  name: string
  slug: string
}

interface RegistrationResponse {
  message: string
  data: {
    talent: {
      id: number
      name: string
    }
    category: {
      id: number
      name: string
      slug: string
      avatar_url: string
    }
    has_talent: string
  }
}

const props = defineProps<{
  modelValue: boolean
  selectedCategory: Category | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'talentRegistered', talent: RegistrationResponse['data']['talent']): void
}>()

const selectedTalent = ref<Talent | null>(null)
const isRegistering = ref(false)
const registrationSuccess = ref(false)
const registeredTalent = ref<RegistrationResponse['data']['talent'] | null>(
  null
)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

watch(
  () => props.selectedCategory,
  async (newCategory) => {
    if (newCategory && dialogVisible.value) {
      await fetchTalents(newCategory.slug)
    }
  },
  { immediate: true }
)

watch(dialogVisible, async (newValue) => {
  if (newValue && props.selectedCategory) {
    await fetchTalents(props.selectedCategory.slug)
  } else if (!newValue) {
    talentCategoryStore.resetTalents()
    selectedTalent.value = null
  }
})

const fetchTalents = async (slug: string) => {
  if (!slug) return
  await talentCategoryStore.fetchCategoryTalents(slug)
}

const registerTalent = async () => {
  if (!selectedTalent.value || !props.selectedCategory) {
    return
  }

  isRegistering.value = true
  try {
    const response = await $axios.post<RegistrationResponse>(
      '/api/register/talent',
      {
        talent_category_id: props.selectedCategory.id,
        talent_id: selectedTalent.value.id,
      },
      {
        withCredentials: true,
      }
    )

    if (
      response.data.message === 'Talent registration completed successfully'
    ) {
      registeredTalent.value = response.data.data.talent
      registeredCategory.value = response.data.data.category
      registrationSuccess.value = true
      emit('talentRegistered', response.data.data.talent)
    } else {
      throw new Error('Unexpected response from server')
    }
  } catch (error) {
    console.error('Error registering talent:', error)
    // Handle error appropriately
  } finally {
    isRegistering.value = false
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  // Reset all states after a short delay to allow for closing animation
  setTimeout(async () => {
    selectedTalent.value = null
    registrationSuccess.value = false
    registeredTalent.value = null
    registeredCategory.value = null
    talentCategoryStore.resetTalents()
    // Navigate home after cleanup
    await navigateTo('/')
  }, 300)
}
</script>

<style lang="scss" scoped>
.talents-list {
  max-height: 400px;
  overflow-y: auto;
  margin: 0 -16px;
  padding: 0 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;

    &:hover {
      background: #666;
    }
  }
}

.success-content {
  .v-icon {
    animation: scaleIn 0.5s ease-out;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.talents-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;

  .talent-card-item {
    animation: slideIn 0.3s ease-out forwards;
    opacity: 0;

    @for $i from 1 through 20 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.05}s;
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

:deep(.v-alert) {
  margin-bottom: 0;
}

:deep(.v-card-actions) {
  padding: 16px !important;
}

// Responsive adjustments
@media (max-width: 600px) {
  .talents-list {
    max-height: 60vh; // Adjust for better mobile viewing
    margin: 0 -8px;
    padding: 0 8px;
  }

  .talents-grid {
    gap: 6px;
    padding: 2px;
  }
}

// Dark mode adjustments
:deep(.v-theme--dark) {
  .talents-list {
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);

      &:hover {
        background: rgba(255, 255, 255, 0.4);
      }
    }
  }
}
</style>
