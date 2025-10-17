<template>
  <BaseCard
    class="help-category-card h-100"
    :elevation="10"
    :loading="isLoading"
    @click="handleClick"
  >
    <v-img
      v-if="category.cover_url"
      :src="category.cover_url"
      height="120"
      cover
      class="bg-grey-lighten-2"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-icon size="48" color="grey">mdi-bookshelf</v-icon>
        </div>
      </template>
    </v-img>
    <div class="card-content">
      <div class="d-flex align-center category-title">
        <v-avatar v-if="category.avatar_url" size="32" class="me-3">
          <v-img :src="category.avatar_url" />
        </v-avatar>
        <v-icon v-else size="24" color="primary" class="me-3">
          mdi-folder-outline
        </v-icon>
        <h3 class="text-h6">{{ category.name }}</h3>
      </div>
      <p v-if="category.description" class="description text-grey mt-2">
        {{ category.description }}
      </p>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { HelpCategory } from '~/types/help'

const props = defineProps<{
  category: HelpCategory
  isLoading: boolean
}>()

const emit = defineEmits<{
  'select-category': [category: HelpCategory]
}>()

const handleClick = () => {
  emit('select-category', props.category)
}
</script>

<style scoped>
.help-category-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.help-category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.card-content {
  padding: 8px; /* Additional padding to account for BaseCard's v-card-item padding */
}

.category-title {
  margin-bottom: 4px;
}

.description {
  margin: 0;
}
</style>
