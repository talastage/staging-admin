<template>
  <div class="watching-item">
    <div class="watching-item-icon">
      <img
        :src="watching.user.profile_photo"
        :alt="`${watching.user.first_name}'s profile picture`"
      />
    </div>
    <div class="watching-item-details">
      <div class="watching-item-header">
        <h3>{{ watching.user.first_name }} {{ watching.user.last_name }}</h3>
        <span class="amount">
          {{ formatCurrency(watching.amount, watching.currency_code) }}
        </span>
      </div>
      <div class="watching-item-date">{{ watching.created_at | date }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  watching: {
    type: Object,
    required: true,
  },
});

const formatCurrency = (amount, currencyCode) => {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  });
  return numberFormat.format(amount);
};

</script>
