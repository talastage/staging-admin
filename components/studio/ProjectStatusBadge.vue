<template>
  <span
    class="status-badge"
    :class="[`status-${status.toLowerCase()}`, `size-${size}`]"
  >
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  status: {
    type: String,
    default: 'draft',
    validator: (value: string) =>
      ['draft', 'published'].includes(value.toLowerCase()),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value),
  },
  uppercase: {
    type: Boolean,
    default: true,
  },
})

const displayText = computed(() => {
  const text = props.status
  return props.uppercase ? text.toUpperCase() : text
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  padding: 0 8px;
}

.status-draft {
  background-color: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
}

.status-published {
  background-color: rgba(var(--v-theme-success), 0.12);
  color: rgb(var(--v-theme-success));
}

.size-sm {
  font-size: 0.75rem;
  padding: 2px 6px;
}

.size-md {
  font-size: 0.875rem;
  padding: 3px 8px;
}

.size-lg {
  font-size: 1rem;
  padding: 4px 10px;
}
</style>
