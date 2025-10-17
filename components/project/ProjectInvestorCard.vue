<template>
  <BaseCard v-if="investor" class="project-investor-card">
    <div class="project-investor-card__content">
      <div class="project-investor-card__profile">
        <!-- Safely check that investorable is not null before passing to PageAvatar -->
        <PageAvatar
          v-if="
            investor.investorable_type.endsWith('Page') &&
            investor.investorable !== null
          "
          :page="investor.investorable"
          size="lg"
          class="project-investor-card__avatar"
        />
        <!-- Otherwise, if "App\\Models\\User", show user avatar (also check investorable) -->
        <UserAvatar
          v-else-if="
            investor.investorable_type.endsWith('User') &&
            investor.investorable !== null
          "
          :username="investor.investorable.username || ''"
          :profile_photo="investor.investorable.profile_photo || ''"
          size="lg"
          class="project-investor-card__avatar"
        />
        <!-- Fallback if there's no recognized type or investorable is null -->
        <div v-else class="missing-investorable">
          <p>Unknown or missing investor data</p>
        </div>

        <div class="project-investor-card__info">
          <h3 class="text-h6 font-weight-medium mb-1">
            {{
              investor.investorable?.display_name ||
              investor.investorable?.name ||
              'N/A'
            }}
          </h3>
          <span
            class="text-subtitle-2 text-medium-emphasis d-flex align-center"
          >
            <v-icon size="small" class="mr-1">mdi-at</v-icon>
            {{
              investor.investorable?.username ||
              investor.investorable?.slug ||
              'N/A'
            }}
          </span>
        </div>
      </div>

      <div class="project-investor-card__details">
        <!-- Share Percentage -->
        <div class="project-investor-card__share">
          <div class="share-percentage">
            <span class="text-h5 font-weight-bold">
              {{ formatPercentage(investor.share_percentage) }}
            </span>
            <span class="text-subtitle-1 text-medium-emphasis">%</span>
          </div>
          <span class="text-caption text-medium-emphasis">
            Share Percentage
          </span>
        </div>

        <!-- Status Badge -->
        <StatusBadge
          :status="investor.status"
          class="project-investor-card__status"
        />
      </div>

      <!-- Actions slot for parent to insert custom buttons -->
      <div class="project-investor-card__actions">
        <slot name="actions" />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
interface ProjectInvestor {
  id: number
  project_id: number
  investorable_type: string
  investorable_id: number
  share_percentage: number
  status: string
  type?: string
  approved_at?: string | null
  rejected_at?: string | null
  created_at?: string
  updated_at?: string
  // If loaded from backend, we can have a nested 'investorable' object:
  investorable?: {
    id: number
    username?: string
    display_name?: string
    profile_photo?: string
    // For pages:
    name?: string
    slug?: string
    avatar_url?: string
    type?: string
  } | null
}

const props = defineProps<{
  investor: ProjectInvestor
}>()

// Simple formatting
const formatPercentage = (value: number): string => value.toFixed(2)
const formatEarnings = (value = 0, symbol = ''): string =>
  `${symbol} ${value.toFixed(2)}`
</script>

<style scoped lang="scss">
.project-investor-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }
  &__content {
    display: grid;
    grid-template-columns: minmax(200px, 2fr) minmax(250px, 1fr) auto;
    gap: 1rem;
    align-items: center;
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
  &__profile {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  &__avatar {
    flex-shrink: 0;
  }
  &__info {
    min-width: 0;
    h3 {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  &__details {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    @media (max-width: 768px) {
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }
  &__share,
  &__earnings {
    display: flex;
    flex-direction: column;
    align-items: center;
    .share-percentage {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }
  }
  &__status {
    flex-shrink: 0;
  }
  &__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    @media (max-width: 768px) {
      justify-content: flex-start;
    }
  }
}
.missing-investorable {
  font-style: italic;
  color: var(--v-theme-on-surface-variant);
}
</style>
