<template>
    <v-btn color="red" @click="openTeaserDialog">
      Teaser
    </v-btn>
</template>

<script setup lang="ts">
const emit = defineEmits(['open-teaser-dialog']);

function openTeaserDialog() {
  emit('open-teaser-dialog');
}
</script>
