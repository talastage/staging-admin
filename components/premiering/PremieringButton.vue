<template>
  <NuxtLink to="/premiering" class="button-link">
    <v-btn density="comfortable" class="record-btn" variant="flat">
      <div class="icon-wrapper">
        <v-icon size="14" color="white"> mdi-video </v-icon>
      </div>
      <span class="button-text">Start Premiering</span>
    </v-btn>
  </NuxtLink>
</template>

<script setup>
import { useDisplay } from 'vuetify'

// Responsive display
const { smAndDown } = useDisplay()
</script>

<style scoped>
.button-link {
  text-decoration: none;
}

.record-btn {
  background-color: #1d1d1d !important;
  text-transform: none;
  padding: 0 16px 0 4px !important;
  height: 32px !important;
  min-height: 0 !important;
  border-radius: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  transition: all 0.2s ease;
}

.icon-wrapper {
  background: linear-gradient(45deg, #e238ff, #7f41ff);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(226, 56, 255, 0.2);
  margin-right: 10px;
}

.button-text {
  font-size: 13px;
  font-weight: 500;
  color: white;
  letter-spacing: 0.25px;
}

/* Responsive styles */
@media (max-width: 599px) {
  .record-btn {
    padding: 0 8px !important;
    width: 36px !important;
    justify-content: center !important;
  }
  
  .icon-wrapper {
    margin-right: 0;
  }
  
  .button-text {
    display: none;
  }
}
</style>