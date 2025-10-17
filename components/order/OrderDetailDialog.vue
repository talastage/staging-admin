<template>
  <BaseDialog v-model="isOpen" title="Order Details">
    <v-card v-if="orderDetails" class="order-details pa-4" flat>
      <!-- Order Summary -->
      <v-card outlined class="mb-4" flat>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <h3 class="text-h6 mb-2">
                Order #{{ orderDetails.reference_number }}
              </h3>
              <p>Date: {{ formatDate(orderDetails.order_date) }}</p>
              <p>
                Status:
                <v-chip :color="getStatusColor(orderDetails.status)" small>
                  {{ orderDetails.status }}
                </v-chip>
              </p>
            </v-col>
            <v-col cols="12" sm="6" class="text-sm-right">
              <h3 class="text-h6 mb-2">Total</h3>
              <p class="text-h5">
                {{ orderDetails.currency }}{{ orderDetails.total_amount }}
              </p>
              <p>Payment Status: {{ orderDetails.payment_status }}</p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Order Items -->
      <h3 class="text-h6 mb-3">Items:</h3>
      <v-list v-if="orderDetails.items && orderDetails.items.length">
        <v-list-item
          v-for="item in orderDetails.items"
          :key="item.type + item.orderable.id"
          class="mb-2"
        >
          <ProjectOrderableItem
            v-if="item.type === 'Project'"
            :item="item"
          />
          <UserOrderableItem
            v-else-if="item.type === 'User'"
            :item="item"
          />
        </v-list-item>
      </v-list>
      <p v-else>No items found for this order.</p>

      <!-- Action Buttons -->
      <v-card-actions class="mt-4">
        <v-spacer></v-spacer>
        <BaseButton
          v-if="orderDetails.payment_status !== 'paid'"
          title="Pay Now"
          color="primary"
          :action="payOrder"
          :full-width="true"
        />
        <BaseButton
          v-if="orderDetails.payment_status === 'paid'"
          title="Download Invoice"
          color="primary"
          :action="downloadInvoice"
          :full-width="true"
        />
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useDateFormatter } from "@/composables/useDateFormatter";


const props = defineProps({
  modelValue: Boolean,
  orderDetails: Object,
});

const emit = defineEmits(["update:modelValue", "pay", "download-invoice"]);

const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  }
);

watch(isOpen, (newValue) => {
  emit("update:modelValue", newValue);
});

const { formatRelativeDate } = useDateFormatter();

const getStatusColor = (status) => {
  const colors = {
    paid: "green",
    pending: "orange",
    failed: "red",
  };
  return colors[status] || "grey";
};

const formatDate = (dateString) => {
  return formatRelativeDate(dateString) || "Invalid Date";
};

const payOrder = () => {
  emit("pay", props.orderDetails.order_id);
};

const downloadInvoice = () => {
  emit("download-invoice", props.orderDetails.order_id);
};
</script>

<style scoped>
.order-details {
  max-width: 800px;
  margin: 0 auto;
}
</style>