<!-- components/search/PageCard.vue -->
<template>
  <v-list-item
    :title="page.name"
    :subtitle="page.slug"
    :value="page.id"
    @click="$emit('select', page)"
  >
    <template #prepend>
      <v-avatar
        :image="page.avatar_url"
        :color="!page.avatar_url ? 'primary' : undefined"
      >
        {{ !page.avatar_url ? getInitials(page.name) : '' }}
      </v-avatar>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
interface Page {
  id: number
  slug: string
  name: string
  avatar_url: string | null
}

const props = defineProps<{
  page: Page
}>()

defineEmits<{
  (e: 'select', page: Page): void
}>()

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
