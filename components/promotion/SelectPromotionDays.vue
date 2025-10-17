<template>
  <div class="select-promotion-days">
    <v-text-field
      v-model="localDays"
      label="Days"
      type="number"
      :min="minDays"
      @input="emitDays"
    />
    <v-date-picker
      v-model="endDate"
      label="End date"
      :min="minEndDate"
      class="mt-3"
    ></v-date-picker>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  days: {
    type: Number,
    required: true,
  },
  minDays: {
    type: Number,
    default: 1,
  },
  defaultDays: {
    type: Number,
    default: 7,
  },
});
const emit = defineEmits(['update:days']);

const localDays = ref(props.days);
const endDate = ref('');
const minEndDate = new Date().toISOString().split('T')[0];

const emitDays = () => {
  emit('update:days', localDays.value);
};

watch(() => props.days, (newDays) => {
  localDays.value = newDays;
}, { immediate: true });
</script>

<style scoped>
.select-promotion-days {
  display: flex;
  flex-direction: column;
}
</style>
