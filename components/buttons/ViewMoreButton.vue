<!-- components/ViewMoreButton.vue -->
<template>
  <NuxtLink :to="to" custom v-slot="{ navigate }">
    <BaseButton
      :title="title"
      :action="navigate"
      :variant="flat"
      :color="primary"
      :class="['view-more-button', styleVariant, customClass]"
      :append-icon="appendIcon || defaultIcon"
      :height="height"
      :disabled="disabled"
      :loading="loading"
    />
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  title: {
    type: String,
    default: "View All",
  },
  styleVariant: {
    type: String,
    default: "minimal",
  },
  variant: {
    type: String,
    default: "flat",
  },
  color: {
    type: String,
    default: "secondary",
  },
  height: {
    type: [Number, String],
    default: 32,
  },
  appendIcon: {
    type: String,
    default: "",
  },
  customClass: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const defaultIcon = computed(() => "mdi-chevron-right");
</script>

<style scoped>
.view-more-button {
  font-weight: 500 !important;
  min-width: 100px !important;
  transition: all 0.3s ease !important;
}

.view-more-button:hover {
  opacity: 0.9;
}

:deep(.v-btn__append) {
  transition: transform 0.3s ease;
  margin-left: 2px;
}

.view-more-button:hover :deep(.v-btn__append) {
  transform: translateX(4px);
}
</style>
