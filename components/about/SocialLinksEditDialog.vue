<template>
  <BaseDialog
    v-model="internalDialog"
    title="Edit Social Links"
    max-width="700px"
    :show-close-button="true"
  >
    <div class="social-links-form">
      <!-- Social Platform Cards -->
      <v-row dense>
        <v-col
          v-for="(platform, key) in socialPlatforms"
          :key="key"
          cols="12"
          md="6"
        >
          <v-card
            variant="outlined"
            class="social-platform-card"
            :class="{ active: socialLinksData[key] }"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar size="32" :color="getPlatformColor(key)" class="me-3">
                  <v-icon
                    :icon="getPlatformIcon(key)"
                    color="white"
                    size="18"
                  ></v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <h4 class="text-subtitle-1 mb-0">{{ platform.name }}</h4>
                  <p class="text-caption text-grey mb-0">
                    {{ platform.description }}
                  </p>
                </div>
                <v-btn
                  v-if="socialLinksData[key]"
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="removeSocialLink(key)"
                  :disabled="loading"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>

              <v-text-field
                v-model="socialLinksData[key]"
                :label="`${platform.name} URL`"
                :placeholder="platform.placeholder"
                variant="outlined"
                density="compact"
                :rules="getUrlRules(key)"
                :error-messages="getFieldErrors(key)"
                :disabled="loading"
                hide-details="auto"
                clearable
                @input="clearFieldError(key)"
              >
                <template v-slot:prepend-inner>
                  <v-icon
                    :icon="getPlatformIcon(key)"
                    :color="getPlatformColor(key)"
                    size="18"
                  ></v-icon>
                </template>
              </v-text-field>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bulk Actions -->
      <v-card v-if="hasAnyLinks" variant="tonal" color="warning" class="mt-4">
        <v-card-text class="d-flex align-center justify-space-between pa-4">
          <div>
            <h4 class="text-subtitle-2 mb-1">Quick Actions</h4>
            <p class="text-caption mb-0 text-grey">
              Manage all your social links
            </p>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              variant="outlined"
              size="small"
              color="warning"
              @click="clearAllLinks"
              :disabled="loading"
              prepend-icon="mdi-delete-sweep"
            >
              Clear All
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Preview Section -->
      <v-card v-if="activeLinksCount > 0" variant="outlined" class="mt-4">
        <v-card-title class="text-subtitle-1 py-3">
          <v-icon start size="small">mdi-eye</v-icon>
          Preview ({{ activeLinksCount }} link{{
            activeLinksCount > 1 ? 's' : ''
          }})
        </v-card-title>
        <v-card-text class="pt-0">
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="(link, platform) in activeLinks"
              :key="platform"
              variant="outlined"
              :color="getPlatformColor(platform)"
              size="small"
              :prepend-icon="getPlatformIcon(platform)"
            >
              {{ socialPlatforms[platform]?.name }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <template v-slot:actions>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="closeDialog" :disabled="loading">
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        variant="elevated"
        @click="saveSocialLinks"
        :loading="loading"
        :disabled="!hasChanges"
      >
        Save Changes
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useNuxtApp } from '#app'

const props = defineProps({
  modelValue: Boolean,
  socialLinks: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'links-updated'])

// Composables
const { $axios } = useNuxtApp()

// Reactive data
const internalDialog = ref(props.modelValue)
const loading = ref(false)
const fieldErrors = reactive({})
const originalLinks = ref({})

// Social links data
const socialLinksData = reactive({
  tiktok: '',
  youtube: '',
  instagram: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  telegram: '',
  website: '',
})

// Social platforms configuration
const socialPlatforms = {
  tiktok: {
    name: 'TikTok',
    description: 'Short video platform',
    placeholder: 'https://www.tiktok.com/@username',
  },
  youtube: {
    name: 'YouTube',
    description: 'Video sharing platform',
    placeholder: 'https://www.youtube.com/channel/...',
  },
  instagram: {
    name: 'Instagram',
    description: 'Photo & video sharing',
    placeholder: 'https://www.instagram.com/username',
  },
  facebook: {
    name: 'Facebook',
    description: 'Social networking',
    placeholder: 'https://www.facebook.com/username',
  },
  twitter: {
    name: 'Twitter',
    description: 'Microblogging platform',
    placeholder: 'https://twitter.com/username',
  },
  linkedin: {
    name: 'LinkedIn',
    description: 'Professional network',
    placeholder: 'https://www.linkedin.com/in/username',
  },
  telegram: {
    name: 'Telegram',
    description: 'Messaging platform',
    placeholder: 'https://t.me/username',
  },
  website: {
    name: 'Website',
    description: 'Personal or business site',
    placeholder: 'https://www.yourwebsite.com',
  },
}

// Computed
const activeLinks = computed(() => {
  const links = {}
  Object.keys(socialLinksData).forEach((key) => {
    if (socialLinksData[key]?.trim()) {
      links[key] = socialLinksData[key].trim()
    }
  })
  return links
})

const activeLinksCount = computed(() => {
  return Object.keys(activeLinks.value).length
})

const hasAnyLinks = computed(() => {
  return Object.values(socialLinksData).some((link) => link?.trim())
})

const hasChanges = computed(() => {
  return Object.keys(socialLinksData).some((key) => {
    const current = socialLinksData[key]?.trim() || ''
    const original = originalLinks.value[key]?.trim() || ''
    return current !== original
  })
})

// Methods
const getPlatformIcon = (platform) => {
  const icons = {
    tiktok: 'mdi-music-note',
    youtube: 'mdi-youtube',
    instagram: 'mdi-instagram',
    facebook: 'mdi-facebook',
    twitter: 'mdi-twitter',
    linkedin: 'mdi-linkedin',
    telegram: 'mdi-telegram',
    website: 'mdi-web',
  }
  return icons[platform] || 'mdi-link'
}

const getPlatformColor = (platform) => {
  const colors = {
    tiktok: '#000000',
    youtube: '#FF0000',
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    telegram: '#0088CC',
    website: '#6366F1',
  }
  return colors[platform] || 'primary'
}

const getUrlRules = (platform) => {
  return [
    (value) => {
      if (!value?.trim()) return true // Optional field

      try {
        new URL(value.trim())
        return true
      } catch {
        return 'Please enter a valid URL'
      }
    },
  ]
}

const getFieldErrors = (field) => {
  return fieldErrors[field] || []
}

const clearFieldError = (field) => {
  if (fieldErrors[field]) {
    delete fieldErrors[field]
  }
}

const removeSocialLink = (platform) => {
  socialLinksData[platform] = ''
  clearFieldError(platform)
}

const clearAllLinks = () => {
  Object.keys(socialLinksData).forEach((key) => {
    socialLinksData[key] = ''
  })
  Object.keys(fieldErrors).forEach((key) => {
    delete fieldErrors[key]
  })
}

const resetForm = () => {
  // Reset form data
  Object.keys(socialLinksData).forEach((key) => {
    socialLinksData[key] = props.socialLinks[key] || ''
  })

  // Store original data for comparison
  originalLinks.value = { ...props.socialLinks }

  // Clear errors
  Object.keys(fieldErrors).forEach((key) => {
    delete fieldErrors[key]
  })
}

const saveSocialLinks = async () => {
  if (!hasChanges.value) return

  try {
    loading.value = true

    // Clear previous errors
    Object.keys(fieldErrors).forEach((key) => {
      delete fieldErrors[key]
    })

    // Prepare data (only send non-empty links)
    const dataToSend = {}
    Object.keys(socialLinksData).forEach((key) => {
      dataToSend[key] = socialLinksData[key]?.trim() || null
    })

    const response = await $axios.put('/api/social-links', dataToSend)

    if (response.data.success) {
      emit('links-updated', response.data.data)
      originalLinks.value = { ...activeLinks.value }

      console.log('Social links updated successfully')
    } else {
      throw new Error(response.data.message || 'Failed to update social links')
    }
  } catch (error) {
    console.error('Error updating social links:', error)

    if (error.response?.data?.errors) {
      // Handle validation errors
      const errors = error.response.data.errors
      Object.keys(errors).forEach((field) => {
        fieldErrors[field] = Array.isArray(errors[field])
          ? errors[field]
          : [errors[field]]
      })
    } else {
      // General error - you might want to show a snackbar here
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update social links'
      console.error(message)
    }
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  internalDialog.value = false
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
    if (newVal) {
      resetForm()
    }
  }
)

watch(
  () => props.socialLinks,
  () => {
    resetForm()
  },
  { deep: true }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style scoped>
.social-links-form {
  min-height: 300px;
}

.social-platform-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.social-platform-card.active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.social-platform-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.v-text-field .v-field__prepend-inner) {
  padding-top: 0;
}

@media (max-width: 600px) {
  .social-links-form {
    min-height: 250px;
  }

  :deep(.v-card-text) {
    padding: 12px !important;
  }
}
</style>
