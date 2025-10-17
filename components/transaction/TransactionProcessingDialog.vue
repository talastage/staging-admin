<!-- components/TransactionProcessingDialog.vue -->
<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <p>
          Your {{ transactionType }} request has been initiated successfully.
        </p>
        <p>Transaction Reference: {{ transactionReference }}</p>
        <p>
          Please wait while we process your request. This may take a few
          minutes.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
  transactionType: String,
  transactionReference: String,
});

const emit = defineEmits(["update:modelValue"]);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const title = computed(
  () =>
    `${
      props.transactionType.charAt(0).toUpperCase() +
      props.transactionType.slice(1)
    } Processing`
);

const closeDialog = () => {
  dialog.value = false;
};
</script>
