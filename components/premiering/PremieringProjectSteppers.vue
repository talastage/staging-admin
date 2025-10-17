<template>
  <div class="stepper-wrapper" :class="{ processing: isProcessing }">
    <!-- Step Header Navigation -->
    <v-card elevation="10" class="mb-4">
      <v-stepper :model-value="modelValue" alt-labels density="compact">
        <v-stepper-header>
          <template v-for="(step, i) in steps" :key="step.value">
            <v-stepper-item
              :value="step.value"
              :complete="modelValue > step.value"
              :disabled="!canNavigateToStep(step.value)"
              class="compact-step"
            >
              <template v-slot:default>
                <div 
                  class="step-content clickable" 
                  v-if="canNavigateToStep(step.value)"
                  @click="updateStep(step.value)"
                >
                  <v-icon size="small" :color="getStepIconColor(step.value)">{{ step.icon }}</v-icon>
                  <div class="text-caption">{{ step.title }}</div>
                </div>
                <div class="step-content" v-else>
                  <v-icon size="small" :color="getStepIconColor(step.value)">{{ step.icon }}</v-icon>
                  <div class="text-caption">{{ step.title }}</div>
                </div>
              </template>
            </v-stepper-item>
            
            <v-divider v-if="i < steps.length - 1"></v-divider>
          </template>
        </v-stepper-header>
      </v-stepper>
    </v-card>

    <!-- Step Content -->
    <v-card elevation="10" class="mb-4">
      <v-card-text class="pa-4">
        <keep-alive>
          <component
            :is="currentStepComponent"
            ref="componentRef"
            :project="project"
            @payment-failed="handlePaymentFailed"
          />
        </keep-alive>
      </v-card-text>
    </v-card>

    <!-- Navigation Buttons -->
    <v-card elevation="10">
      <v-card-actions class="d-flex justify-space-between pa-3">
        <v-btn
          v-if="!isFirstStep"
          variant="text"
          density="comfortable"
          :disabled="isProcessing"
          @click="previousStep"
        >
          <v-icon start size="small">mdi-arrow-left</v-icon>
          Back
        </v-btn>
        <v-spacer />
        <v-btn
          :loading="isProcessing"
          :disabled="isProcessing || !canProceed"
          :color="isLastStep ? actionColor : 'primary'"
          density="comfortable"
          @click="handleNext"
        >
          {{ isLastStep ? actionTitle : 'Continue' }}
          <v-icon end size="small">
            {{ isLastStep ? actionIcon : 'mdi-arrow-right' }}
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DefineComponent } from 'vue'
import PremieringProjectDetail from '@/components/premiering/PremieringProjectDetail.vue'
import PremieringProjectSettings from '@/components/premiering/PremieringProjectSettings.vue'
import AddProjectInvestors from '@/components/project/AddProjectInvestors.vue'
import AddProjectCredits from '@/components/project/AddProjectCredits.vue'
import { usePublishingStore } from '~/stores/usePublishingStore'
import type { StudioProject } from '~/types/studio-project'

type StepComponent = DefineComponent<any, any, any> | string

interface Step {
  value: number
  title: string
  icon: string
  component: StepComponent
}

const props = defineProps<{
  modelValue: number
  project: StudioProject
  mode?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'finish'): void
  (e: 'payment-failed', payload?: any): void
}>()

const publishingStore = usePublishingStore()
const componentRef = ref<any>(null)
const canProceed = ref(true)
const highestStepReached = ref(1)

// Define steps
const steps = computed<Step[]>(() => [
  {
    value: 1,
    title: 'Project Details',
    icon: 'mdi-file-document-outline',
    component: PremieringProjectDetail,
  },
  {
    value: 2,
    title: 'Investors',
    icon: 'mdi-account-group',
    component: AddProjectInvestors,
  },
  {
    value: 3,
    title: 'Credits',
    icon: 'mdi-format-list-text',
    component: AddProjectCredits,
  },
  {
    value: 4,
    title: 'Premiering Settings',
    icon: 'mdi-cog',
    component: PremieringProjectSettings,
  },
])

// Computed properties
const isProcessing = computed(() => publishingStore.processingAction !== null)
const isFirstStep = computed(() => props.modelValue === 1)
const isLastStep = computed(() => props.modelValue === steps.value.length)
const currentStepComponent = computed(() => {
  const step = steps.value.find((s) => s.value === props.modelValue)
  return step ? step.component : null
})

const actionTitle = computed(() => publishingStore.actionTitle)
const actionIcon = computed(() => publishingStore.actionIcon)
const actionColor = computed(() => publishingStore.actionColor)

// Initialize highest step reached
watch(() => props.modelValue, (newVal) => {
  highestStepReached.value = Math.max(highestStepReached.value, newVal)
  canProceed.value = true
}, { immediate: true })

// Methods
function canNavigateToStep(stepValue: number): boolean {
  return !isProcessing.value && stepValue <= highestStepReached.value
}

function getStepIconColor(stepValue: number): string {
  if (props.modelValue === stepValue) return 'primary'
  if (props.modelValue > stepValue) return 'success'
  return 'grey'
}

function updateStep(value: number): void {
  // Only allow navigation to steps that have been reached before
  if (canNavigateToStep(value)) {
    emit('update:modelValue', value)
  }
}

function previousStep(): void {
  if (!isFirstStep.value && !isProcessing.value) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

async function handleNext(): Promise<void> {
  if (isProcessing.value) return

  // If it's the last step, validate and trigger the publishing action
  if (isLastStep.value) {
    const settingsComponent = componentRef.value
    if (!settingsComponent) return

    try {
      const missingFields = settingsComponent.getMissingRequiredFields()
      if (missingFields.length > 0) {
        settingsComponent.missingFields = missingFields
        settingsComponent.showMissingFieldsDialog = true
        return
      }
      
      const accessUUID = props.project?.access_uuid
      
      // Execute the appropriate publishing action based on the selected option
      switch (publishingStore.publishOption) {
        case 'schedule':
          await settingsComponent.handleSchedule()
          // Navigation is handled in the component
          break
        case 'draft':
          await settingsComponent.handleDraft()
          // Navigation is handled in the component
          break
        default:
          await settingsComponent.handlePremiereNow()
          // Navigation is handled in the component
      }
      emit('finish')
    } catch (error) {
      console.error('Error in handleNext:', error)
    }
  } else {
    // Move to the next step
    const nextStep = props.modelValue + 1
    highestStepReached.value = Math.max(highestStepReached.value, nextStep)
    emit('update:modelValue', nextStep)
  }
}

function handlePaymentFailed(payload?: any): void {
  emit('payment-failed', payload)
}
</script>

<style scoped>
.stepper-wrapper {
  width: 100%;
}

.stepper-wrapper.processing {
  pointer-events: none;
  opacity: 0.7;
}

.compact-step {
  min-height: 40px;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 8px;
}

/* Make stepper more compact */
:deep(.v-stepper-header) {
  padding: 8px;
}

:deep(.v-stepper-item) {
  padding: 0 8px;
}

:deep(.v-stepper-item__avatar) {
  margin-right: 4px;
  height: 24px;
  width: 24px;
}
</style>