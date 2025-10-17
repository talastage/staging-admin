<!-- components/premieres/PremiereCard.vue -->
<template>
  <v-card class="h-100 premiere-card">
    <v-img
      :src="premiere.thumbnail_url"
      :aspect-ratio="16 / 9"
      cover
      class="bg-grey-lighten-2"
    >
      <template #placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular
            indeterminate
            color="grey-lighten-5"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>

    <v-card-title class="text-truncate">
      {{ premiere.name }}
    </v-card-title>

    <v-card-subtitle>
      <div class="d-flex align-center">
        <v-avatar size="24" class="mr-2">
          <v-img
            :src="premiere.creator?.profile_photo"
            :alt="premiere.creator?.display_name"
          >
            <template #placeholder>
              <v-icon>mdi-account</v-icon>
            </template>
          </v-img>
        </v-avatar>
        <span class="text-truncate">{{ premiere.creator?.display_name }}</span>
      </div>
    </v-card-subtitle>

    <v-card-text>
      <div class="mb-2">
        <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
        {{ formatDate(premiere.premiere_start_date) }}
      </div>
      <div class="d-flex align-center">
        <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
        {{ formatTime(premiere.premiere_start_date) }}
      </div>
    </v-card-text>

    <v-card-actions>
      <BaseButton
        :title="hasReminder(premiere.id) ? 'Remove Reminder' : 'Remind Me'"
        :action="() => $emit('reminder-toggle', premiere)"
        :loading="reminderLoading === premiere.id"
        :color="hasReminder(premiere.id) ? 'error' : 'primary'"
        :prependIcon="hasReminder(premiere.id) ? 'mdi-bell-off' : 'mdi-bell'"
        fullWidth
      />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

defineProps({
  premiere: {
    type: Object,
    required: true,
  },
  reminderLoading: {
    type: Number,
    default: null,
  },
  hasReminder: {
    type: Function,
    required: true,
  },
})

defineEmits(['reminder-toggle'])

const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const formatTime = (date: string): string => {
  return format(new Date(date), 'h:mm a')
}
</script>

<style scoped>
.premiere-card {
  transition: transform 0.2s ease-in-out;
}

.premiere-card:hover {
  transform: translateY(-4px);
}
</style>
