<template>
  <div class="credits-container">
    <!-- Loading State -->
    <template v-if="isLoading && !categoryGroups.length">
      <div v-for="i in 2" :key="`category-${i}`" class="mb-8">
        <v-skeleton-loader type="heading" class="mb-4" width="200" />
        <v-list>
          <v-list-item v-for="j in 3" :key="`credit-${i}-${j}`">
            <v-skeleton-loader type="list-item-avatar-two-line" height="84" />
          </v-list-item>
        </v-list>
      </div>
    </template>

    <!-- Empty State -->
    <EmptyStateCard
      v-else-if="!isLoading && !categoryGroups.length"
      icon="mdi-account-group-outline"
      :title="emptyStateTitle"
      :message="emptyStateMessage"
      v-bind="emptyStateActionProps"
    />

    <!-- Credits List -->
    <template v-else>
      <div
        v-for="group in categoryGroups"
        :key="group.category.id"
        class="category-group mb-8"
      >
        <h2 class="text-h5 mb-4 category-title">{{ group.category.name }}</h2>

        <div class="credits-list">
          <ProjectCreditCard
            v-for="credit in group.credits"
            :key="credit.id"
            :credit="credit"
            variant="compact"
            :show-actions="showActions"
            class="credit-list-item"
            @click="handleCreditClick"
            @edit="handleEditCredit"
            @delete="handleDeleteCredit"
          >
            <template v-if="showTipButton" #action>
              <TipButton
                :entity="credit.user"
                entity-type="user"
                size="small"
                @transaction-complete="() => emit('tip-complete', credit)"
              />
            </template>
          </ProjectCreditCard>
        </div>
      </div>

      <!-- Loading More State -->
      <div class="text-center py-4">
        <v-progress-circular
          v-if="isLoadingMore"
          indeterminate
          color="primary"
          size="24"
        />
        <div v-else-if="!hasMore" class="text-medium-emphasis">
          <v-icon icon="mdi-check-circle" class="mr-2" />
          You've reached the end of the list
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectCreditStore } from '~/stores/useProjectCreditStore'

interface Credit {
  id: number
  user: {
    id: number
    username: string
    display_name: string
    profile_photo: string
    talent: string
  }
  role: {
    id: number | null
    name: string
    is_custom: boolean
    category: {
      id: number
      name: string
    } | null
  }
  status: string
  created_at: string
}

const props = withDefaults(
  defineProps<{
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    showActions?: boolean
    showTipButton?: boolean
    emptyStateTitle?: string
    emptyStateMessage?: string
    showEmptyStateAction?: boolean
    emptyStateActionText?: string
  }>(),
  {}
)

const emit = defineEmits<{
  'delete-credit': [credit: Credit]
  'edit-credit': [credit: Credit]
  'empty-state-action': []
  'tip-complete': [credit: Credit]
  'credit-click': [credit: Credit]
}>()

const handleCreditClick = (event: Event, credit: Credit) => {
  emit('credit-click', credit)
}

const handleEditCredit = (credit: Credit) => {
  emit('edit-credit', credit)
}

const handleDeleteCredit = (credit: Credit) => {
  emit('delete-credit', credit)
}

const store = useProjectCreditStore()
const categoryGroups = computed(() => store.categoryGroups)

// Computed props for empty state
const emptyStateTitle = computed(
  () => props.emptyStateTitle || 'No Cast & Crew Members Yet'
)

const emptyStateMessage = computed(
  () => props.emptyStateMessage || "This project doesn't have any members yet."
)

const emptyStateActionProps = computed(() => {
  if (!props.showEmptyStateAction) return {}

  return {
    actionText: props.emptyStateActionText || 'Add First Member',
    onActionClick: () => emit('empty-state-action'),
  }
})
</script>

<style scoped lang="scss">
.credits-container {
  position: relative;
  min-height: 200px;
}

.category-group {
  .category-title {
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
    margin-bottom: 16px;
  }
}

// List Layout
.credits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  .credit-list-item {
    width: 100%;
    
    // Modern font sizes for compact mode
    :deep(.project-credit-card__name--compact) {
      font-size: 18px !important;
      font-weight: 600 !important;
    }
    
    :deep(.role-text--compact) {
      font-size: 14px !important;
      font-weight: 500 !important;
    }
  }
}

// Smooth transitions
.credits-list {
  transition: all 0.3s ease;
}

// Enhanced loading state
.v-skeleton-loader {
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

// Mobile responsive font size overrides
@media (max-width: 600px) {
  .credit-list-item {
    :deep(.project-credit-card__name--compact) {
      font-size: 16px !important;
    }
    
    :deep(.role-text--compact) {
      font-size: 13px !important;
    }
  }
}

@media (max-width: 480px) {
  .credit-list-item {
    :deep(.project-credit-card__name--compact) {
      font-size: 15px !important;
    }
    
    :deep(.role-text--compact) {
      font-size: 12px !important;
    }
  }
}
</style>
