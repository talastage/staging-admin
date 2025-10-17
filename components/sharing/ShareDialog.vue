<template>
  <v-dialog v-model="dialogModel" max-width="600px">
    <v-card>
      <v-card-title class="text-h5 pa-4">Share this page</v-card-title>
      <v-card-text class="pa-4">
        <v-row justify="center" class="my-4">
          <v-col
            v-for="platform in sharePlatforms"
            :key="platform.name"
            cols="auto"
            class="text-center"
          >
            <v-btn
              icon="mdi-48px"
              size="large"
              :color="platform.color"
              @click="handleShareTo(platform.name)"
            >
              <v-icon size="32">{{ platform.icon }}</v-icon>
            </v-btn>
            <div class="text-caption mt-2">{{ platform.name }}</div>
          </v-col>
        </v-row>

        <div class="d-flex align-center mt-6">
          <v-text-field
            :model-value="pageUrl"
            @update:model-value="$emit('update:pageUrl', $event)"
            readonly
            label="Page URL"
            variant="outlined"
            density="comfortable"
            hide-details
            class="flex-grow-1"
          ></v-text-field>

          <v-btn
            :color="isCopied ? 'success' : 'primary'"
            class="ml-2"
            @click="handleCopyLink"
            :loading="copyLoading"
          >
            {{ isCopied ? 'Copied!' : 'Copy' }}
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="tonal"
          size="large"
          @click="closeDialog"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useShare } from '~/composables/useShare'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  pageUrl: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'update:pageUrl'])

const { sharePlatforms, shareTo } = useShare()
const isCopied = ref(false)
const copyLoading = ref(false)

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleShareTo = (platform: string) => {
  shareTo(
    platform,
    props.pageUrl,
    `Check out this ${props.entityType}`,
    props.entityType,
    props.entityId
  )
  closeDialog()
}

const handleCopyLink = async () => {
  if (!props.pageUrl) return

  try {
    copyLoading.value = true
    await navigator.clipboard.writeText(props.pageUrl)
    isCopied.value = true

    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
    // Fallback method
    const textarea = document.createElement('textarea')
    textarea.value = props.pageUrl
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      isCopied.value = true
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
    }
    document.body.removeChild(textarea)
  } finally {
    copyLoading.value = false
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.caption {
  font-size: 0.75rem;
  font-weight: 400;
}

:deep(.v-btn--icon) {
  width: 64px !important;
  height: 64px !important;
}
</style>
