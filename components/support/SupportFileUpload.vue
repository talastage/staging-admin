<!-- components/support/SupportFileUpload.vue -->
<template>
  <div class="support-file-upload">
    <input
      ref="fileInput"
      type="file"
      :multiple="maxFiles > 1"
      :accept="acceptedTypes"
      class="d-none"
      @change="handleFileSelect"
    />

    <template v-if="buttonOnly">
      <v-btn
        :color="color"
        :variant="variant"
        :icon="icon"
        @click="triggerFileInput"
      >
        <v-icon>{{ icon || 'mdi-paperclip' }}</v-icon>
      </v-btn>
    </template>
    <template v-else>
      <v-card
        :class="[
          'upload-zone pa-4',
          'text-center',
          isDragging ? 'dragging' : '',
        ]"
        variant="outlined"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @click="triggerFileInput"
      >
        <v-icon size="40" color="primary" class="mb-2">
          mdi-cloud-upload
        </v-icon>
        <div class="text-body-1">Drop files here or click to upload</div>
        <div class="text-caption text-grey">
          Maximum {{ formatFileSize(maxSize) }} per file
        </div>
      </v-card>

      <v-slide-y-transition group>
        <v-chip
          v-for="(file, index) in modelValue"
          :key="index"
          class="ma-1"
          closable
          @click:close="removeFile(index)"
        >
          <v-icon start>
            {{ getFileIcon(file.type) }}
          </v-icon>
          {{ file.name }}
          ({{ formatFileSize(file.size) }})
        </v-chip>
      </v-slide-y-transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  maxFiles: {
    type: Number,
    default: 5,
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024, // 10MB
  },
  acceptedTypes: {
    type: String,
    default: 'image/*,.pdf,.doc,.docx,.zip',
  },
  buttonOnly: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'primary',
  },
  variant: {
    type: String,
    default: 'text',
  },
  icon: {
    type: String,
    default: 'mdi-paperclip',
  },
})

const emit = defineEmits(['update:modelValue', 'error'])

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
  }
  input.value = '' // Reset input
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    processFiles(Array.from(event.dataTransfer.files))
  }
}

const processFiles = (files: File[]) => {
  const newFiles = [...props.modelValue]

  for (const file of files) {
    if (newFiles.length >= props.maxFiles) {
      emit('error', `Maximum ${props.maxFiles} files allowed`)
      break
    }

    if (file.size > props.maxSize) {
      emit(
        'error',
        `File ${file.name} exceeds maximum size of ${formatFileSize(
          props.maxSize
        )}`
      )
      continue
    }

    newFiles.push(file)
  }

  emit('update:modelValue', newFiles)
}

const removeFile = (index: number) => {
  const newFiles = [...props.modelValue]
  newFiles.splice(index, 1)
  emit('update:modelValue', newFiles)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'mdi-image'
  if (mimeType.includes('pdf')) return 'mdi-file-pdf'
  if (mimeType.includes('word')) return 'mdi-file-word'
  if (mimeType.includes('zip')) return 'mdi-zip-box'
  return 'mdi-file'
}
</script>

<style scoped>
.upload-zone {
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-zone:hover {
  border-color: rgb(var(--v-theme-primary));
}

.upload-zone.dragging {
  background-color: rgb(var(--v-theme-primary), 0.1);
  border-color: rgb(var(--v-theme-primary));
}
</style>
