<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="formattedDate"
        label="Birthday"
        readonly
        v-bind="attrs"
        v-on="on"
        :error-messages="errorMessage"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="date"
      :max="maxDate"
      @input="menu = false"
    ></v-date-picker>
  </v-menu>
</template>

<script setup>
import { ref, computed } from "vue";

const menu = ref(false);
const date = ref(null);

const maxDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 13);
  return date.toISOString().split("T")[0];
});

const formattedDate = computed(() => {
  return date.value ? new Date(date.value).toLocaleDateString() : "";
});

const errorMessage = computed(() => {
  if (!date.value) return "";
  const birthDate = new Date(date.value);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 13 ? "You must be at least 13 years old to register" : "";
});
</script>
