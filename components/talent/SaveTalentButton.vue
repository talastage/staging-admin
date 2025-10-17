<!-- components/SaveTalentButton.vue -->
<template>
  <div>
    <v-btn
      :color="isSaved ? 'black' : 'grey-lighten-4'"
      variant="flat"
      rounded="pill"
      class="save-button"
      :class="{ 'saved-state': isSaved }"
      @click="handleClick"
      :loading="isLoading"
      :disabled="isLoading"
    >
      <v-icon
        :icon="isSaved ? 'mdi-check' : 'mdi-bookmark-outline'"
        size="small"
        :class="{ 'text-white': isSaved }"
        class="mr-1"
      />
      <span :class="{ 'text-white': isSaved }">
        {{ isSaved ? 'Saved' : 'Save' }}
      </span>
    </v-btn>

    <SaveTalentDialog
      v-if="dialogVisible"
      v-model="dialogVisible"
      :username="username"
      @saved="handleSaved"
      @update:modelValue="dialogVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'

const props = defineProps<{
  username: string
  initialSavedState: boolean
}>()

const emit = defineEmits<{
  (e: 'saveUpdated', isSaved: boolean): void
}>()

const nuxtApp = useNuxtApp()
const dialogVisible = ref(false)
const isSaved = ref(props.initialSavedState)
const isLoading = ref(false)

const handleClick = () => {
  nuxtApp.$protectedAction(
    async () => {
      // Show the SaveTalentDialog
      dialogVisible.value = true
    },
    {
      requiresAuth: true,
    }
  )
}

const handleSaved = () => {
  isSaved.value = true
  emit('saveUpdated', true)
}
</script>

<style scoped>
.save-button {
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  height: 36px !important;
  min-width: 90px !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  transition: all 0.2s ease-in-out !important;
}

/* Unsaved state hover */
.save-button:not(.saved-state):hover {
  background-color: #f0f0f0 !important;
  opacity: 0.95;
}

/* Saved state (black) */
.save-button.saved-state {
  background-color: black !important;
  border-color: black !important;
}

/* Saved state hover */
.save-button.saved-state:hover {
  background-color: #333 !important;
}

/* Ensure text stays white in saved state */
.save-button.saved-state .text-white {
  color: white !important;
}

/* Loading state */
.save-button:disabled {
  opacity: 0.7;
}
</style>
