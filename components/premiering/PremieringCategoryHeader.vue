<!-- components/PremieringCategoryHeader.vue -->
<template>
  <BaseCard class="category-header">
    <div class="d-flex align-center">
      <slot name="prepend">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          class="mr-4"
          @click="$router.back()"
        />
      </slot>
      <!-- <v-avatar
        v-if="category?.avatar_url"
        :image="category.avatar_url"
        size="48"
        class="mr-4"
      /> -->
      <h1 class="text-h4">{{ category?.name }}</h1>
      <slot name="append"></slot>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Category {
  id?: number
  name: string
  slug: string | null
  avatar_url: string | null
}

defineProps<{
  category?: Category
}>()

const $router = useRouter()
</script>

<style scoped>
.category-header {
  margin-bottom: 32px;
}
</style>
