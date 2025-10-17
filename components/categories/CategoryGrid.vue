<!-- components/category/CategoryGrid.vue -->
<template>
  <div class="category-grid">
    <!-- Grid Container -->
    <v-row>
      <v-col
        v-for="category in categories"
        :key="category.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="pa-2"
      >
        <CategoryCard
          :category="category"
          @click="$emit('select', category)"
          @error="$emit('error', $event)"
        />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-if="showEmpty" class="mt-8">
      <v-col cols="12" class="text-center">
        <v-icon
          size="64"
          color="grey-lighten-1"
          icon="mdi-folder-open-outline"
        />
        <h3 class="text-h6 mt-4 text-grey-darken-1">No Categories Found</h3>
        <p class="text-body-1 text-grey-darken-1">
          There are no categories available at the moment.
        </p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-if="error" class="mt-8">
      <v-col cols="12" class="text-center">
        <v-alert type="error" variant="tonal" class="mx-auto" max-width="500">
          {{ error }}
          <template v-slot:append>
            <v-btn color="error" variant="text" @click="$emit('retry')">
              Retry
            </v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TalentCategory } from '@/types/categories'

interface Props {
  categories: TalentCategory[]
  error?: string | null
  hasMore?: boolean
}

interface Emits {
  (e: 'select', category: TalentCategory): void
  (e: 'error', error: Error): void
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  error: null,
  hasMore: false,
})

defineEmits<Emits>()

const showEmpty = computed(() => !props.error && props.categories.length === 0)
</script>

<style scoped>
.category-grid {
  min-height: 400px;
}
</style>
