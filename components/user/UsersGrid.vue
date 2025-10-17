<template>
  <div class="users-grid">
    <!-- Users Grid -->
    <v-row>
      <v-col
        v-for="user in users"
        :key="user.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <UserTalentCard :user="user" />
      </v-col>
    </v-row>

    <!-- Skeleton Loaders for Initial Loading -->
    <div v-if="isLoading && users.length === 0" class="loading mt-4">
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </div>

    <!-- Loading More Indicator -->
    <div v-if="isLoading && users.length > 0" class="text-center my-4">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- No More Content Message -->
    <div
      v-if="!hasMore && users.length > 0"
      class="no-more-content text-center my-6"
    >
      <v-alert type="info" variant="tonal"> No more users to display. </v-alert>
    </div>

    <!-- No Results Message -->
    <div v-if="!isLoading && users.length === 0" class="text-center my-6">
      <v-alert type="warning" variant="tonal">
        No users found for the selected filters.
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define props with types
defineProps<{
  users: User[]
  isLoading: boolean
  hasMore: boolean
}>()
</script>

<style scoped>
.users-grid {
  padding: 16px;
}

.loading {
  width: 100%;
}

.no-more-content {
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
