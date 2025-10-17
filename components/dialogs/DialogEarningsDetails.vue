<template>
    <v-dialog :value="dialog" @input="updateDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          {{ activeCurrency }} Earnings Details
        </v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item v-for="detail in details" :key="detail.id">
              <v-list-item-content>
                <v-list-item-title>Earned Amount: {{ detail.earned_amount | currency }}</v-list-item-title>
                <v-list-item-subtitle>Date: {{ detail.earned_on | formatDate }}</v-list-item-subtitle>
                <v-list-item-subtitle>Description: {{ detail.description }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    activeCurrency: String,
    details: Array,
    dialog: Boolean
  });
  
  const emit = defineEmits(['update:dialog']);
  
  const updateDialog = (value) => {
    emit('update:dialog', value);
  };
  </script>
  
  <script>
  export default {
    methods: {
      currency(value) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      },
      formatDate(value) {
        return new Date(value).toLocaleDateString();
      }
    }
  };
  </script>
  