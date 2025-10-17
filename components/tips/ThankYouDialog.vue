<template>
  <BaseDialog
    v-model="dialog"
    title="Thank You for Your Tip!"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <v-card-text class="text-center">
      <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
      <h2 class="text-h5 mb-4">
        Your tip of {{ formattedAmount }} has been sent successfully!
      </h2>

      <div class="entity-info mb-4">
        <template v-if="entityType === 'project'">
          <ProjectHeader :project="entity" />
        </template>
        <template v-else-if="entityType === 'user'">
          <v-row justify="center" align="center">
            <v-col cols="auto">
              <UserAvatar
                :username="entity.username"
                :profile_photo="entity.profile_photo"
                size="large"
              />
            </v-col>
            <v-col>
              <h3 class="text-h6">{{ entity.display_name }}</h3>
              <p class="text-subtitle-2">@{{ entity.username }}</p>
            </v-col>
          </v-row>
        </template>
      </div>

      <p class="mb-4">
        Thank you for supporting this {{ entityType }}. Your generosity is
        greatly appreciated.
      </p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="dialog = false">Close</v-btn>
    </v-card-actions>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCurrencyStore } from "~/stores/useCurrencies";
import { storeToRefs } from "pinia";

const props = defineProps({
  modelValue: Boolean,
  amount: {
    type: Number,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
    validator: (value: string) => ["user", "project"].includes(value),
  },
  entity: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const currencyStore = useCurrencyStore();
const { selectedCurrency } = storeToRefs(currencyStore);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formattedAmount = computed(() => {
  if (selectedCurrency.value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedCurrency.value.code,
    }).format(props.amount);
  }
  return `${props.amount}`;
});
</script>

<style scoped>
.entity-info {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
