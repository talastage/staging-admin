<template>
  <HelpArticleDetailPage
    :article="article"
    :error="error"
    :isPending="isPending"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from '#app'
import { useSeo } from '@/composables/seo/useSeo'
import { useNuxtApp } from '#app'
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

interface Category {
  id: number
  name: string
  slug: string
}

interface Article {
  id: number
  title: string
  slug: string
  content: string
  thumbnail_url: string | null
  is_popular: number
  category: Category
  sub_category: Category
  created_at: string
  updated_at: string
}

interface ApiResponse {
  data: Article
}

const route = useRoute()
const { $axios } = useNuxtApp()

const article = ref<Article | null>(null)
const error = ref<Error | null>(null)
const isPending = ref(true)

// Fetch article function
async function fetchArticle() {
  const { categorySlug, subCategorySlug, articleSlug } = route.params

  if (!categorySlug || !subCategorySlug || !articleSlug) {
    error.value = new Error('Invalid route parameters')
    isPending.value = false
    return
  }

  try {
    isPending.value = true
    error.value = null

    console.log(
      'Fetching article:',
      `/api/help/categories/${categorySlug}/${subCategorySlug}/${articleSlug}`
    )

    const response = await $axios.get<{ data: Article }>(
      `/api/help/categories/${categorySlug}/${subCategorySlug}/${articleSlug}`
    )

    // The API returns { data: { data: Article } } structure
    if (!response.data || !response.data.data) {
      throw new Error('Article not found')
    }

    article.value = response.data.data

    // Update SEO once article is loaded
    updateSeo()
  } catch (err) {
    console.error('Failed to fetch article:', err)
    error.value = err as Error
    article.value = null
  } finally {
    isPending.value = false
  }
}

// Update SEO based on article content
function updateSeo() {
  if (!article.value) return

  useSeo({
    title: article.value.title,
    description: article.value.content
      ? article.value.content.replace(/<[^>]+>/g, '').substring(0, 160)
      : 'Help Center article',
    type: 'article',
    modifiedTime: article.value.updated_at,
    publishedTime: article.value.created_at,
    section: 'Help Center',
    keywords: `help, support, ${article.value.category?.name || ''}, ${
      article.value.sub_category?.name || ''
    }, ${article.value.title}`,
    structured: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: {
        '@type': 'Question',
        name: article.value.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: article.value.content,
        },
      },
    },
  })
}

// Use onMounted to ensure the component is mounted before fetching
onMounted(() => {
  fetchArticle()
})

// Watch for route changes
watch(
  () => route.fullPath,
  () => {
    fetchArticle()
  }
)
</script>
