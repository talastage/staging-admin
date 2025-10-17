<template>
  <BaseHeader title="Top Categories">
    <template #actionable>
      <NuxtLink to="/talent/categories">
        <v-btn variant="text" color="primary">View All</v-btn>
      </NuxtLink>
    </template>
  </BaseHeader>

  <v-card-text v-if="loading" class="pa-0">
    <v-skeleton-loader v-for="n in 5" :key="n" type="card" class="mb-4" />
  </v-card-text>

  <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

  <v-card-text v-if="topCategories.length" class="pa-0">
    <v-row>
      <v-col
        v-for="category in topCategories"
        :key="category.id"
        cols="12"
        class="py-2"
      >
        <CategoryCard
          :category="category"
          size="medium"
          @click="goToCategory"
        />
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import type { TalentCategory } from '@/types/categories'

const store = useTalentCategoryStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    await store.fetchTopCategories()
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to load top categories'
  } finally {
    loading.value = false
  }
})

const goToCategory = (category: TalentCategory) => {
  router.push(`/talents/${category.slug}`)
}

const { topCategories } = store
</script>
