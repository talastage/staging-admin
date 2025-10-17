<!-- components/page/PageGrid.vue -->
<template>
  <v-row>
    <v-col
      v-for="page in pages"
      :key="page.id"
      cols="12"
      sm="6"
      md="3"
      class="d-flex"
    >
      <PageInvestorCard :page="page" :pageType="pageType" class="w-100" />
    </v-col>

    <v-col v-if="!pages.length && !loading" cols="12">
      <v-alert type="info" variant="tonal" border="start" class="mb-0">
        No pages found.
      </v-alert>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
interface Page {
  id: number
  name: string
  slug: string
  tagline?: string
  avatar_url: string
  type: string
  is_verified: boolean
  country?: {
    id: number
    name: string
  }
}

defineProps<{
  pages: Page[]
  loading: boolean
  pageType: string
}>()
</script>
