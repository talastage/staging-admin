<template>
  <!-- Using BaseCard for clickable help item -->
  <BaseCard
    v-if="!fullContent && articleRoute"
    :to="articleRoute"
    :elevation="10"
    class="help-item"
  >
    <div class="help-item-content-wrapper">
      <div class="help-item-header">
        <v-icon
          class="help-item-icon"
          :icon="articleIcon"
          color="primary"
          size="24"
        />
        <h3 class="help-item-title text-h6 text-high-emphasis">
          {{ article.title }}
        </h3>
      </div>

      <p class="help-item-content text-body-1 text-high-emphasis">
        {{ truncatedContent }}
      </p>

      <!-- Category/Sub-category area -->
      <div class="help-item-meta">
        <!-- Category link -->
        <router-link
          v-if="categoryRoute"
          :to="categoryRoute"
          class="text-decoration-none"
          @click.stop
        >
          <v-chip
            size="small"
            class="help-item-chip text-caption"
            variant="flat"
            color="primary"
          >
            {{ props.article.category.name }}
          </v-chip>
        </router-link>

        <!-- Sub-category link -->
        <router-link
          v-if="subCategoryRoute"
          :to="subCategoryRoute"
          class="text-decoration-none"
          @click.stop
        >
          <v-chip
            size="small"
            class="help-item-chip text-caption"
            variant="flat"
            color="secondary"
          >
            {{ props.article.sub_category.name }}
          </v-chip>
        </router-link>
      </div>
    </div>
  </BaseCard>

  <!-- Non-clickable card for full content or missing slugs -->
  <BaseCard v-else :elevation="2" class="help-item">
    <div class="help-item-content-wrapper">
      <div class="help-item-header">
        <v-icon
          class="help-item-icon"
          :icon="articleIcon"
          color="primary"
          size="24"
        />
        <h3 class="help-item-title text-h6 text-high-emphasis">
          {{ article.title }}
        </h3>
      </div>

      <p class="help-item-content text-body-1 text-high-emphasis">
        {{ truncatedContent }}
      </p>

      <div class="help-item-meta">
        <!-- Category (non-clickable if slugs are missing) -->
        <v-chip
          v-if="props.article.category"
          size="small"
          class="help-item-chip text-caption"
          variant="flat"
          color="primary"
        >
          {{ props.article.category.name }}
        </v-chip>

        <!-- Sub-category (non-clickable if slugs are missing) -->
        <v-chip
          v-if="props.article.sub_category"
          size="small"
          class="help-item-chip text-caption"
          variant="flat"
          color="secondary"
        >
          {{ props.article.sub_category.name }}
        </v-chip>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CategoryData {
  name: string
  slug: string
}

interface Article {
  id: number
  title: string
  slug: string
  content: string | null
  category?: CategoryData | null
  sub_category?: CategoryData | null
  icon?: string | null
}

const props = defineProps<{
  article: Article
  fullContent?: boolean
}>()

/**
 * Dynamically compute the routes.
 * If the category, sub-category, or article slug is missing,
 * these will be null and we can gracefully handle that in the template.
 */
const articleRoute = computed(() => {
  const categorySlug = props.article.category?.slug
  const subCategorySlug = props.article.sub_category?.slug
  const articleSlug = props.article.slug

  if (categorySlug && subCategorySlug && articleSlug) {
    return `/help/${categorySlug}/${subCategorySlug}/${articleSlug}`
  }
  return null
})

const categoryRoute = computed(() => {
  const catSlug = props.article.category?.slug
  return catSlug ? `/help/${catSlug}` : null
})

const subCategoryRoute = computed(() => {
  const parentSlug = props.article.category?.slug
  const subCatSlug = props.article.sub_category?.slug
  if (parentSlug && subCatSlug) {
    return `/help/${parentSlug}/${subCatSlug}`
  }
  return null
})

/** Determine icon based on article properties or fallback */
const articleIcon = computed(() => {
  return props.article.icon || 'mdi-help-circle-outline'
})

/** Show full content or truncated snippet */
const truncatedContent = computed(() => {
  const cleanContent = (content: string) => {
    // Decode HTML entities
    const decoded = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\n/g, ' ')
      .replace(/\\/g, '')

    // Strip HTML tags
    return decoded.replace(/<[^>]*>/g, '').trim()
  }

  if (props.fullContent) {
    return cleanContent(props.article.content || 'No content available.')
  }

  const desc = props.article.content || ''
  const cleaned = cleanContent(desc)
  const maxLength = 150

  return cleaned.length > maxLength
    ? cleaned.slice(0, maxLength).trim() + '...'
    : cleaned || 'No content available.'
})
</script>

<style scoped>
.help-item {
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.help-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.help-item-content-wrapper {
  padding: 8px; /* Adjusted padding since BaseCard already has some padding */
}

.help-item-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.help-item-icon {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-radius: 8px;
  padding: 8px;
  flex-shrink: 0;
}

.help-item-title {
  margin: 0;
  flex: 1;
}

.help-item-content {
  margin: 0 0 16px;
}

.help-item-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.help-item-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.help-item-chip:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

/* Custom bottom border animation that appears on hover */
.help-item {
  position: relative;
}

.help-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--v-theme-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.help-item:hover::after {
  transform: scaleX(1);
}
</style>
