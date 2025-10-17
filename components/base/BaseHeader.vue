<!-- components/base/BaseHeader.vue -->
<template>
  <header
    :class="['base-header', { 'text-center': centered }]"
    :style="{ marginBottom: marginBottom }"
    v-bind="$attrs"
  >
    <!-- Icon (optional) -->
    <v-icon
      v-if="icon"
      :icon="icon"
      :color="iconColor"
      :size="iconSize"
      class="header-icon mb-3"
    />
    <!-- Header Content: Title and Actionable Slot -->
    <div class="header-content">
      <h1
        :class="[
          titleClass || 'text-h3',
          'font-weight-bold',
          { 'mb-1': subtitle || $slots.subtitle }, // Reduced from mb-3 to mb-1
          { 'gradient-text': gradient },
        ]"
      >
        <slot name="title">{{ title }}</slot>
      </h1>
      <!-- Actionable Slot -->
      <div v-if="$slots.actionable" class="actionable-content">
        <slot name="actionable" />
      </div>
    </div>
    <!-- Subtitle -->
    <p
      v-if="subtitle || $slots.subtitle"
      :class="[
        subtitleClass || 'text-h6',
        'text-medium-emphasis',
        { 'mx-auto': centered },
      ]"
      :style="[
        centered && maxWidth ? `max-width: ${maxWidth}px` : '',
        subtitleStyle,
      ]"
    >
      <slot name="subtitle">{{ subtitle }}</slot>
    </p>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  centered?: boolean
  maxWidth?: number
  gradient?: boolean
  icon?: string
  iconColor?: string
  iconSize?: number | string
  titleClass?: string
  subtitleClass?: string
  subtitleStyle?: object
  marginBottom?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  centered: false,
  maxWidth: 720,
  gradient: false,
  iconSize: 48,
  iconColor: 'primary',
  subtitleStyle: () => ({}),
  marginBottom: 'var(--header-margin-bottom, 2rem)', // Using CSS variable with fallback
})
</script>

<style scoped lang="scss">
.base-header {
  margin-top: var(--header-margin-top, 1rem);
}

.header-icon {
  opacity: 0.9;
}

.gradient-text {
  background: linear-gradient(
    45deg,
    var(--v-primary-base),
    var(--v-secondary-base)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 0.25rem; // Reduced from 0.75rem to 0.25rem
}

.actionable-content {
  margin-top: 0.5rem;
}

@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0.125rem; // Reduced mobile margin as well
  }

  .actionable-content {
    margin-top: 1rem;
    width: 100%;
    display: flex;
    justify-content: flex-start;
  }
}
</style>
