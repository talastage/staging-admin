<template>
  <div>
    <v-btn
      color="primary"
      variant="flat"
      @click="openTipDialog"
      rounded="pill"
      :class="{
        'tip-btn': true,
        [`tip-btn--${size}`]: true,
      }"
      :min-width="size === 'small' ? 80 : size === 'large' ? 120 : 100"
      :disabled="disabled"
      elevation="2"
    >
      <v-icon class="tip-icon" size="small" start> mdi-gift </v-icon>
      <span class="tip-text">Give Tip</span>
    </v-btn>

    <!-- Only mount TipDialog when needed -->
    <Teleport to="body">
      <TipDialog
        v-if="showTipDialog"
        v-model="showTipDialog"
        :entity="entity"
        :entityType="entityType"
        :defaultAmount="defaultAmount"
        @transactionComplete="handleTransactionComplete"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAttrs } from 'vue'

const props = defineProps({
  entity: {
    type: Object,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
    validator: (value: string) => ['user', 'project'].includes(value),
  },
  defaultAmount: {
    type: Number,
    default: 1000,
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const attrs = useAttrs()
const emit = defineEmits(['transactionComplete'])

const showTipDialog = ref(false)
const isLoading = ref(false)
const router = useRouter()

const openTipDialog = async () => {
  isLoading.value = true
  try {
    showTipDialog.value = true
  } finally {
    isLoading.value = false
  }
}

const handleTransactionComplete = (amount: number) => {
  // Close the TipDialog
  showTipDialog.value = false

  // Directly redirect to checkout
  router.push('/checkout')

  // Emit an event if parent components need to know about the transaction
  emit('transactionComplete')
}
</script>

<style lang="scss" scoped>
.tip-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(8px);
  background: rgba(var(--v-theme-primary), 0.95) !important;
  color: white !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.8);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3),
    0 1px 3px rgba(var(--v-theme-primary), 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.4),
      0 2px 6px rgba(var(--v-theme-primary), 0.3);
  }

  &:active {
    transform: translateY(0);
    transition: transform 0.1s ease;
  }

  &--small {
    font-size: 0.75rem;
    padding: 0 14px;
    height: 34px !important;
    min-height: 34px !important;
  }

  &--medium {
    padding: 0 18px;
    height: 38px !important;
    min-height: 38px !important;
    font-size: 0.875rem;
  }

  &--large {
    padding: 0 22px;
    font-size: 0.9rem;
    height: 42px !important;
    min-height: 42px !important;
  }
}

.tip-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 4px;
  color: white;
}

.tip-text {
  font-weight: inherit;
  color: white;
}

/* Dark theme adjustments */
.v-theme--dark .tip-btn {
  background: rgba(var(--v-theme-primary), 0.9) !important;
}

/* Mobile responsive adjustments */
@media (max-width: 600px) {
  .tip-btn {
    &--medium,
    &--large {
      padding: 0 16px;
      font-size: 0.8rem;
      height: 36px !important;
      min-height: 36px !important;
    }

    &--small {
      padding: 0 12px;
      font-size: 0.7rem;
      height: 32px !important;
      min-height: 32px !important;
    }
  }
}
</style>
