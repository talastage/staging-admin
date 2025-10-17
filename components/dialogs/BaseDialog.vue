<template>
  <v-dialog v-model="internalDialog" :max-width="maxWidth" persistent>
    <v-card>
      <v-card-title class="justify-space-between">
        <!-- Add slot for custom title -->
        <slot name="title">
          <span>{{ title }}</span>
        </slot>
        <v-btn icon @click="closeDialog" v-if="showCloseButton">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions>
        <slot name="actions"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  title: String,
  modelValue: Boolean,
  maxWidth: { type: String, default: '500px' },
  showCloseButton: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])
const internalDialog = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
  }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const closeDialog = () => {
  internalDialog.value = false
}
</script>

<style scoped>
.v-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

/* Add these styles to handle custom title with back button */
.v-card-title :deep(.d-flex) {
  flex: 1;
  margin-right: 16px;
}

.v-card-title :deep(.v-btn--icon) {
  margin: -8px;
}
</style>
