<template>
  <BaseDialog
    v-model="isOpen"
    max-width="600px"
    :show-close-button="true"
    @update:model-value="handleDialogUpdate"
  >
    <template #title>
      <div class="d-flex align-center title-container">
        <span class="text-h6">Share Content</span>
      </div>
    </template>

    <!-- Share Platforms -->
    <div class="share-section">
      <p class="text-body-1 mb-4">Share this content with others via your favorite platform</p>
      <v-row justify="center" class="my-2">
        <v-col
          v-for="platform in sharePlatformsToShow"
          :key="platform.name"
          cols="auto"
          class="text-center share-platform-col"
        >
          <v-tooltip :text="platform.name" location="top">
            <template v-slot:activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                :color="platform.color"
                :loading="shareLoading === platform.name"
                :disabled="shareLoading !== '' || !shareUrl"
                @click="handleShareTo(platform.name)"
                class="share-btn"
                elevation="2"
              >
                <v-icon>{{ platform.icon }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <div class="text-caption mt-1">{{ platform.name }}</div>
        </v-col>
      </v-row>
    </div>

    <!-- Copy Link Section -->
    <div class="copy-section mt-6">
      <p class="text-body-1 mb-2">Or copy the direct link</p>
      <div class="copy-link-container">
        <v-text-field
          :model-value="displayUrl"
          readonly
          hide-details
          density="compact"
          variant="outlined"
          class="copy-link-field"
          append-inner-icon="mdi-content-copy"
          @click:append-inner="handleCopyLink"
          placeholder="Loading URL..."
          :loading="!shareUrl"
          width="100%"
        ></v-text-field>
        <v-btn
          :color="isCopied ? 'success' : 'primary'"
          :loading="copyLoading"
          :disabled="!shareUrl"
          class="copy-btn"
          @click="handleCopyLink"
        >
          {{ isCopied ? 'Copied!' : 'Copy' }}
        </v-btn>
      </div>
    </div>

    <template #actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        class="mr-2"
        @click="handleOpenEmbed"
        variant="text"
      >
        Embed
      </v-btn>
      <v-btn color="secondary" @click="closeDialog" variant="tonal">
        Close
      </v-btn>
    </template>
  </BaseDialog>

  <!-- Success Snackbar -->
  <v-snackbar
    v-model="showSnackbar"
    :color="snackbarColor"
    timeout="3000"
    location="bottom"
  >
    {{ snackbarText }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useShare } from '~/composables/useShare'
import { useRoute } from '#imports'

interface ShareableEntity {
  id?: string | number
  name?: string
  description?: string
  access_uuid?: string
  thumbnail_url?: string
  [key: string]: any
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  shareUrl: {
    type: String,
    required: true,
  },
  shareText: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },
  entityId: {
    type: String,
    default: '',
  },
  entity: {
    type: Object as () => ShareableEntity,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'share-error', error: Error): void
  (e: 'share-success', platform: string): void
  (e: 'open-embed'): void
}>()

const { sharePlatforms, shareTo, copyLink } = useShare()
const route = useRoute()

// State
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isCopied = ref(false)
const copyLoading = ref(false)
const shareLoading = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Computed
const sharePlatformsToShow = computed(() => sharePlatforms)

// Fix for the URL issue - use the current route to generate the correct URL
const displayUrl = computed(() => {
  if (!props.shareUrl) return 'Loading...'
  
  // Get the current URL from the browser
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href
    return currentUrl
  }
  
  // Fallback to constructed URL from route
  if (route.params.access_uuid) {
    return `${window.location.origin}/watch/${route.params.access_uuid}`
  }
  
  return props.shareUrl
})

// Methods
const showNotification = (
  message: string,
  type: 'success' | 'error' = 'success'
) => {
  snackbarText.value = message
  snackbarColor.value = type
  showSnackbar.value = true
}

const handleDialogUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

const closeDialog = () => {
  emit('update:modelValue', false)

  // Reset state
  nextTick(() => {
    isCopied.value = false
    shareLoading.value = ''
    copyLoading.value = false
  })
}

const handleOpenEmbed = () => {
  emit('open-embed')
}

const handleShareTo = async (platform: string) => {
  if (!displayUrl.value || displayUrl.value === 'Loading...') {
    showNotification('Share URL is not available', 'error')
    return
  }

  try {
    shareLoading.value = platform

    await shareTo(
      platform,
      displayUrl.value,
      props.shareText || '',
      props.entityType,
      props.entityId || ''
    )

    emit('share-success', platform)
    showNotification(`Successfully shared to ${platform}`)
  } catch (error) {
    console.error('Error sharing:', error)
    emit('share-error', error as Error)
    showNotification(`Failed to share to ${platform}`, 'error')
  } finally {
    shareLoading.value = ''
  }
}

const handleCopyLink = async () => {
  if (!displayUrl.value || displayUrl.value === 'Loading...') {
    showNotification('Share URL is not available', 'error')
    return
  }

  try {
    copyLoading.value = true

    await copyLink(displayUrl.value)

    isCopied.value = true
    showNotification('Link copied to clipboard!')

    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
    showNotification('Failed to copy link', 'error')
  } finally {
    copyLoading.value = false
  }
}

// Validate entity on mount
onMounted(() => {
  if (!props.entity || typeof props.entity !== 'object') {
    console.warn('ShareProjectDialog received invalid entity:', props.entity)
  }
})
</script>

<style scoped>
.title-container {
  width: calc(100% - 36px);
  max-width: 100%;
  overflow: hidden;
}

.share-section, .copy-section {
  padding: 0 8px;
}

.copy-link-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.copy-link-field {
  flex-grow: 1;
  width: 100%;
}

.share-platform-col {
  padding: 8px 12px;
}

.share-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.share-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.copy-btn {
  min-width: 80px;
}

/* Responsive styles */
@media (max-width: 600px) {
  .share-platform-col {
    padding: 6px;
  }

  .copy-link-container {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .copy-link-field {
    width: 100%;
  }

  .copy-btn {
    width: 100%;
    margin-top: 4px;
  }
}

@media (max-width: 400px) {
  .share-platform-col {
    padding: 4px;
  }
}
</style>