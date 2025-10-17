<!-- components/help/PopularArticles.vue -->
<template>
  <div>
    <h2 class="text-h5 font-weight-medium mb-4">Popular Help Articles</h2>

    <!-- LOADING SKELETON -->
    <v-row v-if="isLoadingPopular">
      <v-col v-for="i in 2" :key="i" cols="12" md="6">
        <v-skeleton-loader type="article" />
      </v-col>
    </v-row>

    <!-- ERROR STATE -->
    <v-alert v-else-if="popularError" type="error" variant="tonal" class="my-4">
      {{ popularError }}
      <template #append>
        <v-btn
          color="error"
          variant="text"
          @click="retryFetch"
          :loading="isLoadingPopular"
        >
          Retry
        </v-btn>
      </template>
    </v-alert>

    <!-- CONTENT STATE -->
    <v-row v-else-if="popularArticles.length">
      <v-col
        v-for="article in popularArticles"
        :key="article.id"
        cols="12"
        md="6"
      >
        <HelpItem :article="article" />
      </v-col>
    </v-row>

    <!-- EMPTY STATE -->
    <v-alert v-else type="info" variant="tonal" class="my-4">
      No popular articles available at the moment.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, defineProps } from 'vue'
import { useHelp } from '@/composables/useHelp'

// Optional props if you want to pass a search query from outside
const props = defineProps<{
  searchQuery?: string
}>()

const {
  popularArticles,
  isLoadingPopular,
  popularError,
  fetchPopularArticles,
} = useHelp()

// Re-fetch on mount
onMounted(() => {
  fetchPopularArticles(props.searchQuery || '')
})

// If you want to automatically refetch when searchQuery changes:
watch(
  () => props.searchQuery,
  (newVal) => {
    fetchPopularArticles(newVal || '')
  }
)

function retryFetch() {
  fetchPopularArticles(props.searchQuery || '')
}

// Expose them to template
</script>
