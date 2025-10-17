<!-- components/RegisterForm.vue -->
<template>
  <div class="register-form">
    <v-window
      v-model="registerStore.step"
      class="register-window"
      :touch="false"
    >
      <!-- Step 1: Contact Info -->
      <v-window-item value="contact-info">
        <ContactInfoForm @next="nextStep('verification')" class="step-form" />
        
        <!-- Social Registration Section -->
        <SocialLoginButtons 
          mode="register"
          @social-success="handleSocialSuccess"
          @social-error="handleSocialError"
          class="mt-3"
        />
      </v-window-item>

      <!-- Step 2: Verification -->
      <v-window-item value="verification">
        <VerificationForm
          @verified="nextStep('personal-info')"
          @resend="handleResendCode"
          class="step-form"
        />
      </v-window-item>

      <!-- Step 3: Personal Info -->
      <v-window-item value="personal-info">
        <div class="mb-3 d-flex justify-space-between align-center">
          <div>
            <h3 class="text-subtitle-1 font-weight-medium mb-1">
              Complete Profile
            </h3>
            <p class="text-caption text-medium-emphasis">
              Final step to create your account
            </p>
          </div>
          <v-btn
            v-if="!registerStore.isSocialRegistration"
            variant="text"
            density="comfortable"
            size="small"
            prepend-icon="mdi-arrow-left"
            @click="prevStep('verification')"
          >
            Back
          </v-btn>
        </div>
        
        <!-- Regular Personal Info Form -->
        <PersonalInfoForm 
          v-if="!registerStore.isSocialRegistration"
          @submit="handleSubmit" 
          class="step-form" 
        />
        
        <!-- Social Personal Info Form -->
        <SocialPersonalInfoForm 
          v-else
          :user-id="registerStore.socialUserId"
          :social-data="registerStore.socialData"
          @submit="handleSubmit" 
          class="step-form" 
        />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterStore } from '~/stores/useRegister'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

// Store initialization
const registerStore = useRegisterStore()
const snackStore = useSnackMessageStore()
const router = useRouter()

// Methods
const nextStep = (step: string) => {
  registerStore.setStep(step)
}

const prevStep = (step: string = 'contact-info') => {
  registerStore.setStep(step)
}

const handleResendCode = async () => {
  try {
    await registerStore.resendVerificationCode()
    snackStore.success('Verification code resent successfully')
  } catch (error) {
    snackStore.error('Failed to resend verification code')
  }
}

const handleSubmit = async () => {
  try {
    snackStore.success('Registration completed successfully')
  } catch (error: any) {
    snackStore.error(error.message || 'Registration failed. Please try again.')
  }
}

const handleSocialSuccess = (data: any) => {
  // Handle social registration success
  if (data.requires_personal_info) {
    registerStore.setSocialRegistration({
      userId: data.user_id,
      socialData: data.social_data,
      isSocial: true
    })
    nextStep('personal-info')
  } else {
    // Complete social login, redirect to home
    router.push('/')
  }
}

const handleSocialError = (error: string) => {
  snackStore.error(error)
}
</script>

<style scoped>
.register-form {
  position: relative;
  width: 100%;
}

.register-window {
  min-height: 280px;
}

.step-form {
  animation: fadeIn 0.3s ease-out;
}

/* Ensure smooth transitions between steps */
:deep(.v-window__container) {
  transition: height 0.3s ease-in-out;
}

:deep(.v-window-item) {
  height: auto;
}

/* Animation for transitions */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .register-window {
    min-height: 240px;
  }
}
</style>