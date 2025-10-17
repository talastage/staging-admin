<!-- pages/help/[categorySlug]/[subCategorySlug]/index.vue -->
<template>
  <v-container class="help-subcategory-page py-8">
    <!-- Loading State -->
    <v-row v-if="isLoading && !articles.length">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate size="64" color="primary" />
        <p class="text-body-2 text-grey mt-4">Loading...</p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1" class="mb-4"
          >mdi-alert-circle-outline</v-icon
        >
        <h3 class="text-h6 text-grey-darken-1">Subcategory Not Found</h3>
        <p class="text-body-2 text-grey">
          The subcategory you are looking for does not exist or has been
          removed.
        </p>
        <v-btn
          color="primary"
          :to="parentCategory ? `/help/${parentCategory.slug}` : '/help'"
          prepend-icon="mdi-arrow-left"
        >
          Return to {{ parentCategory?.name || 'Help Center' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Content State -->
    <template v-else-if="subCategory">
      <!-- Subcategory Header -->
      <v-row>
        <v-col cols="12">
          <HelpCategoryHeader
            :category="subCategory"
            :parent-category="parentCategory"
          />
        </v-col>
      </v-row>

      <!-- Articles List with Loading Overlay -->
      <v-row v-if="articles.length > 0">
        <v-col cols="12" class="position-relative">
          <div v-if="isLoading" class="overlay-loading">
            <v-progress-circular indeterminate size="36" color="primary" />
          </div>
          <HelpItem
            v-for="article in articles"
            :key="article.id"
            :article="article"
            @select="handleArticleSelect"
            @sub-category-clicked="handleSubCategoryClick"
          />
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="pagination?.last_page > 1">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="pagination.last_page"
            :total-visible="7"
            @update:model-value="handlePageChange"
            :disabled="isLoading"
          />
        </v-col>
      </v-row>

      <!-- No Articles -->
      <v-row v-if="!isLoading && articles.length === 0">
        <v-col cols="12" class="text-center py-12">
          <v-icon size="64" color="primary" class="mb-4"
            >mdi-clock-outline</v-icon
          >
          <h3 class="text-h6 text-grey-darken-1">We're still adding content</h3>
          <p class="text-body-2 text-grey">
            Articles for this subcategory are coming soon. Check back later!
          </p>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, useHead } from '#app'
import { useSubCategoryArticlesStore } from '~/stores/help/subCategoryArticles'
import { PAGE_WIDTHS } from '@/constants/layouts'

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const store = useSubCategoryArticlesStore()

// Improved slug extraction with fallback
const getSlugs = () => {
  let categorySlug = route.params.categorySlug as string
  let subCategorySlug = route.params.subCategorySlug as string

  if (!categorySlug || !subCategorySlug) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean)
    if (pathSegments.length >= 3 && pathSegments[0] === 'help') {
      categorySlug = pathSegments[1]
      subCategorySlug = pathSegments[2]
    }
  }

  return { categorySlug, subCategorySlug }
}

// Computed properties
const isLoading = computed(() => store.isLoading)
const error = computed(() => store.error)
const subCategory = computed(() => store.subCategory)
const parentCategory = computed(() => store.parentCategory)
const articles = computed(() => store.articles)
const pagination = computed(() => store.pagination)
const currentPage = computed({
  get: () => store.currentPage,
  set: (val) => store.setCurrentPage(val),
})

// Data loading with error handling
const loadSubCategoryData = async () => {
  const { categorySlug, subCategorySlug } = getSlugs()
  if (!categorySlug || !subCategorySlug) {
    store.error = 'Invalid subcategory path'
    return
  }

  try {
    await store.loadSubCategoryData(categorySlug, subCategorySlug)
  } catch (error) {
    console.error('Failed to load subcategory:', error)
    store.error = 'Failed to load subcategory data'
  }
}

// Lifecycle hooks
onMounted(() => {
  loadSubCategoryData()
})

// Watchers
watch(
  () => route.fullPath,
  (newVal, oldVal) => {
    if (
      newVal !== oldVal &&
      route.name === 'help-category-slug-subCategorySlug'
    ) {
      loadSubCategoryData()
    }
  }
)

watch(
  () => store.currentPage,
  (newPage, oldPage) => {
    if (newPage !== oldPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)

// Event handlers
const handlePageChange = (page: number) => {
  store.setCurrentPage(page)
}

const handleArticleSelect = (article: any) => {
  const { categorySlug, subCategorySlug } = getSlugs()
  router.push(`/help/${categorySlug}/${subCategorySlug}/${article.slug}`)
}

const handleSubCategoryClick = (subCategory: any) => {
  router.push(`/help/${parentCategory.value?.slug}/${subCategory.slug}`)
}

// SEO Metadata
useHead(() => ({
  title: subCategory.value
    ? `${subCategory.value.name} - ${
        parentCategory.value?.name || 'Help Center'
      }`
    : 'Help Center',
  meta: [
    {
      name: 'description',
      content:
        subCategory.value?.description ||
        `Help articles for ${
          parentCategory.value?.name || 'this category'
        } subcategory`,
    },
  ],
}))
</script>
