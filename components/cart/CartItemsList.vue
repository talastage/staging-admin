<!-- components/cart/CartItemsList.vue -->
<template>
  <div class="cart-items-list">
    <!-- Loading State -->
    <v-skeleton-loader
      v-if="loading"
      v-for="i in 3"
      :key="i"
      type="list-item-avatar-three-line"
      class="mb-4"
    />

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <!-- Empty State -->
    <v-alert
      v-else-if="!items?.length"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      <template v-slot:title> Your cart is empty </template>
      <template v-slot:text>
        Add items to your cart to see them here.
      </template>
      <template v-slot:append>
        <v-btn color="info" variant="text" @click="$emit('browse')">
          Browse Items
        </v-btn>
      </template>
    </v-alert>

    <!-- Items List -->
    <v-list v-else class="pa-0">
      <TransitionGroup name="cart-item">
        <v-list-item v-for="item in items" :key="item.id" class="mb-3 px-4">
          <CartItem :item="item" @remove="handleRemoveItem" />
        </v-list-item>
      </TransitionGroup>
    </v-list>

    <!-- Bulk Actions -->
    <v-slide-y-transition>
      <v-card
        v-if="items?.length > 1"
        class="bulk-actions mt-6"
        variant="flat"
        color="surface-variant"
        rounded="lg"
      >
        <v-card-text class="d-flex justify-space-between align-center py-3">
          <span class="text-body-1">{{ items.length }} items in cart</span>
          <v-btn
            color="error"
            variant="text"
            @click="handleClearCart"
            prepend-icon="mdi-delete-sweep"
            class="clear-btn"
          >
            Clear Cart
          </v-btn>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import CartItem from './CartItem.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
    validator: (items) =>
      items.every((item) => item.id && item.payment_type && item.payable),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['remove', 'clear', 'browse'])

const handleRemoveItem = (itemId) => {
  emit('remove', itemId)
}

const handleClearCart = () => {
  emit('clear')
}

watch(
  () => props.items,
  (newItems, oldItems) => {
    if (newItems?.length < oldItems?.length) {
      // Optional: add logic when an item is removed
    }
  },
  { deep: true }
)
</script>

<style scoped>
.cart-items-list {
  position: relative;
}

.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.cart-item-move {
  transition: transform 0.4s ease;
}

.bulk-actions {
  transition: all 0.3s ease;
}

.clear-btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: rgba(var(--v-theme-error), 0.1);
}

@media (max-width: 600px) {
  .bulk-actions {
    position: sticky;
    bottom: 0;
    z-index: 1;
    background: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  }
}
</style>
