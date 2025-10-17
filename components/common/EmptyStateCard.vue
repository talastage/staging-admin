<template>
  <div class="empty-state">
    <v-icon :icon="icon" :size="iconSize" :color="iconColor" class="mb-4" />
    <h3 class="text-h5 mb-2">{{ title }}</h3>
    <p
      class="text-body-1 text-medium-emphasis mb-6 mx-auto"
      style="max-width: 500px"
    >
      {{ message }}
    </p>

    <!-- Action button if provided -->
    <v-btn
      v-if="actionText && onActionClick"
      color="primary"
      variant="outlined"
      @click="onActionClick"
    >
      {{ actionText }}
    </v-btn>

    <!-- Default slot for custom content -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  icon?: string
  iconSize?: number | string
  iconColor?: string
  actionText?: string
  onActionClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'No Results Found',
  message: "We couldn't find any results matching your criteria.",
  icon: 'mdi-alert-circle-outline',
  iconSize: 64,
  iconColor: 'grey-lighten-1',
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  background-color: rgba(var(--v-theme-surface-variant), 0.15);
  border-radius: 16px;
  margin: 1rem 0;
}
</style>
