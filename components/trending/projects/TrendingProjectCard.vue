<template>
  <v-card
    class="trending-project-card"
    :class="[`size-${size}`, { 'no-elevation': !hasElevation }]"
    :elevation="hasElevation ? 2 : 0"
    @click="emitClick"
  >
    <div class="card-content">
      <MediaThumbnail
        :thumbnailUrl="media.thumbnail_url || defaultThumbnail"
        :videoUrl="media.video_url"
        :size="thumbnailSize"
        :viewsCount="media.views_count"
        :showViews="showViews"
        :showDuration="showDuration"
        :label="label"
        :label-variant="labelVariant"
        @click="emitClick"
      />

      <!-- Play button overlay -->
      <div class="play-button-overlay">
        <v-icon icon="mdi-play-circle-outline" size="x-large" />
      </div>

      <div class="content-overlay" v-if="showOverlay">
        <div class="d-flex align-center overlay-content">
          <v-avatar
            v-if="showCreator && media.creator"
            :size="32"
            class="mr-2 creator-avatar"
          >
            <v-img
              :src="media.creator.profile_photo"
              :alt="media.creator.display_name"
            />
          </v-avatar>
          <div class="text-content">
            <h3 class="video-title">
              {{ formattedTitle }}
            </h3>
            <div class="creator-info" v-if="showCreator && media.creator">
              <span class="creator-name">{{ media.creator.display_name }}</span>
            </div>
            <div class="meta-info" v-if="showMeta">
              <slot name="meta">
                <span v-if="media.views_count && !showViews" class="views">
                  {{ formatViews(media.views_count) }} views
                </span>
                <span v-if="media.created_at" class="date">
                  · {{ formatDate(media.created_at) }}
                </span>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>

    <slot name="actions"></slot>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import MediaThumbnail from '~/components/media/MediaThumbnail.vue'
import { useDisplay } from 'vuetify'

// Define the media object type
interface Creator {
  id: string | number
  display_name: string
  profile_photo: string
}

interface MediaItem {
  id: string | number
  name: string
  thumbnail_url?: string
  video_url?: string
  views_count?: number
  created_at?: string | Date
  creator?: Creator
  [key: string]: any // Allow for additional properties
}

type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface SizeConfig {
  thumbnailSize: CardSize
  avatarSize: number
  titleClass: string
  maxTitleLength: number
  titleLines: number
}

// Responsive display
const { mobile, smAndDown, mdAndDown } = useDisplay()

// Responsive size configurations
const sizeConfigs: Record<CardSize, SizeConfig> = {
  xs: {
    thumbnailSize: 'xs',
    avatarSize: 20,
    titleClass: 'text-caption',
    maxTitleLength: 35,
    titleLines: 1,
  },
  sm: {
    thumbnailSize: 'sm',
    avatarSize: 22,
    titleClass: 'text-body-2',
    maxTitleLength: 45,
    titleLines: 1,
  },
  md: {
    thumbnailSize: 'md',
    avatarSize: 24,
    titleClass: 'text-subtitle-2',
    maxTitleLength: 55,
    titleLines: 1,
  },
  lg: {
    thumbnailSize: 'lg',
    avatarSize: 26,
    titleClass: 'text-subtitle-1',
    maxTitleLength: 65,
    titleLines: 1,
  },
  xl: {
    thumbnailSize: 'xl',
    avatarSize: 28,
    titleClass: 'text-h6',
    maxTitleLength: 75,
    titleLines: 1,
  },
  '2xl': {
    thumbnailSize: '2xl',
    avatarSize: 30,
    titleClass: 'text-h5',
    maxTitleLength: 85,
    titleLines: 1,
  },
}

// Component props with extensive customization options
const props = defineProps({
  media: {
    type: Object as PropType<MediaItem>,
    required: true,
  },
  size: {
    type: String as PropType<CardSize>,
    default: 'md',
    validator: (value: string) =>
      ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value),
  },
  label: {
    type: String,
    default: 'Trending',
  },
  labelVariant: {
    type: String,
    default: 'error',
  },
  showViews: {
    type: Boolean,
    default: true,
  },
  showDuration: {
    type: Boolean,
    default: false,
  },
  showCreator: {
    type: Boolean,
    default: true,
  },
  showOverlay: {
    type: Boolean,
    default: true,
  },
  showMeta: {
    type: Boolean,
    default: false,
  },
  hasElevation: {
    type: Boolean,
    default: true,
  },
  customHeight: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits<{
  (e: 'click', media: MediaItem): void
}>()

// Constants
const defaultThumbnail = 'https://via.placeholder.com/450x253'

// Computed properties
const currentSizeConfig = computed(() => sizeConfigs[props.size])

const thumbnailSize = computed(() => {
  // Adjust thumbnail size based on screen size
  if (smAndDown.value && props.size === 'md') {
    return 'sm'
  }
  if (smAndDown.value && props.size === 'lg') {
    return 'md'
  }
  return currentSizeConfig.value.thumbnailSize
})

const avatarSize = computed(() => {
  // Adjust avatar size on small screens
  if (smAndDown.value) {
    return Math.max(24, currentSizeConfig.value.avatarSize - 8)
  }
  return currentSizeConfig.value.avatarSize
})

const titleClass = computed(() => currentSizeConfig.value.titleClass)
const titleLineClass = computed(
  () => `lines-${currentSizeConfig.value.titleLines}`
)

const formattedTitle = computed(() => {
  if (!props.media.name) return ''

  const title = props.media.name.trim()
  const maxLength = currentSizeConfig.value.maxTitleLength

  if (title.length <= maxLength) return title
  return `${title.slice(0, maxLength)}...`
})

// Helper methods for formatting
const formatViews = (views: number) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

const formatDate = (date: string | Date) => {
  if (!date) return ''

  const dateObj = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - dateObj.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} months ago`
  }
  return `${Math.floor(diffDays / 365)} years ago`
}

// Event handlers
const emitClick = () => {
  emit('click', props.media)
}
</script>

<style lang="scss" scoped>
.trending-project-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  cursor: pointer;
  width: 100%;

  &:not(.no-elevation):hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);

    .play-button-overlay {
      opacity: 1;
      transform: scale(1);
    }
  }

  .card-content {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.1),
        transparent 30%
      );
      z-index: 1;
      pointer-events: none;
    }
  }

  .play-button-overlay {
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
    transform: scale(1.1);
    transition: all 0.3s ease;
    z-index: 2;

    .v-icon {
      color: white;
      font-size: 3rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    }
  }

  .content-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.6) 50%,
      transparent 100%
    );
    padding: 16px;
    color: white;
    transition: background 0.3s ease;
    z-index: 3;
  }

  .creator-avatar {
    border: 1px solid rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }

  .text-content {
    flex: 1;
    min-width: 0;
  }

  .video-title {
    margin: 0 0 4px 0;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
    font-weight: 600;
    font-size: 15px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  }

  .creator-name {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  .meta-info {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 3px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  // Size-specific styles
  &.size-xs .content-overlay {
    padding: 12px;
  }

  &.size-sm .content-overlay {
    padding: 14px;
  }

  // Responsive adjustments
  @media (max-width: 960px) {
    .content-overlay {
      padding: 14px;
    }
  }

  @media (max-width: 600px) {
    border-radius: 8px;

    .content-overlay {
      padding: 12px;
    }

    .creator-avatar {
      border-width: 1px;
    }

    .video-title {
      font-size: 14px;
    }

    .creator-name {
      font-size: 12px;
    }

    .play-button-overlay .v-icon {
      font-size: 2.5rem;
    }
  }
}
</style>
