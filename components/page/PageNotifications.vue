<!-- components/PageNotifications.vue -->
<script setup lang="ts">
import { useSnackMessageStore } from '@/stores/useSnackMessage'

const snackStore = useSnackMessageStore()
</script>

<template>
  <v-snackbar
    v-model="snackStore.show"
    :color="snackStore.color"
    :timeout="snackStore.timeout"
    :closable="snackStore.closable"
    location="top"
  >
    {{ snackStore.message }}

    <template v-slot:actions v-if="snackStore.closable">
      <v-btn color="white" variant="text" @click="snackStore.closeSnack">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
