<template>
  <div class="grid-list-toggle">
    <v-btn-toggle
      :model-value="modelValue"
      @update:model-value="handleToggle"
      mandatory
      variant="outlined"
      divided
      density="compact"
      class="toggle-group"
    >
      <v-btn
        value="grid"
        :variant="modelValue === 'grid' ? 'flat' : 'outlined'"
        :color="modelValue === 'grid' ? 'primary' : 'default'"
        size="small"
        class="toggle-btn"
      >
        <v-icon>mdi-view-grid-outline</v-icon>
        <span class="btn-text">Grid</span>
      </v-btn>

      <v-btn
        value="list"
        :variant="modelValue === 'list' ? 'flat' : 'outlined'"
        :color="modelValue === 'list' ? 'primary' : 'default'"
        size="small"
        class="toggle-btn"
      >
        <v-icon>mdi-view-list-outline</v-icon>
        <span class="btn-text">List</span>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: 'grid' | 'list'
}

interface Emits {
  (e: 'update:modelValue', value: 'grid' | 'list'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleToggle = (value: 'grid' | 'list') => {
  if (value && value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.grid-list-toggle {
  display: inline-flex;
  align-items: center;
}

.toggle-group {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-btn {
  min-width: 80px !important;
  height: 36px !important;
  border-radius: 0 !important;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.toggle-btn:first-child {
  border-top-left-radius: 8px !important;
  border-bottom-left-radius: 8px !important;
}

.toggle-btn:last-child {
  border-top-right-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
}

.toggle-btn .v-icon {
  margin-right: 6px;
  font-size: 18px;
}

.btn-text {
  font-size: 0.875rem;
  text-transform: none;
}

/* Responsive behavior */
@media (max-width: 600px) {
  .toggle-btn {
    min-width: 60px !important;
  }

  .btn-text {
    display: none;
  }

  .toggle-btn .v-icon {
    margin-right: 0;
  }
}

/* Dark theme support */
.v-theme--dark .toggle-group {
  box-shadow: 0 1px 3px rgba(255, 255, 255, 0.1);
}

/* Hover effects */
.toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.v-theme--dark .toggle-btn:hover {
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.15);
}
</style>
