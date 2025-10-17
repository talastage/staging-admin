<template>
  <BaseDialog
    :title="'Add Payment Method'"
    :modelValue="showDialog"
    @update:modelValue="updateDialog"
    :maxWidth="'600px'"
  >
    <template #default>
      <!-- Your form for adding a payment method goes here -->
      <p>Payment method form</p>
      <v-card-actions>
        <v-btn @click="closeDialog">Cancel</v-btn>
        <v-btn @click="addPaymentMethod">Add</v-btn>
      </v-card-actions>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:showDialog"]);

const updateDialog = (value: boolean) => {
  emit("update:showDialog", value);
};

const closeDialog = () => {
  emit("update:showDialog", false);
};

const addPaymentMethod = () => {
  // Logic for adding a payment method goes here
  emit("update:showDialog", false);
};
</script>
