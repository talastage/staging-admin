<template>
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          color="primary"
          variant="outlined"
          class="transaction-filter-btn"
        >
          {{ selectedFilterName }}
          <v-icon right>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="option in options"
          :key="option.value"
          @click="selectFilter(option)"
        >
          <v-list-item-title>{{ option.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    options: {
      type: Array,
      required: true
    }
  });
  
  const emit = defineEmits(['filter-change']);
  
  const selectedFilter = ref('all');
  
  const selectedFilterName = computed(() => {
    const selected = props.options.find(option => option.value === selectedFilter.value);
    return selected ? selected.name : 'All';
  });
  
  const selectFilter = (option) => {
    selectedFilter.value = option.value;
    emit('filter-change', option.value);
  };
  </script>
  
  <style scoped>
  .transaction-filter-btn {
    min-width: 120px;
  }
  </style>