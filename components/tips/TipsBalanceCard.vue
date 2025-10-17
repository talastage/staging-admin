<!-- components/tips/TipsBalanceCard.vue -->
<template>
  <v-card elevation="10" class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Balance</span>
      <v-chip color="primary" variant="elevated">
        {{ tipsBalanceStore.balance?.balance?.formatted || '0' }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <div class="text-subtitle-2">Total Earned</div>
          <div class="text-h6">
            {{ tipsBalanceStore.balance?.total_earned?.formatted || '0' }}
          </div>
          <div class="text-caption">
            Last earned:
            {{ formatRelativeDate(tipsBalanceStore.balance?.last_earning_at) }}
          </div>
        </v-col>
        <v-col cols="6">
          <div class="text-subtitle-2">Total Withdrawn</div>
          <div class="text-h6">
            {{ tipsBalanceStore.balance?.total_withdrawn?.formatted || '0' }}
          </div>
          <div class="text-caption">
            Last withdrawal:
            {{
              formatRelativeDate(tipsBalanceStore.balance?.last_withdrawal_at)
            }}
          </div>
        </v-col>
      </v-row>

      <!-- Add Transfer to Wallet Button -->
      <v-row class="mt-2">
        <v-col cols="12">
          <AmountDisplayCard
            v-if="tipsBalanceStore.balance?.currency"
            title="Available Balance"
            :amount="Number(tipsBalanceStore.balance?.balance?.amount || 0)"
            :currency-symbol="tipsBalanceStore.balance.currency.symbol"
            :currency-code="tipsBalanceStore.balance.currency.code"
            icon="mdi-wallet"
            variant="primary"
          >
            <template #footer="{ variant }">
              <v-btn
                variant="tonal"
                :color="variant === 'primary' ? 'white' : 'primary'"
                size="small"
                @click="openTransferDialog"
                :disabled="!Number(tipsBalanceStore.balance?.balance?.amount)"
              >
                Transfer to Wallet
              </v-btn>
            </template>
          </AmountDisplayCard>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Use existing BalanceTransferDialog component -->
    <BalanceTransferDialog
      v-if="tipsBalanceStore.balance?.currency"
      v-model="showTransferDialog"
      :transfer-endpoint="transferEndpoint"
      :available-balance="Number(tipsBalanceStore.balance?.balance?.amount || 0)"
      :currency-symbol="tipsBalanceStore.balance.currency.symbol"
      :currency-code="tipsBalanceStore.balance.currency.code"
      @transfer-success="handleTransferSuccess"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useTipsBalanceStore } from '~/stores/useTipsBalanceStore'

const { formatRelativeDate } = useDateFormatter()
const tipsBalanceStore = useTipsBalanceStore()

// No longer needed as we're using the store
// const props = defineProps<{
//  balance: Balance | null
// }>()

const showTransferDialog = ref(false)
const transferEndpoint = '/api/user/tips/transfer'

const openTransferDialog = () => {
  showTransferDialog.value = true
}

const handleTransferSuccess = (amount: number) => {
  // Update the store with the new balance
  tipsBalanceStore.updateBalanceAfterTransfer(amount)
}

// No longer need to emit events as we're using the store for state management
// const emit = defineEmits<{
//  'transfer-completed': []
// }>()
</script>
