<template>
  <v-card
    :class="{ selected: isSelected }"
    @click="selectMethod"
    class="payment-method-card"
  >
    <v-card-text class="d-flex flex-column align-center">
      <v-checkbox
        :model-value="isSelected"
        @change="selectMethod"
        class="ma-0 pa-0"
      ></v-checkbox>
      <v-avatar size="48" class="mb-2">
        <v-img
          :src="method.payment_method.logo_url || method.gateway.logo"
          :alt="method.payment_method.name"
        ></v-img>
      </v-avatar>
      <div class="text-center">
        <div class="text-h6">{{ method.payment_method.name }}</div>
        <div v-if="method.paymentables.length === 1" class="text-subtitle-2">
          {{ method.paymentables[0].name }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  method: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select"]);

const selectMethod = () => {
  emit("select", props.method);
};
</script>

<style scoped>
.payment-method-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.payment-method-card.selected {
  border: 2px solid var(--v-primary-base);
  background-color: var(--v-primary-lighten5);
}
</style>
