<!-- TalentCategoryList.vue -->
<template>
  <div class="talent-categories">
    <v-list v-if="displayCategories.length" class="categories-list pa-0">
      <v-list-item
        v-for="category in displayCategories"
        :key="category.id"
        class="category-list-item"
      >
        <CategoryCardCompact :category="category" size="large" :clickable="false" :show-description="true">
        </CategoryCardCompact>
      </v-list-item>
    </v-list>

    <v-row v-else-if="loading">
      <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="list-item-avatar-two-line" />
      </v-col>
    </v-row>

    <v-row v-else justify="center" class="mt-4">
      <v-col cols="12" class="text-center">
        <p class="text-body-1">No categories found.</p>
      </v-col>
    </v-row>

    <div v-if="hasMore && !initialLoad" ref="infiniteScrollTarget" class="scroll-target" />

    <v-row
      v-if="loading && displayCategories.length && !initialLoad"
      justify="center"
      class="mt-4"
    >
      <v-col cols="12" class="text-center">
        <v-progress-circular color="primary" indeterminate />
      </v-col>
    </v-row>

    <v-row v-if="!hasMore && displayCategories.length" justify="center" class="mt-4">
      <v-col cols="12" class="text-center">
        <p class="text-body-1">No more categories to load.</p>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  categories: any[];
  hasMore: boolean;
  isLoading: boolean;
}>(), {
  categories: () => [],
  hasMore: false,
  isLoading: false,
});

const emit = defineEmits<{
  (e: "loadMore"): void;
}>();

const initialLoad = ref(true);
const isScrolling = ref(false);
const displayCategories = computed(() => props.categories);
const loading = computed(() => props.isLoading);
const hasMore = computed(() => props.hasMore);
const infiniteScrollTarget = ref<HTMLElement | null>(null);

useInfiniteScroll(
  infiniteScrollTarget,
  async () => {
    if (!loading.value && hasMore.value && !isScrolling.value && !initialLoad.value) {
      isScrolling.value = true;
      emit("loadMore");
      setTimeout(() => {
        isScrolling.value = false;
      }, 500);
    }
  },
  {
    distance: 10,
    throttle: 500,
  }
);

onMounted(() => {
  setTimeout(() => {
    initialLoad.value = false;
  }, 1000);
});
</script>

<style scoped>
.talent-categories {
  width: 100%;
  margin: 0 auto;
}
.categories-list {
  background: transparent !important;
  width: 100%;
}
.category-list-item {
  padding: 0;
  margin-bottom: 12px;
}
.category-list-item:last-child {
  margin-bottom: 0;
}
.category-list-item::before {
  display: none;
}
.scroll-target {
  width: 100%;
  height: 10px;
  visibility: hidden;
}
</style>
