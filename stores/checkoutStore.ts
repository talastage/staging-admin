// stores/checkoutStore.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { useCountryPaymentMethods } from '~/composables/useCountryPaymentMethods'

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    cart: {} as Record<string, any>,
    cartItems: [] as any[],
    totalAmount: 0,
    currency: {} as Record<string, any>,
    loading: false,
    // Payment method data
    selectedPaymentMethod: null as Record<string, any> | null,
    availablePaymentMethods: [] as any[],
    showPaymentMethodsDialog: false,
  }),
  actions: {
    async fetchCartItems() {
      const { $axios } = useNuxtApp()
      this.loading = true
      try {
        const response = await $axios.get('/api/cart')
        if (response.data.success) {
          // Store the entire cart resource from the API response
          this.cart = response.data.cart || {}
          // Optionally, you can still extract individual properties:
          this.cartItems = response.data.items || []
          this.totalAmount = parseFloat(response.data.cart?.total_amount || 0)
          this.currency = response.data.cart?.currency || {}

          // If no payment method is selected, use the cart's currency details
          if (!this.selectedPaymentMethod && this.currency) {
            this.selectedPaymentMethod = {
              payment_method: {
                id: this.currency.id,
                name: this.currency.name,
              },
            }
          }
        }
      } catch (error) {
        console.error('Error fetching cart items:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchAvailablePaymentMethods() {
      this.loading = true
      try {
        const { paymentMethods, fetchPaymentMethods } =
          useCountryPaymentMethods('payment')
        await fetchPaymentMethods()
        this.availablePaymentMethods = paymentMethods.value
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      } finally {
        this.loading = false
      }
    },

    selectPaymentMethod(method: any) {
      this.selectedPaymentMethod = method
      this.showPaymentMethodsDialog = false
    },

    async processPayment() {
      const { $axios } = useNuxtApp()
      return await $axios.post('/api/cart/checkout')
    },

    clearCart() {
      this.cart = {}
      this.cartItems = []
      this.totalAmount = 0
      this.currency = {}
    },
  },
})
