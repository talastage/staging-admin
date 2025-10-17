<!-- ================================== -->
<!-- views/talents/TalentRegisterPage.vue -->
<template>
  <v-container fluid>
    <BaseCard>
      <!-- Loading State -->
      <v-skeleton-loader
        v-if="isLoadingInitial"
        type="card"
        height="80"
        class="mb-4"
      />

      <!-- Error State -->
      <v-alert v-else-if="error" type="error" density="compact" class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Main Content -->
      <template v-else>
        <!-- Header -->
        <div class="talent-header text-center mb-6">
          <h2 class="text-h3 font-weight-bold mb-2">Select Your Talent</h2>
          <p
            class="text-subtitle-2 text-medium-emphasis mx-auto"
            style="max-width: 500px"
          >
            Showcase your creative expertise and join our community
          </p>
        </div>

        <!-- Search -->
        <div class="search-section mb-4">
          <v-text-field
            v-model="searchTerm"
            placeholder="Search categories..."
            prepend-inner-icon="mdi-magnify"
            append-inner-icon="mdi-arrow-right"
            density="compact"
            variant="outlined"
            hide-details
            bg-color="grey-lighten-4"
            @click:append-inner="handleSearch"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Categories Content -->
        <div class="content-section">
          <!-- Empty State -->
          <EmptyStateCard
            v-if="!isLoadingInitial && !categories.length && !isLoading"
            title="No Categories Found"
            message="No categories match your criteria at the moment. Try a different search!"
          />

          <!-- Categories List -->
          <v-list v-else-if="categories.length" class="categories-list pa-0">
            <v-list-item
              v-for="category in categories"
              :key="category.id"
              class="category-item"
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
                      height="36"
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

          <!-- Loading Skeleton -->
          <v-list v-else-if="isLoading && !categories.length" class="pa-0">
            <v-list-item v-for="n in 4" :key="n" class="mb-4">
              <v-card elevation="2" class="pa-4">
                <div class="skeleton-content">
                  <div class="skeleton-line" />
                  <div class="skeleton-line" />
                  <div class="skeleton-line" />
                </div>
              </v-card>
            </v-list-item>
          </v-list>

          <!-- Load More States -->
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
        </div>

        <!-- Report Missing Talent -->
        <v-divider class="my-4" />
        <div class="text-center">
          <ReportMissingTalentDialog />
        </div>
      </template>

      <!-- Selection Dialog -->
      <TalentSelectCategoryDialog
        v-model="dialogVisible"
        :selected-category="selectedCategory"
        @talent-registered="onTalentRegistered"
      />
    </BaseCard>
  </v-container>
</template>

<script setup lang="ts">
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { TalentCategory } from '@/types/categories'

const store = useTalentCategoryStore()

// Reactive state
const searchTerm = ref('')
const isLoadingInitial = ref(true)
const selectedCategory = ref<TalentCategory | null>(null)
const selectedCategories = ref(new Set<number>())
const dialogVisible = ref(false)

// Infinite scroll hook
const {
  items: categories,
  isLoading,
  error,
  hasMore,
  reset: resetScroll,
} = useInfiniteScroll<TalentCategory>(
  async (page) => await store.fetchCategories(page, page === 1),
  { threshold: 200, throttle: 300, initialLoadDelay: 0 }
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

// Initialize
onMounted(() => {
  isLoadingInitial.value = false
})
</script>

<style lang="scss" scoped>
.talent-header .text-h3 {
  color: rgb(var(--v-theme-primary));
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.search-section {
  padding: 0 12px;

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

.content-section {
  height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 0 12px;
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

.categories-list {
  background: transparent !important;
}

.category-item {
  padding: 0;
  margin-bottom: 16px;

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

@media (max-width: 600px) {
  .search-section,
  .content-section {
    padding: 0 8px;
  }

  .talent-header .text-h3 {
    font-size: 1.75rem;
  }
}
</style>
