<!-- components/support/SupportAttachmentPreview.vue -->
<template>
  <div class="support-attachment-preview">
    <v-slide-x-transition group>
      <div
        v-for="(attachment, index) in attachments"
        :key="attachment.id || index"
        class="attachment-item ma-1 d-inline-block"
      >
        <template v-if="isImage(attachment)">
          <v-img
            :src="getAttachmentUrl(attachment)"
            :width="thumbnailSize"
            :height="thumbnailSize"
            cover
            class="rounded"
            @click="openPreview(attachment)"
          >
            <template v-if="deletable">
              <v-btn
                icon="mdi-close"
                size="x-small"
                color="error"
                variant="flat"
                class="delete-btn"
                @click.stop="emit('delete', index)"
              />
            </template>
          </v-img>
        </template>
        <template v-else>
          <v-btn
            :prepend-icon="getFileIcon(attachment)"
            variant="outlined"
            size="small"
            class="text-none"
            @click="downloadFile(attachment)"
          >
            {{ getFileName(attachment) }}
            <template v-if="deletable">
              <v-btn
                icon="mdi-close"
                size="x-small"
                color="error"
                variant="text"
                class="ml-2"
                @click.stop="emit('delete', index)"
              />
            </template>
          </v-btn>
        </template>
      </div>
    </v-slide-x-transition>

    <!-- Image Preview Dialog -->
    <v-dialog v-model="showPreview" max-width="90vw">
      <v-card v-if="selectedAttachment">
        <v-card-title class="d-flex align-center">
          {{ getFileName(selectedAttachment) }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showPreview = false" />
        </v-card-title>
        <v-card-text class="text-center">
          <v-img
            :src="getAttachmentUrl(selectedAttachment)"
            max-height="80vh"
            contain
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  attachments: {
    type: Array,
    required: true,
  },
  thumbnailSize: {
    type: Number,
    default: 100,
  },
  deletable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['delete'])

const showPreview = ref(false)
const selectedAttachment = ref(null)

const isImage = (attachment: any) => {
  return (
    attachment.mime_type?.startsWith('image/') ||
    attachment.type?.startsWith('image/')
  )
}

const getAttachmentUrl = (attachment: any) => {
  if (attachment instanceof File) {
    return URL.createObjectURL(attachment)
  }
  return attachment.download_url
}

const getFileName = (attachment: any) => {
  return attachment.original_name || attachment.name
}

const getFileIcon = (attachment: any) => {
  const mimeType = attachment.mime_type || attachment.type
  if (mimeType.includes('pdf')) return 'mdi-file-pdf'
  if (mimeType.includes('word')) return 'mdi-file-word'
  if (mimeType.includes('zip')) return 'mdi-zip-box'
  return 'mdi-file'
}

const openPreview = (attachment: any) => {
  selectedAttachment.value = attachment
  showPreview.value = true
}

const downloadFile = async (attachment: any) => {
  if (attachment instanceof File) {
    // Local file
    const url = URL.createObjectURL(attachment)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else {
    // Server file
    window.open(attachment.download_url, '_blank')
  }
}
</script>

<style scoped>
.attachment-item {
  position: relative;
}

.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}
</style>
