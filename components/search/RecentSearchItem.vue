<!-- components/search/RecentSearchItem.vue -->
<template>
  <v-list-item
    :title="search.query"
    :subtitle="formatTimestamp(search.timestamp)"
    @click="$emit('select', search.query)"
  >
    <template #prepend>
      <v-icon icon="mdi-history" size="small" />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
interface RecentSearch {
  query: string
  timestamp: number
}

const props = defineProps<{
  search: RecentSearch
}>()

defineEmits<{
  (e: 'select', query: string): void
}>()

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
