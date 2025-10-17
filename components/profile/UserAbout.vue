<template>
  <div class="user-about">
    <!-- Bio Section -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
        <div class="d-flex align-center">
          <v-icon class="me-3" color="primary">mdi-account-circle</v-icon>
          <span class="text-h5">Bio</span>
        </div>
        <v-btn
          v-if="isProfileOwner"
          icon
          variant="text"
          color="primary"
          @click="openBioDialog"
          :disabled="bioLoading"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-0">
        <!-- Bio Loading Skeleton - Defined directly in component -->
        <div v-if="bioLoading" class="bio-skeleton">
          <v-skeleton-loader
            type="paragraph"
            :loading="true"
            class="mb-4"
          ></v-skeleton-loader>
          <v-skeleton-loader
            type="text"
            width="100"
            height="12"
          ></v-skeleton-loader>
        </div>

        <!-- Bio Content -->
        <div v-else-if="userBio" class="bio-content">
          <p
            class="text-body-1 mb-0"
            style="line-height: 1.6; white-space: pre-wrap"
          >
            {{ userBio }}
          </p>
          <div class="text-caption text-grey mt-2">
            {{ bioWordCount }} words
          </div>
        </div>

        <!-- Empty Bio State -->
        <div v-else class="text-center py-8">
          <v-icon size="48" color="grey-lighten-2" class="mb-3">
            mdi-account-edit
          </v-icon>
          <p class="text-body-1 text-grey mb-4">
            {{
              isProfileOwner
                ? 'Tell others about yourself'
                : 'No bio available yet'
            }}
          </p>
          <v-btn
            v-if="isProfileOwner"
            color="primary"
            variant="outlined"
            @click="openBioDialog"
            prepend-icon="mdi-plus"
          >
            Add Bio
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Social Links Section -->
    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
        <div class="d-flex align-center">
          <v-icon class="me-3" color="primary">mdi-link-variant</v-icon>
          <span class="text-h5">Social Links</span>
        </div>
        <v-btn
          v-if="isProfileOwner"
          icon
          variant="text"
          color="primary"
          @click="openSocialDialog"
          :disabled="socialLoading"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-0">
        <!-- Social Links Loading Skeleton - Defined directly in component -->
        <div v-if="socialLoading" class="social-links-skeleton">
          <div class="d-flex flex-wrap gap-3">
            <v-skeleton-loader
              v-for="n in 3"
              :key="n"
              type="chip"
              width="120"
              height="40"
            ></v-skeleton-loader>
          </div>
        </div>

        <!-- Social Links Content -->
        <div v-else-if="Object.keys(socialLinks).length > 0">
          <div class="d-flex flex-wrap gap-3">
            <v-chip
              v-for="(link, platform) in socialLinks"
              :key="platform"
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="primary"
              size="large"
              class="social-chip"
              :prepend-icon="getSocialIcon(platform)"
              clickable
            >
              <span class="text-capitalize font-weight-medium">
                {{ formatSocialPlatform(platform) }}
              </span>
              <v-icon end size="small">mdi-open-in-new</v-icon>
            </v-chip>
          </div>
        </div>

        <!-- Empty Social Links State -->
        <div v-else class="text-center py-8">
          <v-icon size="48" color="grey-lighten-2" class="mb-3">
            mdi-link-plus
          </v-icon>
          <p class="text-body-1 text-grey mb-4">
            {{
              isProfileOwner
                ? 'Connect your social accounts'
                : 'No social links available yet'
            }}
          </p>
          <v-btn
            v-if="isProfileOwner"
            color="primary"
            variant="outlined"
            @click="openSocialDialog"
            prepend-icon="mdi-plus"
          >
            Add Social Links
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Bio Edit Dialog -->
    <BioEditDialog
      v-model="bioDialog"
      :bio="userBio"
      @bio-updated="handleBioUpdated"
    />

    <!-- Social Links Edit Dialog -->
    <SocialLinksEditDialog
      v-model="socialDialog"
      :social-links="socialLinks"
      @links-updated="handleSocialLinksUpdated"
    />

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="errorSnackbar"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="errorSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useProfileOwnership } from '@/composables/useProfileOwnership'
import { useUserAbout } from '@/composables/useUserAbout'
import { useBioManager } from '@/composables/useBioManager'
import { useSocialLinksManager } from '@/composables/useSocialLinksManager'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

// Composables
const { $axios } = useNuxtApp()
const { isProfileOwner } = useProfileOwnership(props.username)
const {
  userBio,
  socialLinks,
  loading: aboutLoading,
  error: aboutError,
  fetchUserAbout,
} = useUserAbout(props.username)
const { getBioWordCount } = useBioManager()

// Reactive data
const bioLoading = ref(true)
const socialLoading = ref(true)
const bioDialog = ref(false)
const socialDialog = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')

// Computed
const bioWordCount = computed(() => {
  return getBioWordCount(userBio.value)
})

// Methods
const fetchUserAboutData = async () => {
  try {
    bioLoading.value = true
    socialLoading.value = true

    await fetchUserAbout()

    if (aboutError.value) {
      throw new Error(aboutError.value)
    }
  } catch (err) {
    showError(err.message || 'Failed to load user information')
    console.error('Error fetching user about:', err)
  } finally {
    bioLoading.value = false
    socialLoading.value = false
  }
}

const openBioDialog = () => {
  bioDialog.value = true
}

const openSocialDialog = () => {
  socialDialog.value = true
}

const handleBioUpdated = (newBio) => {
  userBio.value = newBio
  bioDialog.value = false
}

const handleSocialLinksUpdated = (newLinks) => {
  socialLinks.value = newLinks
  socialDialog.value = false
}

const showError = (message) => {
  errorMessage.value = message
  errorSnackbar.value = true
}

const formatSocialPlatform = (platform) => {
  const platformNames = {
    tiktok: 'TikTok',
    youtube: 'YouTube',
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    website: 'Website',
  }
  return (
    platformNames[platform] ||
    platform.charAt(0).toUpperCase() + platform.slice(1)
  )
}

const getSocialIcon = (platform) => {
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

// Watchers
watch(
  () => props.username,
  () => {
    if (props.username) {
      fetchUserAboutData()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.username) {
    fetchUserAboutData()
  }
})
</script>

<style scoped>
.user-about {
  max-width: 800px;
  margin: 0 auto;
}

.bio-content {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.social-chip {
  height: 40px !important;
  transition: all 0.2s ease;
}

.social-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Skeleton styles */
.bio-skeleton,
.social-links-skeleton {
  min-height: 100px;
}

@media (max-width: 600px) {
  .user-about {
    margin: 0;
  }

  .social-chip {
    flex: 1 1 calc(50% - 8px);
    min-width: 140px;
  }
}

@media (max-width: 400px) {
  .social-chip {
    flex: 1 1 100%;
  }
}
</style>
