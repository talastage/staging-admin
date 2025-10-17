<template>
  <v-btn @click="emitShareAction" class="custom-btn" variant="tonal">
    <v-icon start>mdi-share-variant</v-icon>
    Share
  </v-btn>
</template>

<script setup lang="ts">
const emit = defineEmits(["share"]);
const emitShareAction = () => {
  emit("share");
};
</script>

<style scoped>
.custom-btn {
  border-radius: 20px;
  padding: 0 16px;
  height: 36px;
  text-transform: none;
  font-weight: 500;
}
</style>