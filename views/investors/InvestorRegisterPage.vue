<template>
  <v-container>
    <v-card class="mx-auto" max-width="1200" elevation="10">
      <v-card-title class="text-h5 text-center pa-4">
        Create Your Investor Profile
      </v-card-title>

      <v-stepper v-model="currentStep">
        <!-- Stepper Headers -->
        <v-stepper-header>
          <v-stepper-item
            v-for="step in steps"
            :key="step.value"
            :value="step.value"
            :complete="currentStep > step.value"
          >
            {{ step.title }}
          </v-stepper-item>
        </v-stepper-header>

        <!-- Stepper Content -->
        <v-stepper-window>
          <!-- Step 1: Basic Info -->
          <v-stepper-window-item :value="1">
            <page-basic-info-step ref="basicInfoStep" />
          </v-stepper-window-item>

          <!-- Step 2: Investment Preferences -->
          <v-stepper-window-item :value="2">
            <page-interests-and-investment-step ref="investmentStep" />
          </v-stepper-window-item>

          <!-- Step 3: Contact & Location -->
          <v-stepper-window-item :value="3">
            <page-contact-and-location-step ref="contactStep" />
          </v-stepper-window-item>
        </v-stepper-window>

        <!-- Navigation Buttons -->
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            v-if="currentStep > 1"
            variant="outlined"
            @click="previousStep"
          >
            Back
          </v-btn>
          <v-btn
            v-if="currentStep < steps.length"
            color="primary"
            class="ml-4"
            @click="nextStep"
          >
            Continue
          </v-btn>
          <v-btn
            v-else
            color="success"
            class="ml-4"
            :loading="isSubmitting"
            @click="submitForm"
          >
            Create Investor Profile
          </v-btn>
        </v-card-actions>
      </v-stepper>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePageRegistrationStore } from '~/stores/usePageRegistration'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = usePageRegistrationStore()
const authStore = useAuthStore()
const currentStep = ref(1)
const isSubmitting = ref(false)

// Refs for step components
const basicInfoStep = ref(null)
const investmentStep = ref(null)
const contactStep = ref(null)

// Define steps with more intuitive titles
const steps = [
  { value: 1, title: 'Basic Info' },
  { value: 2, title: 'Investment Preferences' },
  { value: 3, title: 'Contact Details' },
]

// Check authentication on mount
onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
  }
})

// Validate current step using the appropriate ref
const validateCurrentStep = async () => {
  const stepRefs = {
    1: basicInfoStep,
    2: investmentStep,
    3: contactStep,
  }
  const currentRef = stepRefs[currentStep.value]?.value
  
  // Use custom validation for contact step
  if (currentStep.value === 3 && currentRef?.validateForm) {
    return await currentRef.validateForm()
  }
  
  return currentRef?.isValid ?? true
}

const nextStep = async () => {
  if (await validateCurrentStep()) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
}

const submitForm = async () => {
  // Validate the final step before submission
  if (!(await validateCurrentStep())) {
    return
  }
  
  try {
    isSubmitting.value = true
    const response = await store.submitPage()
    // Redirect using the page type and slug from the response
    router.push(`/profile/${response.data.type}/${response.data.slug}`)
  } catch (error) {
    console.error('Error creating investor profile:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
