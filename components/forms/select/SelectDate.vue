<template>
  <div class="select-date-wrapper">
    <VueDatePicker
      v-model="selectedDate"
      :format="format"
      :text-input="true"
      :auto-apply="true"
      :class="{ 'date-picker': true }"
      placeholder="Select date"
      :teleport="false"
      position="bottom"
      @update:model-value="emitDate"
    >
      <template #trigger>
        <v-text-field
          :model-value="formattedDate"
          readonly
          :placeholder="placeholder"
          prepend-inner-icon="mdi-calendar"
          variant="outlined"
          density="compact"
          class="date-input"
        />
      </template>
    </VueDatePicker>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select date',
  },
})

const emit = defineEmits(['update:modelValue'])

const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null)

const format = (date) => {
  return date.toISOString().split('T')[0]
}

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  return format(selectedDate.value)
})

const emitDate = (value) => {
  if (value) {
    emit('update:modelValue', format(value))
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    selectedDate.value = newValue ? new Date(newValue) : null
  }
)
</script>

<style scoped>
.select-date-wrapper {
  position: relative;
  width: 100%;
}

.date-picker {
  width: 100%;
}

.date-input {
  min-width: 220px; /* Added minimum width */
}

:deep(.v-field) {
  width: 100%;
}

:deep(.dp__theme_light) {
  --dp-primary-color: rgb(var(--v-theme-primary));
}

:deep(.dp__menu) {
  z-index: 1000;
}

:deep(.dp__menu) {
  z-index: 1000;
}
</style>
