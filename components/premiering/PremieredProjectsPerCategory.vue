<template>
  <v-container>
    <!-- Skeleton Loading State -->
    <template v-if="store.loading && !store.categoriesWithProjects.length">
      <ProjectCategorySkeleton v-for="n in 3" :key="n" />
    </template>

    <!-- Error State -->
    <v-row v-else-if="store.error">
      <v-col cols="12">
        <v-alert type="error" :text="store.error" class="mb-4" />
      </v-col>
    </v-row>

    <!-- Content -->
    <template v-else>
      <!-- Categories List -->
      <template v-if="store.categoriesWithProjects.length">
        <div
          v-for="category in store.categoriesWithProjects"
          :key="category.id"
          class="mb-12"
        >
          <CategorySection :category="category" />
        </div>
      </template>

      <!-- Empty State -->
      <v-row v-else>
        <v-col cols="12">
          <v-card class="text-center pa-8">
            <v-icon
              size="64"
              color="grey-lighten-1"
              icon="mdi-movie-open-off"
              class="mb-4"
            />
            <h3 class="text-h5 mb-2">No Premieres Available</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              There are currently no premieres scheduled in any category.
            </p>
            <BaseButton
              title="Browse All Categories"
              :action="() => navigateTo('/categories')"
              color="primary"
              variant="outlined"
            />
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Back to Top Button -->
    <v-btn
      v-show="showBackToTop"
      icon="mdi-arrow-up"
      color="primary"
      size="large"
      class="back-to-top-btn"
      @click="scrollToTop"
    >
      <v-tooltip activator="parent" location="left"> Back to top </v-tooltip>
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePremieringCategoriesStore } from '~/stores/usePremieringCategoriesStore'

const router = useRouter()
const store = usePremieringCategoriesStore()

const showBackToTop = ref(false)

const navigateTo = (route: string) => {
  router.push(route)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 500
}

// Fetch categories with projects on mount
onMounted(async () => {
  if (!store.categoriesWithProjects.length) {
    await store.fetchCategoriesWithProjects()
  }
  window.addEventListener('scroll', handleScroll)
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99;
}

@media (max-width: 600px) {
  .back-to-top-btn {
    bottom: 16px;
    right: 16px;
  }
}
</style>
