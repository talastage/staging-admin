<template>
  <div class="app-loading-screen">
    <div class="loading-content">
      <!-- Logo -->
      <div class="logo-container">
        <img 
          src="/talastage_logo.png" 
          alt="TalaStage" 
          class="logo"
        />
      </div>
      
      <!-- Loading indicator -->
      <div class="loading-indicator">
        <div class="spinner"></div>
      </div>
      
      <!-- Optional loading text -->
      <p class="loading-text">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AppLoadingScreen Component
 * 
 * Displays a beautiful loading screen while the app initializes.
 * Inspired by Facebook's loading screen approach.
 * 
 * Features:
 * - Shows brand logo
 * - Smooth animations
 * - Matches app background color
 * - Prevents white flash on initial load
 */
</script>

<style scoped>
.app-loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgb(243, 244, 247);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.3s ease-out;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  animation: fadeIn 0.4s ease-in;
}

.logo-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: logoFloat 2s ease-in-out infinite;
}

.logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.loading-indicator {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .logo-container {
    width: 150px;
    height: 150px;
  }
  
  .loading-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .logo-container {
    width: 120px;
    height: 120px;
  }
  
  .loading-indicator {
    width: 40px;
    height: 40px;
  }
  
  .spinner {
    border-width: 3px;
  }
}
</style>
