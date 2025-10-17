<template>
  <v-list-item
    v-if="label || href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <template #prepend v-if="icon">
      <v-icon :icon="icon" class="mr-3"></v-icon>
    </template>
    <v-list-item-title>
      <a
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        class="text-body-1"
      >
        {{ label }}
      </a>
    </v-list-item-title>
  </v-list-item>
  <v-list-item v-else-if="label">
    <template #prepend v-if="icon">
      <v-icon :icon="icon" class="mr-3"></v-icon>
    </template>
    <v-list-item-title class="text-body-1">
      {{ label }}
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  label: string | null // Label is the primary text, allow null
  href?: string | null // Href makes it a link, allow null
}>()
</script>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
a:hover {
  text-decoration: underline;
}
/* Adjust list item padding if necessary */
.v-list-item {
  padding-left: 0 !important;
  padding-right: 0 !important;
  min-height: 40px; /* Adjust min height */
}
.v-list-item-title {
  line-height: 1.4; /* Adjust line height */
}
</style>
