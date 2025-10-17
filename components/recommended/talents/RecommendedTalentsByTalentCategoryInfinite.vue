<template>
  <div class="recommended-talents-by-category">
    <!-- BaseHeader with v-once since category data won't change -->
    <div v-once>
      <CategoryHeader :category="categoryData">
        <template #description>
          Discover amazing {{ categoryData?.name?.toLowerCase() }} and connect
          with them
        </template>

        <template #actions>
          <ViewAllButton
            :route="`/talents/${categoryData?.slug}`"
            prepend-icon="mdi-arrow-right"
          />
        </template>
      </CategoryHeader>
    </div>

    <TalentGrid
      :talents="talents"
      :is-loading="isLoading"
      :has-more-pages="hasMorePages"
      card-size="medium"
      :skeleton-count="18"
      @load-more="handleLoadMore"
      @fanning-updated="handleFanningUpdated"
    >
      <template #empty-state>
        <EmptyStateCard
          title="No Talents Found"
          message="We haven't found any talents in this category."
          action-text="Register Your Talent"
          link="/talents/register"
        >
        </EmptyStateCard>
      </template>
    </TalentGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

interface Category {
  id: number
  name: string
  slug: string
  avatar_url: string
}

interface Talent {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
  is_fanned_by_auth_user: boolean
  is_fanning_auth_user: boolean
  is_saved: boolean
}

interface ApiResponse {
  data: {
    category: Category
    talents: Talent[]
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

// Props
const props = defineProps<{ talentCategorySlug: string }>()

// State
const talents = ref<Talent[]>([])
const categoryData = ref<Category | null>(null)
const page = ref(1)
const isLoading = ref(false)
const hasMorePages = ref(true)

const { $axios } = useNuxtApp()

async function loadTalents() {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const response = await $axios.get<ApiResponse>(
      `/guest/recommended/talents/category/${props.talentCategorySlug}`,
      {
        params: {
          page: page.value,
          per_page: 18, // Match backend pagination
        },
      }
    )

    const { data, meta } = response.data

    // Set category data only on first load
    if (page.value === 1) {
      categoryData.value = data.category
    }

    // Append new talents
    talents.value.push(...data.talents)

    // Update pagination state
    hasMorePages.value = meta.current_page < meta.last_page
    if (hasMorePages.value) {
      page.value++
    }
  } catch (error) {
    console.error('Error loading talents:', error)
    hasMorePages.value = false
  } finally {
    isLoading.value = false
  }
}

function handleLoadMore() {
  if (!isLoading.value && hasMorePages.value) {
    loadTalents()
  }
}

function handleFanningUpdated(talentId: number, newState: boolean) {
  const talent = talents.value.find((t) => t.id === talentId)
  if (talent) {
    talent.is_fanned_by_auth_user = newState
  }
}

onMounted(() => {
  loadTalents()
})
</script>

<style scoped>
.recommended-talents-by-category {
  position: relative;
}
</style>
