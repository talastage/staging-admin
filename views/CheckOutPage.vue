<!-- CheckOutPage.vue -->
<template>
  <div class="checkout-content">
    <!-- Compact Header -->
    <div class="checkout-header mb-4">
      <div class="text-center">
        <h2 class="text-h5 font-weight-bold mb-2">{{ pageTitle }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ pageSubtitle }}</p>
      </div>
    </div>
    <v-row
      class="checkout-row"
      :class="{ 'justify-center': checkoutStore.cartItems.length === 0 }"
    >
      <!-- Cart Items Section -->
      <v-col
        cols="12"
        :md="checkoutStore.cartItems.length === 0 ? 8 : 8"
        :class="{ 'mx-auto': checkoutStore.cartItems.length === 0 }"
      >
        <v-card class="cart-items-card" elevation="1" rounded="lg">
          <v-card-text class="pa-3">
            <template v-if="checkoutStore.loading">
              <v-skeleton-loader
                v-for="i in 3"
                :key="i"
                type="article, actions"
                class="mb-4"
              />
            </template>
            <template v-else-if="checkoutStore.cartItems.length === 0">
              <NoContentFound
                message="Your cart is empty"
                icon="mdi-cart-outline"
                class="py-8"
              >
                <template #action>
                  <BaseButton
                    title="Browse Items"
                    color="primary"
                    prepend-icon="mdi-shopping"
                    :action="() => router.push('/browse')"
                    elevation="0"
                    variant="elevated"
                    class="mt-4"
                  />
                </template>
              </NoContentFound>
            </template>
            <template v-else>
              <CartItemsList
                :items="checkoutStore.cartItems"
                :loading="checkoutStore.loading"
                @remove="confirmRemove"
                @clear="handleClearCart"
              />
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Compact Order Summary Section -->
      <v-col cols="12" md="4" v-if="checkoutStore.cartItems.length > 0">
        <v-card class="summary-card" elevation="1" rounded="lg">
          <v-card-text class="pa-4">
            <div class="summary-header mb-3">
              <h3 class="text-h6 font-weight-bold mb-2">Order Summary</h3>
            </div>

            <!-- Compact total display -->
            <div class="total-section mb-4">
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-1 font-weight-medium">Total Amount</span>
                <span class="text-h6 font-weight-bold text-primary">
                  {{ formattedTotal }}
                </span>
              </div>
            </div>

            <div class="action-buttons">
              <v-btn
                color="primary"
                size="large"
                :loading="checkoutStore.loading"
                :disabled="
                  checkoutStore.loading || checkoutStore.cartItems.length === 0
                "
                @click="openPaymentMethodsDialog"
                class="checkout-button"
                block
                rounded="lg"
              >
                <v-icon class="mr-2">mdi-credit-card-outline</v-icon>
                {{ checkoutButtonText }}
              </v-btn>

              <v-btn
                color="grey"
                variant="outlined"
                :disabled="checkoutStore.loading"
                :loading="checkoutStore.loading"
                @click="handleClearCart"
                size="small"
                class="mt-2"
                block
                rounded="lg"
              >
                <v-icon size="16" class="mr-2">mdi-cart-remove</v-icon>
                Clear Cart
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>

  <!-- Payment Methods Dialog -->
  <PaymentMethodsDialog
    :transactionType="checkoutStore.cart?.transaction_type || 'payment'"
    :isWalletOnly="checkoutStore.cart?.transaction_type === 'payment'"
  />

  <!-- Payment Error Dialog -->
  <PaymentErrorDialog
    :error-message="paymentError"
    :visible="showErrorDialog"
    @close="handleCloseErrorDialog"
  />

  <ConfirmDialog
    v-model="showConfirmDialog"
    title="Remove Item"
    @confirm="handleRemoveConfirmed"
  >
    <p>Are you sure you want to remove this item from your cart?</p>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { useAmountFormatter } from '~/composables/useAmountFormatter'

const { $axios } = useNuxtApp()
const router = useRouter()
const snackStore = useSnackMessageStore()
const checkoutStore = useCheckoutStore()
const { formatAmount } = useAmountFormatter()

// Local state
const paymentError = ref('')
const showErrorDialog = ref(false)
const showConfirmDialog = ref(false)
const itemToRemove = ref<number | null>(null)

// Computed property for formatted total using the reusable composable
const formattedTotal = computed(() => {
  const amount = checkoutStore.totalAmount
  if (!amount && amount !== 0) {
    return '0.00' // Handle undefined/null amount
  }

  if (
    checkoutStore.currency &&
    Object.keys(checkoutStore.currency).length > 0
  ) {
    return formatAmount(amount, checkoutStore.currency)
  }

  // Fallback if currency object is incomplete
  return `$${parseFloat(amount.toString()).toFixed(2)}`
})

const pageTitle = computed(() => 'Checkout')
const pageSubtitle = computed(() =>
  checkoutStore.cartItems.length
    ? `Review your cart and complete your purchase`
    : 'Your cart is empty'
)

// Dynamic button text based on transaction type
const checkoutButtonText = computed(() => {
  const transactionType = checkoutStore.cart?.transaction_type
  switch (transactionType) {
    case 'deposit':
      return 'Choose Deposit Method'
    case 'withdrawal':
      return 'Choose Withdrawal Method'
    case 'transfer':
      return 'Choose Transfer Method'
    default:
      return 'Choose Payment Method'
  }
})

// Fetch the user cart on mount
onMounted(async () => {
  await checkoutStore.fetchCartItems()
})

// Confirm removing an item
function confirmRemove(id: number) {
  itemToRemove.value = id
  showConfirmDialog.value = true
}

// Handle the actual remove
async function handleRemoveConfirmed() {
  if (itemToRemove.value) {
    await handleRemove(itemToRemove.value)
    showConfirmDialog.value = false
    itemToRemove.value = null
  }
}

async function handleRemove(id: number) {
  try {
    checkoutStore.loading = true
    await $axios.delete(`/api/cart/items/${id}`)
    snackStore.success('Item removed successfully')
    await checkoutStore.fetchCartItems()
  } catch (error) {
    console.error('Error removing item from cart:', error)
    snackStore.error('Failed to remove item from cart')
  } finally {
    checkoutStore.loading = false
  }
}

async function handleClearCart() {
  try {
    checkoutStore.loading = true
    await $axios.delete('/api/cart/clear')
    snackStore.success('Cart cleared successfully')
    checkoutStore.clearCart()
  } catch (error) {
    console.error('Error clearing cart:', error)
    snackStore.error('Failed to clear cart')
  } finally {
    checkoutStore.loading = false
  }
}

function openPaymentMethodsDialog() {
  checkoutStore.showPaymentMethodsDialog = true
}

function handleCloseErrorDialog() {
  paymentError.value = ''
  showErrorDialog.value = false
}
</script>

<style scoped>
.checkout-content {
  width: 100%;
}

.checkout-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.checkout-row {
  margin-top: 0;
}

.cart-items-card,
.summary-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 1px solid rgba(98, 0, 234, 0.1);
}

.summary-card {
  position: sticky;
  top: 24px;
}

.summary-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 12px;
}

.total-section {
  background: rgba(98, 0, 234, 0.05);
  padding: 12px;
  border-radius: 8px;
}

.checkout-button {
  font-weight: 600;
  text-transform: none;
  transition: all 0.2s ease;
}

.checkout-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(98, 0, 234, 0.3);
}

.checkout-row.justify-center {
  justify-content: center;
}

.checkout-row.justify-center .cart-items-card {
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 960px) {
  .checkout-row.justify-center .cart-items-card {
    max-width: 100%;
  }
}
</style>
