<template>
  <div class="talent-categories">
    <CategoryCard
      v-for="category in categories"
      :key="category.id"
      :name="category.name"
      :coverUrl="category.cover_url"
    />
  </div>
</template>

<script setup>
import { useTalentCategoryStore } from "@/stores/useTalentCategories";

const store = useTalentCategoryStore();
await store.fetchCategories();

const categories = store.categories;
</script>

<style scoped>
.talent-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}
</style>
