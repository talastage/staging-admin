<!-- components/support/SupportHelpTab.vue -->
<template>
  <div class="help-tab">
    <!-- Search Section -->
    <div class="px-4 pt-4 pb-2">
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search help articles..."
        variant="outlined"
        density="comfortable"
        hide-details
        class="mb-4"
        @update:model-value="searchArticles"
      ></v-text-field>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Search Results -->
    <div v-else-if="searchQuery && searchResults.length > 0" class="pa-4">
      <div class="text-subtitle-1 mb-3">Search Results</div>
      <v-list>
        <v-list-item
          v-for="article in searchResults"
          :key="article.id"
          :title="article.title"
          :subtitle="article.category_name"
          @click="viewArticle(article.category_slug, article.slug)"
        >
          <template v-slot:prepend>
            <v-icon color="primary">mdi-text-box-outline</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- Categories List -->
    <div v-else-if="!selectedCategory" class="categories-list pa-4">
      <v-list>
        <v-list-item
          v-for="category in categories"
          :key="category.id"
          :title="category.name"
          :subtitle="`${category.total_helps_count} articles`"
          @click="selectCategory(category)"
        >
          <template v-slot:prepend>
            <v-icon color="primary">mdi-folder-outline</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- Category Details -->
    <div v-else class="category-details">
      <!-- Category Header -->
      <div class="px-4 pt-2">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="mb-2"
          @click="selectedCategory = null"
        >
          Back to Categories
        </v-btn>
        <div class="text-h6 mb-1">{{ selectedCategory.name }}</div>
        <div class="text-body-2 text-grey">
          {{ selectedCategory.description }}
        </div>
      </div>

      <!-- Direct Articles -->
      <div v-if="categoryDetails.direct_helps?.length > 0" class="pa-4">
        <div class="text-subtitle-1 mb-2">Articles</div>
        <v-list>
          <v-list-item
            v-for="article in categoryDetails.direct_helps"
            :key="article.id"
            :title="article.title"
            @click="viewArticle(selectedCategory.slug, article.slug)"
          >
            <template v-slot:prepend>
              <v-icon size="small">mdi-text-box-outline</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <!-- Sub Categories -->
      <div
        v-for="subCategory in categoryDetails.sub_categories"
        :key="subCategory.id"
        class="pa-4"
      >
        <div class="text-subtitle-1 mb-2">{{ subCategory.name }}</div>
        <v-list>
          <v-list-item
            v-for="article in subCategory.helps"
            :key="article.id"
            :title="article.title"
            @click="viewArticle(selectedCategory.slug, article.slug)"
          >
            <template v-slot:prepend>
              <v-icon size="small">mdi-text-box-outline</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </div>

    <!-- Need More Help -->
    <v-divider></v-divider>
    <div class="pa-4">
      <div class="text-subtitle-1 font-weight-medium mb-2">Need more help?</div>
      <v-btn color="primary" variant="outlined" block @click="switchToMessages">
        Contact Support
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
const { $axios } = useNuxtApp();

const emit = defineEmits(["update:active-tab"]);

const loading = ref(false);
const searchQuery = ref("");
const searchResults = ref([]);
const categories = ref([]);
const selectedCategory = ref(null);
const categoryDetails = ref({
  direct_helps: [],
  sub_categories: [],
});

// Fetch categories
const fetchCategories = async () => {
  try {
    loading.value = true;
    const response = await $axios.get("/api/help/categories");
    categories.value = response.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  } finally {
    loading.value = false;
  }
};

// Select category and fetch its details
const selectCategory = async (category) => {
  try {
    loading.value = true;
    selectedCategory.value = category;
    const response = await $axios.get(`/api/help/categories/${category.slug}`);
    categoryDetails.value = response.data;
  } catch (error) {
    console.error("Error fetching category details:", error);
  } finally {
    loading.value = false;
  }
};

// Search articles
const searchArticles = async () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }

  try {
    loading.value = true;
    const response = await $axios.get("/api/help/articles/search", {
      params: { query: searchQuery.value },
    });
    searchResults.value = response.data.data;
  } catch (error) {
    console.error("Error searching articles:", error);
  } finally {
    loading.value = false;
  }
};

// View article (you might want to handle this differently depending on your needs)
const viewArticle = (categorySlug: string, articleSlug: string) => {
  window.open(`/help/${categorySlug}/${articleSlug}`, "_blank");
};

// Switch to messages tab
const switchToMessages = () => {
  emit("update:active-tab", "messages");
};

onMounted(fetchCategories);
</script>

<style scoped>
.help-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.categories-list,
.category-details {
  flex-grow: 1;
  overflow-y: auto;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
