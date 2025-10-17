<template>
    <v-dialog v-model="internalDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          {{ isDeleted ? "Deleted Successfully" : "Confirm Deletion" }}
        </v-card-title>
        <v-card-text>
          {{ isDeleted ? "Item has been deleted." : "Are you sure you want to delete this item?" }}
        </v-card-text>
        <v-card-actions v-if="!isDeleted">
          <v-btn text @click="internalDialog = false">Cancel</v-btn>
          <v-btn text color="red" @click="confirmAndClose">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, defineProps, defineEmits } from "vue";
  
  const props = defineProps({
    showDialog: Boolean,
  });
  
  const emit = defineEmits();
  
  const internalDialog = ref(props.showDialog);
  const isDeleted = ref(false);
  
  watch(internalDialog, (newValue) => {
    emit('update:showDialog', newValue);
  });
  
  const confirmAndClose = () => {
    emit("confirm-delete");
    isDeleted.value = true;
    setTimeout(() => {
      isDeleted.value = false;
      internalDialog.value = false;
    }, 2000);
  };
  </script>
  