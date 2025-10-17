<template>
  <div>
    <div v-for="gateway in gateways" :key="gateway.id">
      <button @click="selectGateway(gateway.id)">{{ gateway.name }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const { $axios } = useNuxtApp();

const gateways = ref([]);

onMounted(async () => {
  try {
    const response = await $axios.get('/api/payment/gateways');
    gateways.value = response.data.gateways;
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
  }
});

const selectGateway = (id) => {
  emit('update:selectedGateway', id);
};
</script>
