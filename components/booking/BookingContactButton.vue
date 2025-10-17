<template>
  <div>
    <!-- Contact Button -->
    <v-btn
      v-if="size === 'small'"
      icon="mdi-phone-plus"
      color="primary"
      @click="dialog = true"
      :loading="loading"
      size="small"
      variant="outlined"
    />
    <v-btn
      v-else
      color="primary"
      @click="dialog = true"
      prepend-icon="mdi-phone-plus"
      :loading="loading"
      variant="elevated"
    >
      Booking
    </v-btn>

    <!-- Contact Dialog Component -->
    <BookingContactDialog
      v-model="dialog"
      :user="user"
      @close="handleDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props Interface
interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  display_name: string
  profile_photo: string
  email?: string
  phone?: string
  talent?: string
}

// Props
const props = defineProps<{
  user: User
  size?: string
}>()

// Set default size
const size = computed(() => props.size || 'default')

// State Management
const dialog = ref(false)
const loading = ref(false)

// Methods
const handleDialogClose = () => {
  dialog.value = false
}
</script>
