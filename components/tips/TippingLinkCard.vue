<template>
  <v-card elevation="2" class="tipping-link-card mb-5">
    <v-row>
      <!-- Image on the left -->
      <v-col cols="4" class="pa-0">
        <v-img
          :src="'/images/products/s7.jpg'"
          alt="Thumbnail"
          height="200px"
          class="thumbnail"
        ></v-img>
      </v-col>

      <!-- Text content in the middle -->
      <v-col cols="4" class="pa-4">
        <v-card-title>
          <div>
            <h3>{{ tippingLink.name }}</h3>
            <p>{{ tippingLink.description }}</p>
          </div>
        </v-card-title>
        <v-card-subtitle class="meta">
          <span>View Count: {{ tippingLink.view_count }}</span>
          <span>Status: {{ tippingLink.status }}</span>
          <span>Tips: {{ tipsCount }}</span>
        </v-card-subtitle>
      </v-col>

      <!-- Actions on the right -->
      <v-col cols="4" class="pa-0 d-flex flex-column justify-space-between">
        <v-card-actions class="justify-end">
          <NuxtLink :to="`/tipping/tips/${tippingLink.id}`">
            <v-btn text color="primary">View</v-btn>
          </NuxtLink>
          <v-btn text color="red" @click="requestDelete">Delete</v-btn>
          <v-btn icon>
            <v-icon>mdi-share</v-icon>
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  tippingLink: {
    type: Object,
    required: true,
  },
  tipsCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits();

const requestDelete = () => {
  emit("request-delete", props.tippingLink.id);
};
</script>

<style scoped>
/* You can style the .tipping-link-card and other elements as per your design preferences */
</style>
