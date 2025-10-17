<template>
    <v-container>
      <v-row>
        <v-col v-for="(card, index) in cards" :key="index">
          <v-card>
            <v-card-title>
              <v-avatar left>
                <v-img
                  :src="card.logo"
                  v-if="card.logo"
                ></v-img>
              </v-avatar>
              <div>
                **** **** **** {{ card.card_number.slice(-4) }}
                <div>Expires {{ card.expiry_date }}</div>
              </div>
              <v-btn @click="$emit('select', card)">Select</v-btn>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  const props = defineProps({
    cards: {
      type: Array,
      default: () => [],
    },
  });
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>
  