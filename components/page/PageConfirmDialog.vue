<!-- components/PageConfirmDialog.vue -->
<script setup lang="ts">
const dialog = ref(false)
const title = ref('')
const message = ref('')
const confirmCallback = ref<(() => void) | null>(null)

// Provide confirm dialog functionality globally
provide(
  'confirm',
  (options: { title: string; message: string; callback: () => void }) => {
    title.value = options.title
    message.value = options.message
    confirmCallback.value = options.callback
    dialog.value = true
  }
)
</script>

<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="dialog = false">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="
            confirmCallback?.()
            dialog = false
          "
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
