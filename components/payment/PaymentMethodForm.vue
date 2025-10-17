<template>
  <v-form @submit.prevent="submitForm">
    <v-container>
      <v-row v-if="method.payment_method.type === 'mobile_money'">
        <v-col cols="12">
          <EnterPhoneNumber
            v-model:phoneNumber="formData.mobileNumber"
            :existingPhoneNumber="method.payment_details.phone_number"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="formData.providerName"
            label="Provider"
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="primary" type="submit">Submit</v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  method: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["submit", "cancel"]);

const formData = ref({
  mobileNumber: "",
  providerName: "",
});

watch(
  () => props.method,
  (newMethod) => {
    if (newMethod) {
      formData.value = {
        mobileNumber: newMethod.payment_details.phone_number || "",
        providerName: newMethod.payment_details.provider?.name || "",
      };
    }
  },
  { immediate: true }
);

const phoneNumberRule = (value) => {
  const phoneCode = props.method.country.phone_code;
  return value.startsWith(phoneCode) || `Number should start with ${phoneCode}`;
};

const submitForm = () => {
  emit("submit", {
    ...formData.value,
    amount: props.amount,
    currency: props.currency,
  });
};
</script>
