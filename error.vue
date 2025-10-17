<template>
  <div class="error-container">
    <div class="error-content">
      <div class="logo-section">
        <img src="/talastage_logo.png" alt="TalaStage" class="logo" />
        <h1 class="app-name">TalaStage</h1>
      </div>
      
      <div class="error-section">
        <h2 class="error-title">{{ errorTitle }}</h2>
        <p class="error-message">{{ errorMessage }}</p>
        
        <div class="error-actions">
          <v-btn 
            color="primary" 
            @click="handleError"
            class="error-btn"
          >
            {{ errorButtonText }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  error: any
}>()

const errorTitle = computed(() => {
  if (props.error?.statusCode === 404) {
    return 'Page Not Found'
  }
  return 'Something went wrong'
})

const errorMessage = computed(() => {
  if (props.error?.statusCode === 404) {
    return 'The page you are looking for could not be found.'
  }
  return 'We encountered an unexpected error. Please try again later.'
})

const errorButtonText = computed(() => {
  if (props.error?.statusCode === 404) {
    return 'Go Home'
  }
  return 'Try Again'
})

const handleError = () => {
  if (props.error?.statusCode === 404) {
    navigateTo('/')
  } else {
    // Reload the page for other errors
    if (process.client) {
      window.location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.logo-section {
  margin-bottom: 32px;
  
  .logo {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    object-fit: contain;
  }
  
  .app-name {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    margin: 0;
  }
}

.error-section {
  .error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 16px 0;
  }
  
  .error-message {
    font-size: 1rem;
    color: #4a5568;
    line-height: 1.6;
    margin: 0 0 24px 0;
  }
}

.error-actions {
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.error-btn {
  min-width: 120px;
}

@media (max-width: 480px) {
  .error-content {
    padding: 32px 24px;
  }
  
  .logo-section .app-name {
    font-size: 1.75rem;
  }
  
  .error-section .error-title {
    font-size: 1.25rem;
  }
}
</style>