<template>
  <v-dialog v-model="showDialog" persistent max-width="480">
    <v-card>
      <v-card-title class="headline">{{ project.name }}</v-card-title>
      <v-card-text>
        <p>The fee to access the full project is: {{ project.access_fee.access_fee }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <!-- Add the Pay button -->
        <NuxtLink :to="`/access/payment/${project.access_uuid}`">
          <v-btn color="blue darken-1" text>Pay Access Fee</v-btn>
        </NuxtLink>
        <v-btn color="green darken-1" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  project: Object,
});

const showDialog = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal;
});

const emit = defineEmits(['update:modelValue']);

watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal);
});

const closeDialog = () => {
  showDialog.value = false;
};
</script>
