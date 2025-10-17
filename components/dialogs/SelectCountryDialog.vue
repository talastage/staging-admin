<template>
  <div>
    <v-btn text @click="internalDialog = true">
      {{ selectedCountry?.name || "Select Country" }}
    </v-btn>

    <base-dialog
      v-model="internalDialog"
      title="Choose a Country"
      :max-width="'600px'"
    >
      <v-select
        :modelValue="selectedCountry"
        :items="countries"
        item-value="id"
        item-title="name"
        label="Select a country"
        @update:modelValue="updateSelectedCountry"
        return-object
      ></v-select>
    </base-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  countries: {
    type: Array,
    required: true,
  },
  selectedCountry: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:selectedCountry"]);
const internalDialog = ref(false);

function updateSelectedCountry(newCountry) {
  emit("update:selectedCountry", newCountry);
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
