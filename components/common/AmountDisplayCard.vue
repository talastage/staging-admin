<!-- components/common/AmountDisplayCard.vue -->
<template>
  <BaseCard :elevation="elevated ? 2 : 0" class="amount-display">
    <div :class="['pa-4', variant === 'primary' ? 'bg-primary' : 'bg-surface']">
      <!-- Header with Title -->
      <div class="d-flex align-center mb-2">
        <v-icon
          v-if="icon"
          :icon="icon"
          size="small"
          :color="variant === 'primary' ? 'white' : 'medium-emphasis'"
          class="mr-2"
        />
        <span
          :class="variant === 'primary' ? 'text-white' : 'text-medium-emphasis'"
          class="text-subtitle-1"
        >
          {{ title }}
        </span>
        <v-tooltip location="top" v-if="tooltip">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              icon="mdi-information"
              size="small"
              :color="variant === 'primary' ? 'white' : 'medium-emphasis'"
              class="ms-1"
            />
          </template>
          {{ tooltip }}
        </v-tooltip>
      </div>

      <!-- Amount Display -->
      <div class="d-flex align-center mb-2">
        <span
          class="text-h5 font-weight-bold"
          :class="variant === 'primary' ? 'text-white' : ''"
        >
          {{ formattedAmount }}
        </span>
      </div>

      <!-- Footer Slot -->
      <div
        v-if="$slots.footer"
        class="d-flex align-center justify-space-between mt-2"
      >
        <slot name="footer" :variant="variant" />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'

interface Props {
  title: string
  amount: number
  currencySymbol: string
  currencyCode: string
  icon?: string
  tooltip?: string
  variant?: 'default' | 'primary'
  elevated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currencySymbol: 'RWF',
  currencyCode: 'RWF',
  variant: 'default',
  elevated: true,
})

const { currencyFormatter } = useCurrencyFormatter()

const formattedAmount = computed((): string => {
  const formatted = currencyFormatter(
    props.amount,
    props.currencySymbol,
    props.currencyCode
  )
  return formatted ?? `${props.currencySymbol} ${props.amount.toFixed(2)}`
})
</script>

<style scoped>
.amount-display {
  transition: transform 0.2s ease;
  min-width: 200px;
}

.amount-display:hover {
  transform: translateY(-2px);
}

:deep(.v-card-item) {
  padding: 0 !important;
}
</style>
