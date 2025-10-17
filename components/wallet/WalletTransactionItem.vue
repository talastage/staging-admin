<template>
  <div
    class="transaction-item d-flex align-center py-4"
    :class="{ 'hover-state': hovering }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <!-- Icon -->
    <v-avatar :color="iconColor" size="42" class="mr-4">
      <v-icon :icon="iconComponent" color="white" size="20" />
    </v-avatar>

    <!-- Details -->
    <div class="flex-grow-1">
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-h6 font-weight-medium">{{ transactionTitle }}</div>
          <div
            class="text-caption text-medium-emphasis mt-1 d-flex align-center"
          >
            <v-icon size="14" icon="mdi-clock-outline" class="mr-1" />
            {{ formattedDate }}
          </div>
        </div>

        <div class="text-end">
          <div :class="['text-h6 font-weight-medium', amountColor]">
            {{ formattedAmount }}
          </div>
          <v-chip
            :color="statusColor"
            size="small"
            class="mt-1"
            :variant="chipVariant"
            density="comfortable"
          >
            {{ transaction.status }}
          </v-chip>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useDateFormatter } from "@/composables/useDateFormatter";

const props = defineProps({
  transaction: {
    type: Object,
    required: true,
  },
});

const hovering = ref(false);
const { formatRelativeDate } = useDateFormatter();

const iconComponent = computed(() => {
  const icons = {
    withdrawal: "mdi-cash-minus",
    deposit: "mdi-cash-plus",
    transfer: "mdi-bank-transfer",
    default: "mdi-cash",
  };
  return icons[props.transaction.transaction_type] || icons.default;
});

const iconColor = computed(() => {
  const colors = {
    withdrawal: "error",
    deposit: "success",
    transfer: "primary",
    default: "grey",
  };
  return colors[props.transaction.transaction_type] || colors.default;
});

const transactionTitle = computed(() => {
  return (
    props.transaction.transaction_type.charAt(0).toUpperCase() +
    props.transaction.transaction_type.slice(1)
  );
});

const formattedAmount = computed(() => {
  const amount = parseFloat(props.transaction.amount);
  return `${props.transaction.currency_symbol} ${amount.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
});

const amountColor = computed(() => {
  return props.transaction.transaction_type === "withdrawal"
    ? "text-error"
    : "text-success";
});

const formattedDate = computed(() => {
  return formatRelativeDate(props.transaction.created_at);
});

const statusColor = computed(() => {
  const colors = {
    completed: "success",
    pending: "warning",
    failed: "error",
    default: "info",
  };
  return colors[props.transaction.status] || colors.default;
});

const chipVariant = computed(() => {
  return props.transaction.status === "completed" ? "flat" : "outlined";
});
</script>
<style lang="scss" scoped>
.transaction-item {
  transition: background-color 0.25s ease;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);

  &:last-child {
    border-bottom: none;
  }

  &.hover-state {
    background: linear-gradient(
      to right,
      rgba(var(--v-theme-surface-variant), 0.5),
      rgba(var(--v-theme-surface-variant), 0.3)
    );
  }

  .text-h6 {
    font-size: 1rem !important;
    line-height: 1.4;
  }
}

:deep(.v-chip) {
  font-size: 11px !important;

  &.v-chip--variant-flat {
    opacity: 0.9;
  }
}

@media (max-width: 600px) {
  .transaction-item {
    padding-top: 12px;
    padding-bottom: 12px;

    .text-h6 {
      font-size: 0.875rem !important;
    }
  }
}
</style>
