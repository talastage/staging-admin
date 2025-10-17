<template>
  <v-container class="adjust-fee">
    <v-card flat>
      <v-row>
        <v-col cols="12" md="6">
          <SelectPromotionDays
            :days="days"
            :min-days="minDays"
            :default-days="defaultDays"
            @update:days="handleDaysChange"
          />
        </v-col>
        <v-col cols="12" md="6">
          <SelectCountry :country="selectedCountryId" @update:country="handleCountryChange" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <TotalAmount :amount="totalAmount" currency="USD" title="Total Amount" />
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const props = defineProps({
  days: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  selectedCountryId: {
    type: Number,
    required: true,
  },
  defaultDays: {
    type: Number,
    required: true,
  },
  minDays: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:days', 'update:country']);

const handleDaysChange = (newDays) => {
  emit('update:days', newDays);
};

const handleCountryChange = (newCountry) => {
  emit('update:country', newCountry);
};
</script>

<style scoped>
.adjust-fee {
  padding: 20px;
}

.v-card {
  padding: 20px;
}
</style>
