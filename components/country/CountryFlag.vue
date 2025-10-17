<!-- components/CountryFlag.vue -->
<template>
  <img :src="flag" :alt="countryName" class="country-flag" />
</template>

<script setup lang="ts">
defineProps({
  flag: {
    type: String,
    required: true,
  },
  countryName: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.country-flag {
  width: 24px;
  height: 16px;
  margin-right: 8px;
  object-fit: cover;
}
</style>
