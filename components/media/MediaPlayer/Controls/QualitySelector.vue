<template>
  <div class="quality-selector">
    <button
      class="quality-button"
      @click.stop="toggleMenu"
      :aria-label="'Current quality: ' + current"
    >
      <svg viewBox="0 0 24 24" class="settings-icon">
        <path
          fill="currentColor"
          d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
        />
      </svg>
      <span class="quality-label">{{ current }}</span>
    </button>

    <!-- Desktop Menu -->
    <div v-if="showMenu && !isMobile" class="quality-menu" @mouseleave="showMenu = false">
      <div class="quality-menu-header">Video Quality</div>
      <button
        v-for="quality in qualities"
        :key="quality"
        class="quality-option"
        :class="{ active: quality === current }"
        @click.stop="selectQuality(quality)"
      >
        <span class="quality-name">{{ quality }}</span>
        <svg v-if="quality === current" viewBox="0 0 24 24" class="check-icon">
          <path
            fill="currentColor"
            d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"
          />
        </svg>
      </button>
      <div class="quality-menu-footer">Auto-select based on connection</div>
    </div>

    <!-- Mobile Bottom Sheet -->
    <v-bottom-sheet v-model="showMenu" v-if="isMobile">
      <v-card class="mobile-quality-sheet">
        <v-card-title class="text-center py-4">
          Video Quality
        </v-card-title>
        <v-divider />
        <v-list>
          <v-list-item
            v-for="quality in qualities"
            :key="quality"
            @click="selectQuality(quality)"
            :class="{ 'v-list-item--active': quality === current }"
          >
            <v-list-item-title>{{ quality }}</v-list-item-title>
            <template #append v-if="quality === current">
              <v-icon color="primary">mdi-check</v-icon>
            </template>
          </v-list-item>
        </v-list>
        <v-card-text class="text-center text-caption text-medium-emphasis py-3">
          Auto-select based on connection
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'

defineProps({
  qualities: Array<string>,
  current: String,
})

const emit = defineEmits(['change'])
const { mobile } = useDisplay()

const showMenu = ref(false)
const isMobile = computed(() => mobile.value)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const selectQuality = (quality: string) => {
  emit('change', quality)
  showMenu.value = false
}
</script>

<style scoped>
.quality-selector {
  position: relative;
  margin-left: auto;
}

.quality-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 6px 10px;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s, transform 0.1s;
}

.quality-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.quality-button:active {
  transform: scale(0.95);
}

.settings-icon {
  width: 18px;
  height: 18px;
}

.quality-label {
  font-weight: 500;
}

.quality-menu {
  position: absolute;
  top: auto;
  bottom: 100%;
  right: 0;
  background: rgba(28, 28, 28, 0.95);
  border-radius: 8px;
  padding: 0;
  margin-bottom: 12px;
  min-width: 180px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  overflow: hidden;
  transform: translateY(0);
}

.mobile-quality-sheet {
  border-radius: 16px 16px 0 0;
}

.quality-menu-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.quality-menu-footer {
  padding: 10px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.quality-option {
  display: flex;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  justify-content: space-between;
  align-items: center;
}

.quality-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.quality-option.active {
  background: rgba(255, 255, 255, 0.15);
  font-weight: 500;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #3ea6ff;
}

@media (max-width: 768px) {
  .quality-label {
    display: none;
  }
  
  .quality-button {
    padding: 6px;
  }
}
</style>