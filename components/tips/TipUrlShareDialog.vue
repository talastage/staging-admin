<template>
  <BaseDialog
    v-model="dialog"
    title="Share Tip Link"
    max-width="500px"
    :persistent="isSharing"
  >
    <!-- Main Content -->
    <div class="share-content">
      <!-- Header Section -->
      <div class="text-center mb-4">
        <h3 class="text-h6 mb-2">Share Your Tip Link</h3>
        <p class="text-body-2 text-medium-emphasis">
          Share with your fans to receive tips and support
        </p>
      </div>

      <!-- URL Copy Section -->
      <v-card variant="outlined" class="url-card mb-4">
        <div class="url-container pa-3">
          <div class="url-preview mb-3">
            <div class="text-caption text-medium-emphasis mb-1">Your Tip URL</div>
            <div class="url-text">{{ tipUrl }}</div>
          </div>
          <v-btn
            :loading="copying"
            :color="copyButtonProps.color"
            :disabled="isSharing"
            variant="tonal"
            block
            @click="handleCopyLink"
          >
            <v-icon :icon="copyButtonProps.icon" class="mr-2" />
            {{ copyButtonProps.text }}
          </v-btn>
        </div>
      </v-card>

      <!-- Social Share Section -->
      <div class="share-platforms">
        <h4 class="text-subtitle-1 mb-3 text-center">Share on Social Media</h4>
        
        <!-- Mobile-optimized grid -->
        <div class="platforms-grid">
          <v-btn
            v-for="platform in sortedPlatforms"
            :key="platform.name"
            :color="platform.color"
            :loading="isSharing && activeShare === platform.name"
            :disabled="isSharing"
            class="share-btn"
            variant="elevated"
            @click="handleShare(platform)"
          >
            <v-icon :icon="platform.icon" size="20" />
            <span class="btn-text">{{ platform.name }}</span>
          </v-btn>
        </div>

        <!-- Share Stats -->
        <div v-if="shareStats" class="share-stats mt-3 text-center">
          <div class="text-caption text-medium-emphasis">
            Shared {{ shareStats.total }} times
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Actions -->
    <template #actions>
      <v-btn
        color="primary"
        variant="tonal"
        block
        :disabled="isSharing"
        @click="handleClose"
      >
        Done
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useShare, type SharePlatform } from '~/composables/useShare'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

interface ShareStats {
  total: number
  platforms?: Record<string, number>
}

const props = defineProps({
  modelValue: Boolean,
  entityType: {
    type: String,
    required: true,
    validator: (value: string) => ['user', 'project'].includes(value),
  },
  entity: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

// Composables
const snack = useSnackMessageStore()
const { sharePlatforms, shareTo, copyLink, isSharing } = useShare()

// State
const copying = ref(false)
const activeShare = ref('')
const shareStats = ref<ShareStats | null>(null)
const isLoadingStats = ref(false)
const copySuccess = ref(false)

// Dialog Control
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Computed Properties
const identifier = computed(() => {
  return props.entityType === 'user'
    ? props.entity.username
    : props.entity.access_uuid
})

const tipUrl = computed(() => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://talastage.com'
  return `${frontendUrl}/tip/${props.entityType}/${identifier.value}`
})

const shareText = computed(() => {
  if (props.entityType === 'project') {
    return `🎬 Check out my latest project! Your support means the world to me:`
  }

  return `🎭 Support my talent and creative journey! Every tip helps me grow:`
})

const whatsappText = computed(() => {
  if (props.entityType === 'project') {
    return `🎬 Hey! I just launched my new project and would love your support! You can help me by tipping here:`
  }

  return `🎭 Hey! You can support my talent by clicking this link - every tip helps me pursue my passion:`
})

const copyButtonProps = computed(() => {
  if (copying.value) {
    return {
      color: 'primary',
      icon: 'mdi-loading mdi-spin',
      text: 'Copying...',
    }
  }
  if (copySuccess.value) {
    return {
      color: 'success',
      icon: 'mdi-check-circle',
      text: 'Copied!',
    }
  }
  return {
    color: 'primary',
    icon: 'mdi-content-copy',
    text: 'Copy Link',
  }
})

// Sort platforms to ensure preferred order
const sortedPlatforms = computed(() => {
  const preferredOrder = [
    'WhatsApp',
    'X',
    'Facebook',
    'LinkedIn',
    'Telegram',
    'Email',
  ]

  return [...sharePlatforms].sort((a, b) => {
    const indexA = preferredOrder.indexOf(a.name)
    const indexB = preferredOrder.indexOf(b.name)
    return indexA - indexB
  })
})

// Methods
const handleCopyLink = async () => {
  if (copying.value) return

  try {
    copying.value = true
    await copyLink(tipUrl.value)
    copySuccess.value = true
    snack.success('Link copied to clipboard!')
  } catch (err) {
    snack.error('Failed to copy link. Please try again.')
    copySuccess.value = false
  } finally {
    copying.value = false
    // Reset success state after delay
    if (copySuccess.value) {
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    }
  }
}

const handleShare = async (platform: SharePlatform) => {
  if (isSharing.value || activeShare.value) return

  activeShare.value = platform.name

  try {
    // Use WhatsApp-specific text for WhatsApp sharing
    const text =
      platform.name === 'WhatsApp' ? whatsappText.value : shareText.value

    await shareTo(
      platform.name,
      tipUrl.value,
      text,
      props.entityType,
      identifier.value
    )

    await fetchShareStats()
  } catch (error) {
    console.error('Share error:', error)
    snack.error(`Unable to share on ${platform.name}. Please try again.`)
  } finally {
    setTimeout(() => {
      activeShare.value = ''
    }, 1000)
  }
}

const fetchShareStats = async () => {
  if (isLoadingStats.value) return

  try {
    isLoadingStats.value = true
    const response = await fetch(
      `/api/share/${props.entityType}/${identifier.value}/stats`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch share stats')
    }

    shareStats.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch share stats:', error)
    shareStats.value = null
  } finally {
    isLoadingStats.value = false
  }
}

const handleClose = () => {
  if (isSharing.value || activeShare.value) return
  dialog.value = false
}

// Watchers
watch(
  () => dialog.value,
  async (newVal) => {
    if (newVal) {
      await fetchShareStats()
      // Reset states when dialog opens
      copySuccess.value = false
      activeShare.value = ''
    }
  }
)

// Cleanup
onBeforeUnmount(() => {
  activeShare.value = ''
  copySuccess.value = false
})

// Expose necessary methods/properties
defineExpose({
  refresh: fetchShareStats,
})
</script>

<style lang="scss" scoped>
.share-content {
  padding: 1rem;
}

.url-card {
  border: 1px solid var(--v-border-color);
  background-color: var(--v-theme-surface-variant);
}

.url-container {
  .url-preview {
    .url-text {
      font-family: monospace;
      font-size: 0.8rem;
      color: var(--v-theme-on-surface);
      word-break: break-all;
      line-height: 1.3;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }
  }
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.share-btn {
  height: 48px;
  text-transform: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  .btn-text {
    font-size: 0.875rem;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.share-stats {
  border-top: 1px solid var(--v-border-color);
  padding-top: 0.75rem;
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .share-content {
    padding: 0.75rem;
  }
  
  .url-container {
    padding: 12px !important;
  }
  
  .url-text {
    font-size: 0.75rem !important;
  }
  
  .platforms-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .share-btn {
    height: 44px;
    
    .btn-text {
      font-size: 0.8rem;
    }
  }
}

@media (max-width: 360px) {
  .share-content {
    padding: 0.5rem;
  }
  
  .text-h6 {
    font-size: 1.1rem !important;
  }
  
  .text-body-2 {
    font-size: 0.8rem !important;
  }
}
</style>