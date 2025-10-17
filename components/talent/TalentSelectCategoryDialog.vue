<!-- components/talent/TalentSelectCategoryDialog.vue -->
<template>
  <v-dialog v-model="dialogVisible" max-width="500px" persistent>
    <v-card elevation="10" class="rounded-lg">
      <!-- Success State -->
      <template v-if="registrationSuccess">
        <v-card-text class="success-content text-center pa-6">
          <v-icon color="success" size="64" class="mb-4 success-icon">
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
              Start Connecting with {{ registeredCategory?.name }}
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

      <!-- Regular Content -->
      <template v-else>
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
          />
        </v-card-title>

        <v-divider />

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

          <v-alert
            v-if="selectedTalent"
            type="success"
            variant="tonal"
            density="comfortable"
            border="start"
            class="mb-3"
          >
            Selected: {{ selectedTalent.name }}
          </v-alert>

          <div class="talents-list">
            <!-- Loading -->
            <div
              v-if="talentCategoryStore.isFetchingTalents"
              class="d-flex justify-center py-4"
            >
              <v-progress-circular indeterminate color="primary" />
            </div>

            <!-- No Talents -->
            <v-alert
              v-else-if="
                !talentCategoryStore.talents.length &&
                !talentCategoryStore.talentsError
              "
              type="info"
              text="No talents found for this category."
              density="comfortable"
            />

            <!-- Error -->
            <v-alert
              v-else-if="talentCategoryStore.talentsError"
              type="error"
              :text="talentCategoryStore.talentsError"
              density="comfortable"
            />

            <!-- Talents Grid -->
            <div v-else class="talents-grid">
              <SelectTalentCard
                v-for="(talent, index) in talentCategoryStore.talents"
                :key="talent.id"
                v-model="selectedTalent"
                :talent="talent"
                size="sm"
                :style="{ animationDelay: `${index * 50}ms` }"
                class="talent-card-item"
              />
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-4 py-3">
          <BaseButton
            title="Register Talent"
            :action="registerTalent"
            :disabled="!selectedTalent"
            :loading="isRegistering"
            prepend-icon="mdi-check"
            full-width
            color="primary"
            height="44"
          />
        </v-card-actions>

        <v-divider />

        <v-card-text class="px-4 py-3">
          <ReportMissingTalentDialog :selected-category="selectedCategory" />
        </v-card-text>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useTalentCategoryStore } from '@/stores/useTalentCategories'

// Types
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
    talent: { id: number; name: string }
    category: { id: number; name: string; slug: string; avatar_url: string }
    has_talent: string
  }
}

// Props & Emits
const props = defineProps<{
  modelValue: boolean
  selectedCategory: Category | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  talentRegistered: [talent: RegistrationResponse['data']['talent']]
}>()

// Composables
const { $axios } = useNuxtApp()
const talentCategoryStore = useTalentCategoryStore()

// State
const selectedTalent = ref<Talent | null>(null)
const isRegistering = ref(false)
const registrationSuccess = ref(false)
const registeredTalent = ref<RegistrationResponse['data']['talent'] | null>(
  null
)
const registeredCategory = ref<RegistrationResponse['data']['category'] | null>(
  null
)

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Methods
const fetchTalents = async (slug: string) => {
  if (slug) await talentCategoryStore.fetchCategoryTalents(slug)
}

const registerTalent = async () => {
  if (!selectedTalent.value || !props.selectedCategory) return

  isRegistering.value = true
  try {
    const { data } = await $axios.post<RegistrationResponse>(
      '/api/register/talent',
      {
        talent_category_id: props.selectedCategory.id,
        talent_id: selectedTalent.value.id,
      },
      { withCredentials: true }
    )

    if (data.message === 'Talent registration completed successfully') {
      registeredTalent.value = data.data.talent
      registeredCategory.value = data.data.category
      registrationSuccess.value = true
      emit('talentRegistered', data.data.talent)
    }
  } catch (error) {
    console.error('Error registering talent:', error)
  } finally {
    isRegistering.value = false
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  // Reset states after animation
  setTimeout(() => {
    selectedTalent.value = null
    registrationSuccess.value = false
    registeredTalent.value = null
    registeredCategory.value = null
    talentCategoryStore.resetTalents()
  }, 300)
}

// Watchers
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
</script>

<style lang="scss" scoped>
.talents-list {
  max-height: 400px;
  overflow-y: auto;
  margin: 0 -16px;
  padding: 0 16px;

  &::-webkit-scrollbar {
    width: 6px;

    &-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &-thumb {
      background: #888;
      border-radius: 3px;

      &:hover {
        background: #666;
      }
    }
  }
}

.talents-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
}

.talent-card-item {
  animation: slideIn 0.3s ease-out forwards;
  opacity: 0;
}

.success-icon {
  animation: scaleIn 0.5s ease-out;
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

@media (max-width: 600px) {
  .talents-list {
    max-height: 60vh;
    margin: 0 -8px;
    padding: 0 8px;
  }

  .talents-grid {
    gap: 6px;
    padding: 2px;
  }
}

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
