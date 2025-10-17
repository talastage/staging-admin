<template>
  <BaseCard class="category-header" variant="flat">
    <div class="header-content">
      <div class="d-flex align-center">
        <!-- Avatar Section -->
        <div v-if="category?.avatar_url" class="mr-4">
          <v-avatar size="64" :image="category.avatar_url">
            <v-icon
              v-if="!category.avatar_url"
              size="32"
              color="grey-lighten-1"
            >
              mdi-folder-outline
            </v-icon>
          </v-avatar>
        </div>

        <!-- Content Section -->
        <div class="category-content">
          <h1 class="text-h4 font-weight-bold mb-2">
            {{ category?.name || 'Loading...' }}
          </h1>
          <p
            v-if="category?.description"
            class="text-subtitle-1 text-medium-emphasis"
          >
            {{ category.description }}
          </p>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
interface Category {
  id?: number
  name?: string
  slug?: string
  description?: string
  avatar_url?: string
  cover_url?: string
}

defineProps<{
  category?: Category
}>()
</script>

<style scoped>
.category-header {
  position: relative;
  overflow: hidden;
  background-color: var(--v-theme-surface);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.category-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  opacity: 0.8;
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
}

.category-content {
  flex: 1;
  min-width: 0;
}

.text-h4 {
  color: var(--v-theme-on-surface);
}

.text-subtitle-1 {
  color: var(--v-theme-on-surface-variant);
  max-width: 600px;
}

/* Alternative background patterns - uncomment one to use */
/* Pattern 1 */
/*
.category-header::before {
  background: linear-gradient(45deg, #2196F3 0%, #4CAF50 100%);
  opacity: 0.1;
}
*/

/* Pattern 2 */
/*
.category-header::before {
  background: 
    radial-gradient(circle at 100% 100%, #ffffff 0, #ffffff 3px, transparent 3px) 0 0,
    radial-gradient(circle at 0 100%, #ffffff 0, #ffffff 3px, transparent 3px) 6px 0,
    radial-gradient(circle at 100% 0, #ffffff 0, #ffffff 3px, transparent 3px) 0 6px,
    radial-gradient(circle at 0 0, #ffffff 0, #ffffff 3px, transparent 3px) 6px 6px;
  background-size: 6px 6px;
  background-color: #f5f7fa;
  opacity: 0.2;
}
*/

/* Pattern 3 */
/*
.category-header::before {
  background: 
    linear-gradient(135deg, transparent 0%, transparent 49%, #ffffff 49%, #ffffff 51%, transparent 51%, transparent 100%);
  background-size: 20px 20px;
  opacity: 0.1;
}
*/

/* Responsive adjustments */
@media (max-width: 600px) {
  .header-content {
    padding: 1.5rem;
  }

  .d-flex {
    flex-direction: column;
    align-items: flex-start;
  }

  .mr-4 {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }
}

/* Dark theme adjustments */
:deep(.v-theme--dark) .category-header::before {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  opacity: 0.2;
}

:deep(.v-theme--dark) .text-h4 {
  color: var(--v-theme-on-surface);
}

:deep(.v-theme--dark) .text-subtitle-1 {
  color: var(--v-theme-on-surface-variant);
}
</style>
