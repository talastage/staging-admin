<template>
  <v-container>
    <h2 class="text-h5 font-weight-bold mb-4">Top Talent Categories</h2>

    <!-- Swiper slider for top talent categories -->
    <Swiper
      :slides-per-view="5"
      :space-between="20"
      :navigation="true"
      :pagination="false"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      class="swiper-container"
    >
      <!-- Swiper slides for each top category -->
      <SwiperSlide v-for="category in topCategories" :key="category.id">
        <v-card class="mx-2">
          <v-img :src="category.avatar_url" height="150px"></v-img>
          <v-card-title class="text-center">{{ category.name }}</v-card-title>
        </v-card>
      </SwiperSlide>
    </Swiper>

    <!-- Loading state -->
    <v-skeleton-loader v-if="loading" type="list-item"></v-skeleton-loader>

    <!-- Error message -->
    <v-alert v-if="error" type="error">
      Failed to load top categories.
    </v-alert>

    <!-- No categories message -->
    <p v-if="!loading && !topCategories.length">No categories available.</p>
  </v-container>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from "vue";
import { SwiperSlide } from "nuxt-swiper"; // SwiperSlide import
import { useTalentCategoryStore } from "@/stores/useTalentCategories"; // Adjust the path as necessary

// Dynamically import Swiper using defineAsyncComponent
const AsyncSwiper = defineAsyncComponent(() =>
  import("nuxt-swiper").then((module) => module.Swiper)
);

// State for loading and error
const loading = ref(false);
const error = (ref < string) | (null > null);

// Fetch the top categories from the store
const talentCategoryStore = useTalentCategoryStore();
const { topCategories } = talentCategoryStore;

const fetchTopCategories = async () => {
  loading.value = true;
  try {
    await talentCategoryStore.fetchTopCategories();
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Error fetching categories";
  } finally {
    loading.value = false;
  }
};

// Fetch top categories when the component is mounted
onMounted(() => {
  fetchTopCategories();
});
</script>

<style scoped>
.swiper-container {
  margin-top: 20px;
}

/* Custom styles for Swiper arrows */
.swiper-button-next,
.swiper-button-prev {
  width: 30px;
  height: 30px;
}

.swiper-button-next::after,
.swiper-button-prev::after {
  font-size: 20px;
}
</style>
