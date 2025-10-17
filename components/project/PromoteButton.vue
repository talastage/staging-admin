<template>
  <NuxtLink :to="`/promote/project/${projectAccessUuid}`">
    <v-btn color="primary"> Promote Now </v-btn>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  projectAccessUuid: {
    type: String,
    required: true,
  },
});
</script>
