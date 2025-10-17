<template>
  <nav class="help-breadcrumb">
    <ol class="breadcrumb-list">
      <li 
        v-for="(item, index) in items" 
        :key="index"
        class="breadcrumb-item"
        :class="{ 'is-current': index === items.length - 1 }"
      >
        <router-link 
          v-if="item.to && index !== items.length - 1"
          :to="item.to"
          class="breadcrumb-link"
        >
          {{ item.text }}
        </router-link>
        <span v-else class="breadcrumb-text">
          {{ item.text }}
        </span>
        <v-icon 
          v-if="index < items.length - 1"
          size="14"
          class="breadcrumb-separator"
        >
          mdi-chevron-right
        </v-icon>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  text: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<style scoped>
.help-breadcrumb {
  margin-bottom: 1rem;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.breadcrumb-link:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.breadcrumb-text {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.875rem;
  font-weight: 400;
}

.breadcrumb-item.is-current .breadcrumb-text {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
}

.breadcrumb-separator {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.6;
}

@media (max-width: 600px) {
  .breadcrumb-link,
  .breadcrumb-text {
    font-size: 0.8125rem;
  }
}
</style>