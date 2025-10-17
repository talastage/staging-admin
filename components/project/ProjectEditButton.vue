<template>
  <NuxtLink :to="`/studio/projects/${project.access_uuid}/detail`">
    <v-btn color="primary" class="custom-btn" variant="tonal">
      <v-icon start>mdi-pencil</v-icon>
      Edit
    </v-btn>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.custom-btn {
  border-radius: 20px;
  padding: 0 16px;
  height: 36px;
  text-transform: none;
  font-weight: 500;
}
</style>
