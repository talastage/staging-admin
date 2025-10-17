<template>
  <v-card elevation="10" rounded="lg">
    <v-card-text class="pa-2">
      <div class="d-flex align-center">
        <!-- Left side: Icon and Amount -->
        <div class="d-flex align-center">
          <v-avatar
            class="payment-avatar mr-4"
            size="48"
            color="primary"
            variant="tonal"
          >
            <v-icon size="24" color="primary"> mdi-cash-multiple </v-icon>
          </v-avatar>

          <div class="amount-info">
            <div class="text-subtitle-2 text-medium-emphasis">
              {{ paymentLabel }}
              <!-- Use the dynamic label prop -->
            </div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold">
                {{ currencySymbol }} {{ amount.toLocaleString() }}
              </span>
              <span class="text-caption text-medium-emphasis ml-1">
                {{ currencyCode }}
              </span>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              That amount will be deducted from your wallet balance after
              uploading is complete.
            </div>
          </div>
        </div>

        <!-- Right side: Action Buttons -->
        <div class="ml-auto" style="min-width: 140px">
          <slot name="actions"> </slot>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  amount: number
  currencySymbol: string
  currencyCode: string
  loading?: boolean
  disabled?: boolean
  paymentLabel: string // New prop for the dynamic label
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  paymentLabel: 'Premiering Fee', // Default value if not provided
})
</script>

<style scoped>
.payment-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .d-flex {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .amount-info {
    margin: 12px 0;
  }

  .ml-auto {
    margin-left: 0 !important;
    width: 100%;
    margin-top: 16px;
  }
}
</style>
