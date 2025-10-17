<!-- components/premieres/CategoryDetailSkeleton.vue -->
<template>
  <div class="category-detail-skeleton">
    <!-- Header Skeleton -->
    <div class="d-flex align-center mb-8">
      <v-skeleton-loader
        type="button"
        width="48"
        height="48"
        class="mr-4"
      ></v-skeleton-loader>
      <v-skeleton-loader
        type="avatar"
        size="48"
        class="mr-4"
      ></v-skeleton-loader>
      <v-skeleton-loader type="text" width="200"></v-skeleton-loader>
    </div>

    <!-- Projects Grid Skeleton -->
    <v-row>
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <ProjectPremiereCardSkeleton />
      </v-col>
    </v-row>
  </div>
</template>
