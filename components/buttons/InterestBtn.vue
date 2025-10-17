<template>
    <v-btn @click="showDialog">Interest</v-btn>
  
    <v-dialog v-model="dialog" persistent max-width="300px">
      <template #activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on">Show Dialog</v-btn>
      </template>
      <v-card>
        <v-card-title>Express Interest</v-card-title>
        <v-card-text>
          <!-- Your content here -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
  });
  
  const dialog = ref(false);
  
  const showDialog = () => {
    dialog.value = true;
  };
  </script>
  