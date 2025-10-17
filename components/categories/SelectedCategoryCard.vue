<template>
  <v-card
    :class="['selected-category-card', `selected-category-card--${layout}`]"
    :elevation="elevation"
    :style="cardStyle"
  >
    <v-card-text class="d-flex align-center justify-center">
      <h2 :class="titleClass">{{ category.name }}</h2>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
  layout: {
    type: String,
    default: 'standard',
    validator: (value: string) => ['standard', 'compact'].includes(value),
  },
  elevation: {
    type: Number,
    default: 2,
  },
});

const titleClass = computed(() => ({
  'text-h4': props.layout === 'standard',
  'text-h5': props.layout === 'compact',
  'text-center': true,
  'font-weight-bold': true,
}));

const cardStyle = computed(() => ({
  width: '100%',
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
}));
</script>

<style scoped>
.selected-category-card {
  overflow: hidden;
  border-radius: 8px;
}

.selected-category-card:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23) !important;
}

.selected-category-card--compact {
  height: 72px;
}

.selected-category-card--standard {
  height: 96px;
}
</style>