<template>
  <v-container fluid>
    <BaseCard>
      <!-- Header Section -->
      <template v-if="isLoadingInitial">
        <v-skeleton-loader type="card" height="80" class="mb-4" />
      </template>
      <template v-else-if="error">
        <v-alert type="error" density="compact" class="mb-4">
          {{ error }}
        </v-alert>
      </template>
      <template v-else>
        <div class="talent-header text-center mb-6">
          <h2 class="text-h3 font-weight-bold mb-2">Select Your Talent</h2>
          <div class="description mx-auto" style="max-width: 500px">
            <p class="text-subtitle-2 text-medium-emphasis">
              Showcase your creative expertise and join our community
            </p>
          </div>
        </div>
      </template>

      <!-- Search Section -->
      <div class="search-section mb-4">
        <v-form @submit.prevent="handleSearch">
          <v-text-field
            v-model="searchTerm"
            placeholder="Search categories..."
            prepend-inner-icon="mdi-magnify"
            append-inner-icon="mdi-arrow-right"
            density="compact"
            variant="outlined"
            hide-details
            class="search-field"
            bg-color="grey-lighten-4"
            @click:append-inner="handleSearch"
            @keyup.enter="handleSearch"
          />
        </v-form>
      </div>

      <!-- Content Section -->
      <div class="content-section custom-scrollbar">
        <template
          v-if="!isLoadingInitial && categories.length === 0 && !isLoading"
        >
          <EmptyStateCard
            title="No Categories Found"
            message="No categories match your criteria at the moment. Try a different search!"
          />
        </template>

        <template v-else>
          <!-- Categories List -->
          <v-list v-if="categories.length" class="categories-list pa-0">
            <v-list-item
              v-for="category in categories"
              :key="category.id"
              class="category-list-item"
            >
              <v-card elevation="2" class="category-card">
                <CategoryCardCompact
                  :category="category"
                  size="small"
                  :clickable="false"
                  :show-description="true"
                  :selected="selectedCategories.has(category.id)"
                >
                  <template #action="{ category }">
                    <v-btn
                      :color="
                        selectedCategories.has(category.id)
                          ? 'success'
                          : 'primary'
                      "
                      :variant="
                        selectedCategories.has(category.id) ? 'tonal' : 'flat'
                      "
                      :prepend-icon="
                        selectedCategories.has(category.id)
                          ? 'mdi-check'
                          : 'mdi-plus'
                      "
                      :height="36"
                      @click="handleCategorySelect(category)"
                    >
                      {{
                        selectedCategories.has(category.id)
                          ? 'Selected'
                          : 'Register'
                      }}
                    </v-btn>
                  </template>
                </CategoryCardCompact>
              </v-card>
            </v-list-item>
          </v-list>

          <!-- Loading States -->
          <v-list v-else-if="isLoading && categories.length === 0" class="pa-0">
            <v-list-item v-for="n in 4" :key="n" class="mb-4">
              <v-card elevation="2" class="pa-4">
                <div class="skeleton-content">
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line"></div>
                </div>
              </v-card>
            </v-list-item>
          </v-list>

          <!-- Bottom States -->
          <div v-if="isLoading && categories.length" class="text-center py-4">
            <v-progress-circular color="primary" indeterminate size="24" />
          </div>

          <div
            v-if="!isLoading && !hasMore && categories.length"
            class="text-center py-4"
          >
            <p class="text-body-2 text-medium-emphasis">
              No more categories to load
            </p>
          </div>
        </template>

        <!-- Report Missing Talent -->
        <v-divider class="my-4"></v-divider>
        <div class="text-center">
          <ReportMissingTalentDialog />
        </div>
      </div>

      <!-- Talent Selection Dialog -->
      <TalentSelectCategoryDialog
        v-model="dialogVisible"
        :selected-category="selectedCategory"
        @talent-registered="onTalentRegistered"
      />
    </BaseCard>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { TalentCategory } from '@/types/categories'

const router = useRouter()
const store = useTalentCategoryStore()

// State
const searchTerm = ref('')
const isLoadingInitial = ref(true)
const selectedCategory = ref<TalentCategory | null>(null)
const selectedCategories = ref<Set<number>>(new Set())
const dialogVisible = ref(false)

// Infinite Scroll Integration
const {
  items: categories,
  isLoading,
  error,
  hasMore,
  reset: resetScroll,
} = useInfiniteScroll<TalentCategory>(
  async (page) => {
    const result = await store.fetchCategories(page, page === 1)
    return result
  },
  {
    threshold: 200,
    throttle: 300,
    initialLoadDelay: 0,
  }
)

// Methods
const handleSearch = () => {
  if (searchTerm.value.trim() === store.searchTerm) return
  store.setSearchTerm(searchTerm.value.trim())
  resetScroll()
}

const handleCategorySelect = (category: TalentCategory) => {
  selectedCategory.value = category
  dialogVisible.value = true
}

// Modify onTalentRegistered to only update the selected categories
const onTalentRegistered = () => {
  if (selectedCategory.value) {
    selectedCategories.value.add(selectedCategory.value.id)
  }
}

// Watchers
watch(
  () => store.searchTerm,
  (newTerm) => {
    if (newTerm !== searchTerm.value) {
      searchTerm.value = newTerm
    }
  }
)

// Lifecycle
onMounted(() => {
  isLoadingInitial.value = false
})
</script>

<style lang="scss" scoped>
.content-wrapper {
  max-width: 768px;
  margin: 0 auto;
}

.talent-header {
  .text-h3 {
    color: rgb(var(--v-theme-primary));
    letter-spacing: -0.3px;
    line-height: 1.2;
  }
}

.search-section {
  padding: 0 12px;
  .search-field {
    :deep(.v-field) {
      border-radius: 12px;
      background-color: white !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.2s ease;

      &:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      }
    }
  }
}

.content-section {
  height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 0 12px;
}

.categories-list {
  background: transparent !important;
}

.category-list-item {
  padding: 0;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    display: none;
  }

  .category-card {
    width: 100%;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.skeleton-content {
  .skeleton-line {
    height: 10px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 8px;
    animation: pulse 1.5s infinite;

    &:nth-child(1) {
      width: 60%;
    }
    &:nth-child(2) {
      width: 80%;
    }
    &:nth-child(3) {
      width: 40%;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #bbb #f5f5f5;

  &::-webkit-scrollbar {
    width: 4px;
    &-track {
      background: #f5f5f5;
    }
    &-thumb {
      background: #bbb;
      border-radius: 2px;
    }
  }
}

@media (max-width: 600px) {
  .content-wrapper {
    padding: 0;
  }

  .search-section,
  .content-section {
    padding: 0 8px;
  }

  .talent-header {
    .text-h3 {
      font-size: 1.75rem;
    }
  }
}
</style>
