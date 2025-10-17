<!-- FileDropZone.vue -->
<template>
  <div
    class="file-drop-zone"
    :class="{ dragover: isDragOver }"
    @drop.prevent="handleDrop"
    @dragover.prevent="isDragOver = true"
    @dragleave.prevent="isDragOver = false"
  >
    <slot :isDragOver="isDragOver">
      <p>Drag and drop your video here or click to browse</p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'drop', file: File): void
  (e: 'click'): void
}>()

const isDragOver = ref(false)

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    emit('drop', file)
  }
}
</script>

<style scoped>
.file-drop-zone {
  width: 100%;
}
.file-drop-zone.dragover {
  background: rgba(0, 0, 0, 0.03);
}
</style>
