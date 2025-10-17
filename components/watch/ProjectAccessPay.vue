<template>
    <v-btn color="primary" @click="openAccessDialog">
      Play Full
    </v-btn>
</template>

<script setup lang="ts">
const emit = defineEmits(['open-access-dialog']);

function openAccessDialog() {
  emit('open-access-dialog');
}
</script>
