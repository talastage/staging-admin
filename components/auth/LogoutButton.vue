<template>
  <v-list-item @click="$emit('logout')" prepend-icon="mdi-logout">
    <v-list-item-title>Log out</v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
defineEmits(['logout']);
</script>