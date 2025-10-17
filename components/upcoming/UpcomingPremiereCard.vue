<template>
  <v-card
    class="upcoming-premiere-card"
    :elevation="2"
    :loading="loading"
    @click="navigateToPremiere"
  >
    <!-- Thumbnail Container -->
    <div class="upcoming-premiere-card__thumbnail-container">
      <MediaThumbnail
        :thumbnailUrl="premiere.thumbnail_url"
        :videoUrl="premiere.video_url"
        :showViews="false"
        :showDuration="true"
        size="2xl"
        class="upcoming-premiere-card__thumbnail"
      />

      <!-- Premiere Time Overlay (using reusable component) -->
      <UpcomingPremiereNotifyMeCard
        v-if="showPremiereBadge"
        :premiereDate="premiere.premiering.localized"
        :showNotifyButton="showNotifyButton"
        :isNotified="isNotified"
        :notifyLoading="isLoading"
        position="bottom"
        :useCountdown="false"
        @notifyToggle="handleNotificationToggle"
      />
      
      <!-- Play button overlay -->
      <div class="upcoming-premiere-card__play-overlay">
        <v-icon icon="mdi-play-circle" size="x-large" color="white" />
      </div>
    </div>

    <!-- Content Wrapper -->
    <div class="upcoming-premiere-card__wrapper">
      <!-- User Avatar -->
      <div
        class="upcoming-premiere-card__avatar-container"
        v-if="premiere.creator"
      >
        <UserAvatar
          :username="premiere.creator.username"
          :profile_photo="premiere.creator.profile_photo"
          :size="40"
          class="upcoming-premiere-card__avatar"
        />
      </div>

      <!-- Info Container -->
      <div class="upcoming-premiere-card__info-container">
        <!-- Title Container -->
        <div class="upcoming-premiere-card__title-container">
          <h3 class="upcoming-premiere-card__title">
            {{ premiere.name }}
          </h3>
        </div>

        <!-- Creator Container -->
        <div class="upcoming-premiere-card__creator-container">
          <span class="upcoming-premiere-card__creator-name">
            {{ premiere.creator?.display_name }}
          </span>
          
          <div class="upcoming-premiere-card__premiere-badge" v-if="premiere?.premiering?.is_future">
            <v-icon icon="mdi-clock-outline" size="x-small" class="mr-1" />
            <span>Premiering soon</span>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useUpcomingPremiereNotificationStore } from '@/stores/useUpcomingPremiereNotificationStore'

interface Creator {
  username: string
  display_name: string
  profile_photo: string
}

interface Premiere {
  id: number
  access_uuid: string
  name: string
  thumbnail_url: string
  video_url: string
  premiering_start_date: string
  premiering_time: string
  time_zone: string
  is_notified: boolean
  status: 'published' | 'draft' | 'pending'
  payment_status: 'pending' | 'completed' | 'failed'
  premiering: {
    utc: string
    localized: string
    timezone: string
    is_future: boolean
  }
  creator?: Creator
}

interface PremiereProps {
  premiere: Premiere
  loading?: boolean
  showPremiereBadge?: boolean
}

const props = withDefaults(defineProps<PremiereProps>(), {
  loading: false,
  showPremiereBadge: true,
})

const snackStore = useSnackMessageStore()
const upcomingPremiereNotificationStore = useUpcomingPremiereNotificationStore()
const { $protectedAction } = useNuxtApp()

// Check if the user has toggled "Notify Me" for this premiere
const isNotified = computed(() =>
  upcomingPremiereNotificationStore.isNotified(props.premiere.id)
)
const isLoading = computed(() =>
  upcomingPremiereNotificationStore.isLoading(props.premiere.id)
)

// Show "Notify Me" only if it's a future premiere, published, and paid
const showNotifyButton = computed(() => {
  return Boolean(
    props.premiere?.premiering?.is_future &&
      props.premiere?.status === 'published' &&
      props.premiere?.payment_status === 'completed'
  )
})

// Initialize the notification state on mount
onMounted(() => {
  if (props.premiere.is_notified) {
    upcomingPremiereNotificationStore.setNotificationStatus(
      props.premiere.id,
      true
    )
  }
})

// Toggle notifications (protected action)
const handleNotificationToggle = async (event: MouseEvent) => {
  await $protectedAction(
    async () => {
      try {
        await upcomingPremiereNotificationStore.toggleNotification(
          props.premiere
        )
        snackStore.success(
          upcomingPremiereNotificationStore.isNotified(props.premiere.id)
            ? 'You will be notified when this premiere starts'
            : 'Notification removed successfully'
        )
      } catch (error) {
        snackStore.error('Failed to update notification settings')
        console.error('Notification toggle error:', error)
      }
    },
    { requiresAuth: true }
  )
}

// Navigate to the watch page
const navigateToPremiere = () => {
  navigateTo(`/watch/${props.premiere.access_uuid}`)
}
</script>

<style lang="scss" scoped>
.upcoming-premiere-card {
  background: #ffffff;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    
    .upcoming-premiere-card__play-overlay {
      opacity: 1;
    }
    
    .upcoming-premiere-card__thumbnail {
      transform: scale(1.05);
    }
  }

  &__thumbnail-container {
    position: relative;
    overflow: hidden;
    margin-bottom: 0;
    aspect-ratio: 16/9;
  }
  
  &__thumbnail {
    transition: transform 0.5s ease;
  }
  
  &__play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
    
    .v-icon {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      transform: scale(1.2);
    }
  }

  &__wrapper {
    display: flex;
    gap: 12px;
    padding: 16px;
  }

  &__avatar-container {
    flex-shrink: 0;
  }

  &__info-container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__title-container {
    margin-bottom: 8px;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: #121212;
  }

  &__creator-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__creator-name {
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.7);
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &__premiere-badge {
    display: inline-flex;
    align-items: center;
    background-color: rgba(25, 118, 210, 0.1);
    color: #1976d2;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    width: fit-content;
  }

  // Responsive adjustments
  @media (max-width: 600px) {
    border-radius: 12px;
    
    &__wrapper {
      padding: 12px;
    }

    &__title {
      font-size: 1rem;
    }

    &__creator-name {
      font-size: 0.85rem;
    }
  }

  // Dark mode
  :deep(.v-theme--dark) & {
    background: #1e1e1e;
    
    &__title {
      color: rgba(255, 255, 255, 0.95);
    }

    &__creator-name {
      color: rgba(255, 255, 255, 0.7);
    }
    
    &__premiere-badge {
      background-color: rgba(64, 158, 255, 0.15);
      color: #64b5f6;
    }
  }
}
</style>