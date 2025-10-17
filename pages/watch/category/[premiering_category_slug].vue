<template>
  <WatchCategoryProjectsPage
    :category="category"
    :items="items"
    :is-loading="isLoading"
    :error="error"
    :current-page="currentPage"
    :last-page="lastPage ?? 1"
  />
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSeo } from '@/composables/seo/useSeo'
import { usePremieringCategories } from '@/composables/premiering/usePremieringCategories'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const route = useRoute()
const slug = route.params.premiering_category_slug
const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl || 'https://talastage.com'

// State for category and errors
const category = ref(null)
const error = ref(null)

// Use the premiering categories composable
const { fetchCategoryProjects } = usePremieringCategories()

// Fetch projects with infinite scroll
const fetchProjects = async (page) => {
  try {
    const response = await fetchCategoryProjects(slug, page)

    // Set category data on first load
    if (page === 1) {
      const { projects: _, pagination: __, ...categoryData } = response
      category.value = categoryData
    }

    return response.projects
  } catch (err) {
    error.value = 'Failed to load category'
    console.error('Error fetching category:', err)
    return []
  }
}

// Setup infinite scroll
const { items, isLoading, hasMore, currentPage, reset } = useInfiniteScroll(
  fetchProjects,
  {
    threshold: 200,
    throttle: 300,
    direction: 'vertical',
  }
)

// Calculate last page from the category data
const lastPage = computed(() => category.value?.pagination?.last_page || 1)

// SEO data computed properties
const seoTitle = computed(() => {
  if (!category.value) return 'Browse Premieres | TalaStage'

  const categoryName = category.value.name || 'Category'
  return `${categoryName} Premieres | TalaStage`
})

const seoDescription = computed(() => {
  if (!category.value) {
    return 'Discover the latest premieres from talented creators in entertainment on TalaStage'
  }

  const categoryName = category.value.name || 'entertainment'
  return `Watch the latest ${categoryName} premieres from talented creators on TalaStage. Discover new projects and connect with creators in the ${categoryName.toLowerCase()} industry.`
})

const seoImage = computed(() => {
  return category.value?.avatar_url || `${baseUrl}/app-logo.png`
})

const seoUrl = computed(() => {
  return `${baseUrl}/watch/category/${slug}`
})

const seoKeywords = computed(() => {
  if (!category.value)
    return 'talent, premieres, entertainment, creative projects'

  const categoryName = category.value.name || ''
  return `${categoryName}, premieres, talent, entertainment, creative projects, ${categoryName.toLowerCase()} industry`
})

// Generate schema.org structured data for video playlist
const generateStructuredData = computed(() => {
  if (!category.value || !items.value.length) {
    return null
  }

  // Generate ItemList schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.value.name} Premieres on TalaStage`,
    description: `Browse the latest ${category.value.name} premieres from talented creators on TalaStage`,
    numberOfItems: items.value.length,
    itemListElement: items.value.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoObject',
        name: project.name,
        description: `${project.name} by ${project.creator.display_name}`,
        thumbnailUrl: project.thumbnail_url,
        uploadDate: project.created_at,
        contentUrl: project.video_url,
        embedUrl: project.video_url,
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WatchAction',
          userInteractionCount: project.views_count,
        },
        author: {
          '@type': 'Person',
          name: project.creator.display_name,
          url: `${baseUrl}/${project.creator.username}`,
        },
      },
    })),
  }

  return itemListSchema
})

// Apply initial SEO
const { seo } = useSeo({
  title: seoTitle.value,
  description: seoDescription.value,
  image: seoImage.value,
  url: seoUrl.value,
  keywords: seoKeywords.value,
  type: 'website',
})

// Watch for changes in category data to update SEO
watch(
  () => category.value,
  (newCategory) => {
    if (newCategory) {
      // Update SEO data when category is loaded
      useSeo({
        title: seoTitle.value,
        description: seoDescription.value,
        image: seoImage.value,
        url: seoUrl.value,
        keywords: seoKeywords.value,
        type: 'website',
        structured: generateStructuredData.value,
      })
    }
  },
  { deep: true }
)

// Watch for changes in projects to update structured data
watch(
  () => items.value,
  (newItems) => {
    if (category.value && newItems.length) {
      // Update structured data when projects change
      useSeo({
        structured: generateStructuredData.value,
      })
    }
  },
  { deep: true }
)

// Watch for route changes
watch(
  () => route.params.premiering_category_slug,
  (newSlug) => {
    if (newSlug) {
      reset()
      category.value = null
      error.value = null
    }
  }
)

// Initial fetch
onMounted(() => {
  reset()
})
</script>
