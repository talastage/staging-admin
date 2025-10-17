<template>
  <div class="help-article-page">
    <!-- Loading State -->
    <v-container v-if="isPending" class="py-8">
      <div class="article-wrapper">
        <v-skeleton-loader type="breadcrumbs" class="mb-6" />
        <v-skeleton-loader type="heading" class="mb-4" />
        <v-skeleton-loader type="text" width="200px" class="mb-8" />
        <v-skeleton-loader type="paragraph" class="mb-4" />
        <v-skeleton-loader type="paragraph" class="mb-4" />
        <v-skeleton-loader type="paragraph" width="80%" />
      </div>
    </v-container>

    <!-- Error State -->
    <v-container v-else-if="error" class="py-12">
      <div class="text-center">
        <v-icon size="80" color="error" class="mb-6">mdi-file-document-remove</v-icon>
        <h2 class="text-h5 mb-4">Article Not Found</h2>
        <p class="text-body-1 text-medium-emphasis mb-6">
          The article you're looking for doesn't exist or has been moved.
        </p>
        <v-btn color="primary" size="large" to="/help" prepend-icon="mdi-arrow-left">
          Back to Help Center
        </v-btn>
      </div>
    </v-container>

    <!-- Article Content -->
    <div v-else-if="article" class="article-layout">
      <!-- Header Section -->
      <div class="article-header">
        <v-container class="py-6">
          <div class="article-wrapper">
            <!-- Breadcrumbs -->
            <HelpBreadcrumb :items="breadcrumbItems" />

            <!-- Title -->
            <h1 class="article-title">{{ article.title }}</h1>

            <!-- Metadata -->
            <div class="article-meta">
              <div class="d-flex align-center gap-4">
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2">mdi-clock-outline</v-icon>
                  <span class="text-body-2">{{ formatLocalDateTime(article.updated_at) }}</span>
                </div>
                <v-chip
                  v-if="article.is_popular"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-star"
                >
                  Popular
                </v-chip>
              </div>
            </div>
          </div>
        </v-container>
      </div>

      <!-- Content Section -->
      <v-container class="py-8">
        <div class="article-wrapper">
          <!-- Thumbnail -->
          <v-img
            v-if="article.thumbnail_url"
            :src="article.thumbnail_url"
            class="article-thumbnail mb-8"
            max-height="400"
            cover
          />

          <!-- Content -->
          <BaseCard class="article-content-card" elevation="0">
            <div class="article-content" v-html="formatContent(article.content)" />
          </BaseCard>
        </div>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

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

const props = defineProps<{
  article: Article | null
  error: Error | null
  isPending: boolean
}>()

const { formatLocalDateTime } = useDateFormatter()

// Breadcrumb items
const breadcrumbItems = computed(() => {
  if (!props.article) return []
  
  const items = [
    { text: 'Help Center', to: '/help' }
  ]
  
  if (props.article.category) {
    items.push({
      text: props.article.category.name,
      to: `/help/${props.article.category.slug}`
    })
  }
  
  if (props.article.sub_category) {
    items.push({
      text: props.article.sub_category.name,
      to: `/help/${props.article.category.slug}/${props.article.sub_category.slug}`
    })
  }
  
  items.push({
    text: props.article.title
  })
  
  return items
})

// Format content to properly display line breaks
function formatContent(content: string): string {
  if (!content) return ''

  // Convert \r\n to <br> tags for proper line breaks
  return content.replace(/\r\n/g, '<br>')
}
</script>

<style scoped>
.help-article-page {
  min-height: 100vh;
}

.article-layout {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface-variant)) 100%);
}

.article-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.article-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 1.5rem;
}

.article-meta {
  padding: 1rem 0;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
  color: rgb(var(--v-theme-on-surface-variant));
}

.article-thumbnail {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.article-content-card {
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.article-content {
  line-height: 1.8;
  font-size: 1.125rem;
  color: rgb(var(--v-theme-on-surface));
}

/* Content Typography */
:deep(.article-content h1) {
  font-size: 2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  color: rgb(var(--v-theme-primary));
}

:deep(.article-content h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.article-content h3) {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1.25rem 0 0.5rem;
}

:deep(.article-content p) {
  margin-bottom: 1rem;
}

:deep(.article-content ul, .article-content ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

:deep(.article-content li) {
  margin-bottom: 0.5rem;
}

:deep(.article-content code) {
  background: rgb(var(--v-theme-surface-variant));
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

:deep(.article-content blockquote) {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  background: rgb(var(--v-theme-surface-variant));
  padding: 1rem;
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .article-title {
    font-size: 2rem;
  }
  
  .article-content-card {
    padding: 1.5rem;
  }
  
  .article-content {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .article-title {
    font-size: 1.75rem;
  }
  
  .article-content-card {
    padding: 1rem;
  }
}
</style>
