<template>
  <v-dialog v-model="showDialog" persistent max-width="580px">
    <v-card class="pa-2">
      <!-- ProjectPlayer Component now uses video_url for the project -->
      <ProjectPlayer :project-src="props.project.video_url" />
      <!-- Card Actions for Closing Button -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <!-- This will push your button to the right -->
        <v-btn color="red" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from "vue";

const props = defineProps({
  modelValue: Boolean,
  project: Object, // Ensure this is structured correctly to include video_url
});

const showDialog = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    showDialog.value = newVal;
  }
);

const emit = defineEmits(["update:modelValue"]);

watch(showDialog, (newVal) => {
  emit("update:modelValue", newVal);
});

const closeDialog = () => {
  showDialog.value = false;
};
</script>
