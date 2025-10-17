<!-- components/common/TimezoneBadge.vue -->
<template>
  <div class="timezone-badge">
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-icon
          v-bind="props"
          icon="mdi-clock-outline"
          size="small"
          color="medium-emphasis"
        />
      </template>
      {{ getCurrentTime(timezone) }}
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { useFormatting } from '@/composables/useFormatting'

defineProps<{
  timezone: string
}>()

const { getCurrentTime } = useFormatting()
</script>

<style scoped>
.timezone-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}
</style>
