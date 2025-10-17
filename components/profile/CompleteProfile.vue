<template>
  <v-container class="complete-profile-container">
    <v-slide-y-transition>
      <v-card
        v-if="shouldShowComponent"
        class="complete-profile-card"
        elevation="10"
        width="100%"
        rounded="lg"
      >
        <!-- Header with Progress -->
        <v-card-item class="profile-header py-3 px-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon
                :icon="
                  currentStep === 1 ? 'mdi-account-circle' : 'mdi-star-circle'
                "
                :color="currentStep === 1 ? 'primary' : 'warning'"
                size="24"
                class="mr-3"
              />
              <h3 class="text-h6 font-weight-medium mb-0">
                {{
                  currentStep === 1
                    ? 'Complete Your Profile'
                    : 'About Your Talent'
                }}
              </h3>
            </div>
            <div v-if="totalSteps > 1" class="step-indicator">
              <span class="text-body-2"
                >Step {{ currentStep }}/{{ totalSteps }}</span
              >
            </div>
          </div>
          <v-progress-linear
            v-if="totalSteps > 1"
            :model-value="progressValue"
            :color="currentStep === 1 ? 'primary' : 'warning'"
            height="4"
            class="mt-3"
            rounded
          ></v-progress-linear>
        </v-card-item>

        <v-divider></v-divider>

        <!-- Main Content -->
        <v-card-text class="profile-content pa-4">
          <v-window v-model="currentStep" class="window-container">
            <!-- Step 1: Profile Photo -->
            <v-window-item
              v-if="needsProfilePhoto"
              :value="1"
              class="step-content"
            >
              <div class="d-flex profile-photo-section align-center">
                <UserProfilePhoto
                  :user="authStore.user"
                  size="64"
                  @photo-updated="handlePhotoUpdated"
                  class="mr-4"
                />
                <div class="upload-info">
                  <p class="text-h6 font-weight-medium mb-2">Profile Photo</p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ authStore.user?.value?.profile_photo ? 'Click to change your photo' : 'Add a photo to help others recognize you' }}
                  </p>
                </div>
              </div>
            </v-window-item>

            <!-- Step 2: Talent Decision -->
            <v-window-item
              v-if="needsTalentDecision"
              :value="getStepValue(2)"
              class="step-content"
            >
              <div class="talent-section">
                <!-- Quick Talent Selection Component -->
                <QuickTalentSelection
                  v-if="isCreateMode"
                  @talent-registered="handleQuickTalentRegistered"
                  @talent-selected="handleQuickTalentSelected"
                  @error="handleError"
                  class="mb-6"
                />

                <!-- Action Buttons -->
                <div
                  class="talent-actions d-flex justify-center align-center gap-4"
                >
                  <BaseButton
                    title="Find More Category"
                    color="primary"
                    variant="outlined"
                    :disabled="isLoading"
                    prepend-icon="mdi-magnify"
                    @click="showManualDialog = true"
                    custom-class="talent-btn"
                  />

                  <BaseButton
                    title="Maybe Later"
                    color="secondary"
                    variant="text"
                    :loading="isLoading"
                    :disabled="isLoading"
                    @click="handleTalentResponse('no')"
                    custom-class="talent-btn-secondary"
                  />
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>

        <!-- Footer Navigation -->
        <v-divider v-if="totalSteps > 1 && !isLastStep"></v-divider>
        <v-card-actions
          v-if="totalSteps > 1 && !isLastStep"
          class="profile-footer pa-4"
        >
          <v-btn
            v-if="currentStep > 1"
            variant="text"
            @click="currentStep--"
            :disabled="isLoading"
          >
            Back
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="currentStep++" :disabled="!canProceed">
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-slide-y-transition>

    <!-- Manual Registration Dialog -->
    <BaseDialog
      v-model="showManualDialog"
      title="Manual Category Registration"
      max-width="600px"
    >
      <TalentRegisterForm
        ref="manualFormRef"
        mode="create"
        :is-dialog-mode="true"
        @talent-updated="handleManualTalentUpdated"
        @success="handleManualSuccess"
        @error="handleError"
      />
      <template #actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="showManualDialog = false"
          :disabled="isLoading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="submitManualForm"
          :loading="isLoading"
          :disabled="!canSubmitManual"
        >
          Register Category
        </v-btn>
      </template>
    </BaseDialog>

    <!-- Success Dialog -->
    <TalentRegisterSuccessDialog
      v-model="showTalentSuccessDialog"
  :talentDetails="authStore.user?.value?.talent_details"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'

const router = useRouter()
const authStore = useAuthStore()
const { $axios } = useNuxtApp()

const showManualDialog = ref(false)
const showTalentSuccessDialog = ref(false)
const updatedCategorySlug = ref<string | null>(null)
const isLoading = ref(false)
const manualFormRef = ref(null)
const isCreateMode = computed(() => true)

const needsProfilePhoto = computed(() => {
  return !authStore.user?.value?.profile_photo
})

const needsTalentDecision = computed(() => {
  const v = authStore.user?.value?.has_talent
  return v === 'undecided' || v === null || v === undefined
})

const totalSteps = computed(() => {
  let steps = 0
  if (needsProfilePhoto.value) steps++
  if (needsTalentDecision.value) steps++
  return steps
})

const initialStep = computed(() => {
  if (needsProfilePhoto.value) return 1
  if (needsTalentDecision.value) return 1
  return 0
})
const currentStep = ref(initialStep.value)

function getStepValue(step: number) {
  if (needsProfilePhoto.value) return step
  return 1
}

function handlePhotoUpdated() {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}
const shouldShowComponent = computed(() => {
  return needsProfilePhoto.value || needsTalentDecision.value
})

const isLastStep = computed(() => currentStep.value === totalSteps.value)

const canProceed = computed(() => {
  if (currentStep.value === 1 && needsProfilePhoto.value) {
    return !!authStore.user?.value?.profile_photo
  }
  return true
})

const progressValue = computed(() => {
  return (currentStep.value / totalSteps.value) * 100
})

const canSubmitManual = computed(() => {
  return manualFormRef.value?.formIsValid || false
})

const handleTalentResponse = async (choice: 'yes' | 'no') => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    if (choice === 'no') {
      const response = await $axios.put('/api/user/talent/status', {
        has_talent: 'no',
      })
      console.log(response.data.message)
      authStore.updateUser({
        has_talent: 'no',
        talent: null,
      })
      showTalentSuccessDialog.value = true
    }
  } catch (error) {
    console.error('Error updating talent status:', error)
  } finally {
    isLoading.value = false
  }
}

function handleQuickTalentRegistered(talent: any) {
  updatedCategorySlug.value = talent.slug
  showTalentSuccessDialog.value = true
}

function handleQuickTalentSelected(talent: any) {
  console.log('Talent selected:', talent)
}

function handleManualTalentUpdated(category: any) {
  updatedCategorySlug.value = category.slug
  showManualDialog.value = false
  showTalentSuccessDialog.value = true
}

function handleManualSuccess(message: string) {
  console.log('Manual registration success:', message)
  showManualDialog.value = false
  showTalentSuccessDialog.value = true
}

function handleError(error: string) {
  console.error('Error:', error)
  // You can add a toast notification here if needed
}

async function submitManualForm() {
  if (manualFormRef.value?.submitTalent) {
    await manualFormRef.value.submitTalent()
  }
}

watch(
  () => authStore.user?.value?.profile_photo,
  (newValue) => {
    if (newValue && needsTalentDecision.value) {
      currentStep.value = getStepValue(2)
    }
  }
)
</script>

<style lang="scss" scoped>
.complete-profile-container {
  max-width: auto;
  margin: 0 auto;
  padding: 0 16px;
}

.complete-profile-card {
  margin: 1rem 0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;

  .profile-header {
    background-color: #ffffff;

    .step-indicator {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .profile-content {
    background-color: #ffffff;

    .window-container {
      min-height: 120px;
    }

    .profile-photo-section {
      padding: 4px 0;
    }

    .talent-section {
      .talent-actions {
        flex-wrap: wrap;
        gap: 16px;

        :deep(.talent-btn) {
          min-width: 180px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
          }
        }

        :deep(.talent-btn-secondary) {
          min-width: 120px;
          transition: all 0.2s ease;
          opacity: 0.9;

          &:hover {
            opacity: 1;
            transform: translateY(-1px);
          }
        }
      }
    }
  }

  .profile-footer {
    background-color: #ffffff;
  }
}

@media (max-width: 600px) {
  .complete-profile-card {
    .profile-content {
      padding: 12px !important;

      .profile-photo-section {
        flex-direction: column;
        align-items: center !important;
        text-align: center;

        .upload-info {
          margin-top: 12px;
          margin-left: 0 !important;
        }
      }

      .talent-section {
        .talent-benefits {
          justify-content: center;
        }

        .talent-actions {
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }
      }
    }
  }
}

:deep(.v-theme--dark) {
  .complete-profile-card {
    background-color: #1e1e1e;

    .profile-header {
      background-color: #2c2c2c;
    }

    .profile-content {
      background-color: #1e1e1e;

      .talent-section {
        .talent-benefits-card {
          background-color: #2c2c2c;
          border-color: #444444;
        }
      }
    }

    .profile-footer {
      background-color: #2c2c2c;
    }
  }
}

@media print {
  .complete-profile-card {
    box-shadow: none !important;
    border: 1px solid #ddd;

    .talent-actions,
    .profile-footer {
      display: none;
    }
  }
}
</style>
