<template>
  <div class="user-search">
    <!-- Search Input -->
    <v-card flat class="mb-4 pa-2">
      <v-text-field
        v-model="searchQuery"
        density="comfortable"
        variant="outlined"
        label="Search users"
        :placeholder="placeholder || 'Enter name or username'"
        prepend-inner-icon="mdi-magnify"
        :loading="searchStore.isLoading"
        :error="!!searchStore.error"
        :error-messages="searchStore.error"
        clearable
        @update:model-value="handleSearch"
        @click:clear="handleClear"
        hide-details
      >
        <template #append>
          <v-fade-transition>
            <v-progress-circular
              v-if="searchStore.isLoading"
              indeterminate
              size="24"
              color="primary"
            />
          </v-fade-transition>
        </template>
      </v-text-field>
    </v-card>

    <!-- Search Results -->
    <v-slide-y-transition group>
      <template v-if="searchStore.searchResults.length">
        <v-card
          v-for="user in searchStore.searchResults"
          :key="user.id"
          flat
          class="mb-2 user-card"
        >
          <v-list-item>
            <!-- User Avatar -->
            <template #prepend>
              <v-avatar size="40" color="grey-lighten-3">
                <v-img
                  v-if="user.profile_photo"
                  :src="user.profile_photo"
                  :alt="user.display_name"
                />
                <span v-else class="text-h6">
                  {{ getInitials(user.display_name) }}
                </span>
              </v-avatar>
            </template>

            <!-- User Info -->
            <v-list-item-title class="font-weight-medium">
              {{ user.display_name }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-grey">
              @{{ user.username }}
            </v-list-item-subtitle>

            <!-- Status Badge and Select Button - Now Using Slot -->
            <template #append>
              <div class="d-flex align-center">
                <!-- Default button if no slot is provided -->
                <slot
                  name="user-action"
                  :user="user"
                  :select-user="() => selectUser(user)"
                >
                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    @click="selectUser(user)"
                    :loading="loading"
                  >
                    Select
                  </v-btn>
                </slot>
              </div>
            </template>
          </v-list-item>
        </v-card>
      </template>

      <!-- No Results Message -->
      <v-card
        v-else-if="searchQuery && !searchStore.isLoading"
        flat
        class="pa-4 text-center"
      >
        <v-icon
          icon="mdi-account-search-outline"
          size="48"
          color="grey-lighten-1"
          class="mb-2"
        />
        <div class="text-body-1 text-grey">
          No users found matching "{{ searchQuery }}"
        </div>
      </v-card>
    </v-slide-y-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import debounce from 'lodash/debounce'
import { useUserSearchStore } from '@/stores/useUserSearchStore'

interface Props {
  minSearchLength?: number
  debounceMs?: number
  loading?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  minSearchLength: 2,
  debounceMs: 300,
  loading: false,
  placeholder: '',
})

const emit = defineEmits<{
  (e: 'user-selected', user: any): void
}>()

const searchStore = useUserSearchStore()
const searchQuery = ref('')

// Debounced search function
const debouncedSearch = debounce(async (query: string) => {
  if (query.length >= props.minSearchLength) {
    await searchStore.searchUsers(query)
  } else {
    searchStore.clearSearch()
  }
}, props.debounceMs)

// Handle search input
const handleSearch = (value: string) => {
  debouncedSearch(value)
}

// Clear search
const handleClear = () => {
  searchQuery.value = ''
  searchStore.clearSearch()
}

// Select user
const selectUser = (user: any) => {
  emit('user-selected', user)
}

// Get initials for avatar
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Clean up
onBeforeUnmount(() => {
  debouncedSearch.cancel()
})
</script>

<style scoped>
.user-search {
  max-width: 600px;
  margin: 0 auto;
}

.user-card {
  transition: all 0.2s ease;
}

.user-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* Optional: Add subtle shadow on hover */
.user-card:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
