<template>
  <div class="profile-header-fixed">
    <!-- Loading State -->
    <div v-if="profileStore.loading" class="loading-state">
      <v-skeleton-loader type="avatar, sentences" class="compact-skeleton" />
    </div>

    <!-- Error State -->
    <div v-else-if="profileStore.error" class="error-state">
      <v-alert type="error" variant="tonal" density="compact">
        Error loading profile. Please try again.
      </v-alert>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profileStore.userProfile" class="profile-content">
      <div class="profile-main">
        <!-- Avatar -->
        <UserProfilePhoto
          :user="profileStore.userProfile"
          :size="isMobile ? 64 : 80"
          class="profile-avatar"
        />

        <!-- Profile Info -->
        <div class="profile-info">
          <div class="profile-name-row">
            <h1 class="profile-name">{{ profileStore.userProfile.display_name }}</h1>
            <div v-if="hasTalent" class="creator-badge">
              <v-icon size="14" color="primary">mdi-star</v-icon>
              <span>{{ talentName }}</span>
            </div>
          </div>
          
          <div v-if="isProfileOwner" class="username">@{{ profileStore.userProfile.username }}</div>
          
          <!-- Stats Row -->
          <div class="stats-row">
            <FansChip v-if="hasTalent" :user="profileStore.userProfile" size="small" />
            <FanningChip :user="profileStore.userProfile" size="small" />
          </div>
        </div>

        <!-- Actions -->
        <div class="profile-actions">
          <FanButton
            v-if="!isProfileOwner"
            :username="profileStore.userProfile.username"
            @fanningUpdated="handleFanningUpdated"
            size="small"
            density="compact"
          />
          <TipButton
            v-if="hasTalent && !isProfileOwner"
            :entity="profileStore.userProfile"
            entityType="user"
            @transactionComplete="handleTipComplete"
            size="small"
          />
          <ShareTipUrlButton
            v-if="showShareTipButton"
            :entity="profileStore.userProfile"
            entityType="user"
            size="small"
          />
          <BookingContactButton
            v-if="hasTalent"
            :user="profileStore.userProfile"
            size="small"
          />
          <MoreBtn
            v-if="menuItems.length > 0"
            :menuList="menuItems"
            @select="handleMenuSelect"
          />
        </div>
      </div>
    </div>



    <!-- Tip Success Dialog -->
    <v-dialog v-model="showTipSuccessDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-center">
          <v-icon color="success" size="32" class="mr-2">mdi-check-circle</v-icon>
          Thank You!
        </v-card-title>
        <v-card-text class="text-center">
          Your tip of {{ formattedTipAmount }} has been successfully sent to
          {{ profileStore.userProfile?.display_name }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeTipSuccessDialog" variant="elevated" block>
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useProfileStore } from '@/stores/useProfileStore'
import { useProfileOwnership } from '@/composables/useProfileOwnership'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const { mobile } = useDisplay()
const profileStore = useProfileStore()
const { isProfileOwner } = useProfileOwnership(props.username)
const { currencyFormatter } = useCurrencyFormatter()

const isMobile = computed(() => mobile.value)

// Computed properties for talent state based on profileStore data
const hasTalent = computed(() => {
  return profileStore.userProfile?.has_talent === 'yes'
})

const talentName = computed(() => {
  return profileStore.userProfile?.talent || ''
})

const isTalentUndecided = computed(() => {
  return profileStore.userProfile?.has_talent === 'undecided'
})

const showTipSuccessDialog = ref(false)
const tipAmount = ref(0)

const formattedTipAmount = computed(() => currencyFormatter(tipAmount.value))

const showShareTipButton = computed(() => {
  return isProfileOwner.value && hasTalent.value
})

const menuItems = computed(() => {
  const items = []
  
  if (isProfileOwner.value && (hasTalent.value || isTalentUndecided.value)) {
    items.push({
      title: hasTalent.value ? 'Manage Creator Profile' : 'Become a Creator',
      action: 'settings'
    })
  }
  
  if (isProfileOwner.value && hasTalent.value) {
    items.push({
      title: 'Manage Projects',
      action: 'projects'
    })
  }
  
  return items
})

const handleMenuSelect = (item) => {
  if (item.action === 'settings') {
    navigateTo('/account/settings')
  } else if (item.action === 'projects') {
    navigateTo('/studio/projects/manage-projects')
  }
}

onMounted(async () => {
  if (props.username) {
    const userExists = await profileStore.fetchProfile(props.username)
    if (!userExists) {
      // Redirect to user not found page if user doesn't exist
      navigateTo('/user-not-found')
    }
  }
})

watch(
  () => props.username,
  async (newUsername) => {
    if (newUsername) {
      const userExists = await profileStore.fetchProfile(newUsername)
      if (!userExists) {
        // Redirect to user not found page if user doesn't exist
        navigateTo('/user-not-found')
      }
    }
  },
  { immediate: true }
)

function handleFanningUpdated(newFanningState: boolean, newFanCount: number) {
  try {
    if (profileStore.userProfile) {
      profileStore.userProfile.is_fanned_by_auth_user = newFanningState
    }
  } catch (error) {
    console.error('Error updating fanning state:', error)
  }
}

const handleTipComplete = (amount: number) => {
  if (amount) {
    tipAmount.value = amount
    showTipSuccessDialog.value = true
  }
}

const closeTipSuccessDialog = () => {
  showTipSuccessDialog.value = false
  tipAmount.value = 0
}

defineExpose({
  showTipSuccessDialog,
  closeTipSuccessDialog,
})
</script>

<style lang="scss" scoped>
.profile-header-fixed {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  min-height: 80px;
}

.loading-state, .error-state {
  padding: 16px;
}

.compact-skeleton {
  max-width: 300px;
}

.profile-content {
  width: 100%;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.creator-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 12px;
  font-size: 0.75rem;
  color: #1976d2;
  white-space: nowrap;
}

.username {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.stats-row {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.profile-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .profile-header-fixed {
    padding: 8px 12px;
    min-height: 72px;
  }
  
  .profile-main {
    gap: 8px;
  }
  
  .profile-name {
    font-size: 1.1rem;
  }
  
  .stats-row {
    gap: 4px;
  }
}


</style>
