<template>
  <BaseCard class="category-header py-2 px-4">
    <div class="d-flex align-center justify-space-between">
      <!-- Left side: Category info -->
      <div class="d-flex align-center">
        <div class="category-info">
          <h2
            :class="[
              titleClass || 'text-h3',
              'font-weight-bold',
              { 'gradient-text': gradient },
            ]"
          >
            {{ category?.name }}
          </h2>
          <p
            v-if="category?.description"
            class="text-subtitle-1 text-medium-emphasis mb-0 mt-1"
          >
            {{ category.description }}
          </p>
        </div>
      </div>

      <!-- Right side: Actions -->
      <div
        v-if="$slots.actions"
        class="category-actions d-flex align-center gap-2"
      >
        <slot name="actions" />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
interface Category {
  id: number
  name: string
  slug: string
  description?: string
  avatar_url?: string
}

interface Props {
  category: Category
  gradient?: boolean
  titleClass?: string
}

withDefaults(defineProps<Props>(), {
  gradient: false,
  titleClass: 'text-h3',
})
</script>

<style scoped>
.category-header {
  position: relative;
  overflow: hidden;
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

.category-actions :deep(.v-btn) {
  margin-left: 8px;
}

.category-info {
  min-width: 0;
  flex: 1;
}

.category-info h2 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .category-info :deep(.text-h3) {
    font-size: 2rem !important;
    line-height: 1.2 !important;
  }

  .category-info :deep(.text-subtitle-1) {
    font-size: 1rem !important;
    line-height: 1.5 !important;
  }
}
</style>
