<template>
  <v-card class="text-center pa-6">
    <v-icon size="64" color="grey lighten-1">mdi-account-group</v-icon>
    <h2 class="mt-4">No Investors Yet</h2>
    <p class="mb-4">This project doesn't have any investors at the moment.</p>
    <v-btn color="primary" @click="$emit('add-investor')"
      >Add an Investor</v-btn
    >
  </v-card>
</template>

<script setup lang="ts">
defineEmits(["add-investor"]);
</script>
