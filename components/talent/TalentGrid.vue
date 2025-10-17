<template>
  <div class="talent-grid">
    <v-container class="pa-0">
      <!-- 
        1) Main row for talents
      -->
      <v-row class="talent-grid__row">
        <!-- A) Render each talent -->
        <v-col
          v-for="talent in talents"
          :key="talent.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="talent-grid__col"
        >
          <UserTalentCard :user="talent" :size="cardSize" />
        </v-col>

        <!-- B) Skeleton Loaders when isLoading -->
        <template v-if="isLoading && !talents.length">
          <v-col
            v-for="n in 8"
            :key="`skeleton-${n}`"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="talent-grid__col"
          >
            <TalentCardSkeleton :size="cardSize" />
          </v-col>
        </template>

        <!-- Loading more indicators -->
        <template v-if="isLoading && talents.length">
          <v-col
            v-for="n in 4"
            :key="`loading-more-${n}`"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="talent-grid__col"
          >
            <TalentCardSkeleton :size="cardSize" />
          </v-col>
        </template>
      </v-row>

      <!-- C) Empty State -->
      <v-row v-if="!isLoading && talents.length === 0">
        <v-col cols="12" class="text-center py-12">
          <slot name="empty-state">
            <!-- Fallback if no slot provided -->
            <EmptyStateCard
              title="No Talents Found"
              message="We haven't found any talents in this category right now."
            />
          </slot>
        </v-col>
      </v-row>

      <!-- D) End of Results -->
      <v-row v-if="!isLoading && !hasMorePages && talents.length > 0">
        <v-col cols="12" class="text-center py-4">
          <p class="text-body-2 text-grey-darken-1">
            You've reached the end of the list
          </p>
        </v-col>
      </v-row>

      <!-- E) Intersection Observer Target (for infinite scroll) -->
      <div
        v-if="hasMorePages"
        ref="intersectionTarget"
        class="intersection-target"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  talents: any[]
  isLoading?: boolean
  hasMorePages?: boolean
  cardSize?: 'small' | 'medium' | 'large'
}

// Default props
const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasMorePages: false,
  cardSize: 'medium',
})

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const intersectionTarget = ref<HTMLElement | null>(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && props.hasMorePages && !props.isLoading) {
        emit('load-more')
      }
    },
    {
      threshold: 0.1,
      rootMargin: '100px',
    }
  )

  if (intersectionTarget.value) {
    observer.observe(intersectionTarget.value)
  }

  onBeforeUnmount(() => {
    observer.disconnect()
  })
})
</script>

<style scoped>
.talent-grid {
  position: relative;
  width: 100%;
}

.talent-grid__row {
  margin: 0;
}

.talent-grid__col {
  display: flex;
  justify-content: center;
  padding: 8px;
}

.intersection-target {
  width: 100%;
  height: 10px;
  margin-top: 16px;
}
</style>