<!-- components/FooterNavigation.vue -->
<template>
  <v-footer app>
    <v-container class="d-flex justify-space-between">
      <v-btn :disabled="currentStep === 1" @click="$emit('prev-step')">
        Back
      </v-btn>

      <div>
        <v-btn color="primary" @click="$emit('save')"> Save </v-btn>

        <v-btn color="primary" @click="handleNext">
          {{ currentStep === totalSteps ? "Publish" : "Next" }}
        </v-btn>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
const props = defineProps({
  currentStep: Number,
  totalSteps: Number,
});

const emit = defineEmits(["prev-step", "next-step", "save", "publish"]);

const handleNext = () => {
  if (props.currentStep === props.totalSteps) {
    emit("publish");
  } else {
    emit("next-step");
  }
};
</script>
