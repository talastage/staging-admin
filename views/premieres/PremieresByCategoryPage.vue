<!-- pages/premieres/categories/[slug].vue -->
<template>
  <v-container>
    <!-- Loading State -->
    <template v-if="isLoading && !category">
      <CategoryDetailSkeleton />
    </template>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" :text="error" class="mb-4"></v-alert>
      </v-col>
    </v-row>

    <!-- Content -->
    <template v-else-if="category">
      <!-- Category Header -->
      <div class="d-flex align-center mb-8">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          class="mr-4"
          @click="router.back()"
        />
        <v-avatar
          v-if="category.avatar_url"
          :image="category.avatar_url"
          size="48"
          class="mr-4"
        />
        <h1 class="text-h4">{{ category.name }}</h1>
      </div>

      <!-- Projects Grid -->
      <v-row>
        <v-col
          v-for="project in projects"
          :key="project.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <ProjectPremiereCard
            :premiere="project"
            :hasReminder="hasReminder(project.id)"
            :reminderLoading="reminderLoading === project.id"
            @reminder-toggle="handleReminderToggle"
          />
        </v-col>
      </v-row>

      <!-- Loading More -->
      <v-row v-if="isLoadingMore" class="mt-4">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-if="!projects.length && !isLoading">
        <v-col cols="12">
          <v-card class="text-center pa-8">
            <v-icon
              size="64"
              color="grey-lighten-1"
              icon="mdi-movie-open-off"
              class="mb-4"
            ></v-icon>
            <h3 class="text-h5 mb-2">No Premieres Available</h3>
            <p class="text-body-1 text-medium-emphasis">
              There are currently no premieres in this category
            </p>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Category, Premiere } from '~/types/premiere'
import { usePremiereReminders } from '@/composables/premiering/usePremiereReminders'

const router = useRouter()
const route = useRoute()

// Refs
const category = ref<Category | null>(null)
const projects = ref<Premiere[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const lastPage = ref(1)

// Get category slug from route
const slug = route.params.categorySlug as string

// Use premiere reminders composable
const { reminderLoading, hasReminder, handleReminderToggle } =
  usePremiereReminders()

// Methods
const fetchCategory = async (page = 1) => {
  const isInitialLoad = page === 1

  if (isInitialLoad) {
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  error.value = null

  try {
    const { data } = await useNuxtApp().$axios.get(
      `/api/projects/categories/${slug}`,
      {
        params: { page },
      }
    )

    if (isInitialLoad) {
      category.value = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        avatar_url: data.avatar_url,
      }
      projects.value = data.projects.data
    } else {
      projects.value = [...projects.value, ...data.projects.data]
    }

    currentPage.value = data.pagination.current_page
    lastPage.value = data.pagination.last_page
  } catch (err) {
    error.value = 'Failed to load category'
    console.error('Error fetching category:', err)
  } finally {
    if (isInitialLoad) {
      isLoading.value = false
    } else {
      isLoadingMore.value = false
    }
  }
}

// Infinite scroll handler
const handleScroll = async () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    currentPage.value < lastPage.value &&
    !isLoading.value &&
    !isLoadingMore.value
  ) {
    await fetchCategory(currentPage.value + 1)
  }
}

// Meta
useHead(() => ({
  title: category.value ? `${category.value.name} Premieres` : 'Loading...',
  meta: [
    {
      name: 'description',
      content: category.value
        ? `Watch live premieres in the ${category.value.name} category`
        : 'Loading category premieres...',
    },
  ],
}))

// Lifecycle hooks
onMounted(async () => {
  await fetchCategory()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
