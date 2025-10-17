<template>
    <div>
      <v-list>
        <v-list-item
          v-for="ewallet in ewallets"
          :key="ewallet.id"
          @click="$emit('select', ewallet)"
        >
          <v-list-item-avatar>
            <v-img :src="ewallet.logo"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ ewallet.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ ewallet.provider_name }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { useNuxtApp } from '#app';
  
  const props = defineProps({
    countryId: {
      type: Number,
      required: true,
    },
  });
  
  const ewallets = ref([]);
  
  onMounted(() => {
    if (props.countryId) {
      fetchEwallets(props.countryId);
    }
  });
  
  watch(
    () => props.countryId,
    (newCountryId) => {
      if (newCountryId) {
        fetchEwallets(newCountryId);
      }
    },
    { immediate: true }
  );
  
  function fetchEwallets(countryId) {
    const { $axios } = useNuxtApp();
    $axios
      .get(`/api/user/ewallets`, {
        params: { country_id: countryId },
      })
      .then((response) => {
        ewallets.value = response.data.ewallets;
      })
      .catch((error) => {
        console.error('Failed to fetch e-wallets:', error);
      });
  }
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>
  