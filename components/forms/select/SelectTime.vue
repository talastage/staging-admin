<template>
  <div class="custom-time-picker">
    <v-menu
      v-model="showMenu"
      :close-on-content-click="false"
      :max-width="300"
      location="bottom"
    >
      <template v-slot:activator="{ props }">
        <v-text-field
          v-bind="props"
          :model-value="displayTime"
          readonly
          :placeholder="placeholder"
          prepend-inner-icon="mdi-clock-outline"
          variant="outlined"
          density="compact"
          :error-messages="error"
          :disabled="disabled"
          class="time-input"
        />
      </template>

      <v-card class="time-picker-card">
        <v-card-text class="time-picker-content px-2 py-3">
          <div class="time-sections">
            <!-- Hours -->
            <div class="time-section">
              <div class="time-label">Hours</div>
              <v-select
                v-model="selectedHour"
                :items="hours"
                variant="outlined"
                density="compact"
                hide-details
                class="time-select"
                :menu-props="{ maxHeight: 200 }"
              />
            </div>

            <div class="time-separator">:</div>

            <!-- Minutes -->
            <div class="time-section">
              <div class="time-label">Minutes</div>
              <v-select
                v-model="selectedMinute"
                :items="minutes"
                variant="outlined"
                density="compact"
                hide-details
                class="time-select"
                :menu-props="{ maxHeight: 200 }"
              />
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="time-actions pa-2">
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="clearTime"
            class="action-btn"
          >
            Clear
          </v-btn>
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="applyTime"
            class="action-btn"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select time',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// Default time (9:00 AM)
const DEFAULT_HOUR = '09'
const DEFAULT_MINUTE = '00'

const showMenu = ref(false)
const selectedHour = ref(DEFAULT_HOUR)
const selectedMinute = ref(DEFAULT_MINUTE)

// Generate hours (00-23)
const hours = computed(() =>
  Array.from({ length: 24 }, (_, i) => ({
    title: i.toString().padStart(2, '0'),
    value: i.toString().padStart(2, '0'),
  }))
)

// Generate minutes (00-59)
const minutes = computed(() =>
  Array.from({ length: 60 }, (_, i) => ({
    title: i.toString().padStart(2, '0'),
    value: i.toString().padStart(2, '0'),
  }))
)

const displayTime = computed(() => {
  if (!selectedHour.value || !selectedMinute.value) return ''
  return `${selectedHour.value}:${selectedMinute.value}`
})

const parseTime = (timeString) => {
  if (!timeString) return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE }
  const [hour, minute] = timeString.split(':')
  return {
    hour: hour?.padStart(2, '0') || DEFAULT_HOUR,
    minute: minute?.padStart(2, '0') || DEFAULT_MINUTE,
  }
}

const applyTime = () => {
  emit('update:modelValue', `${selectedHour.value}:${selectedMinute.value}`)
  showMenu.value = false
}

const clearTime = () => {
  selectedHour.value = DEFAULT_HOUR
  selectedMinute.value = DEFAULT_MINUTE
  emit('update:modelValue', `${DEFAULT_HOUR}:${DEFAULT_MINUTE}`)
  showMenu.value = false
}

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    const { hour, minute } = parseTime(newValue)
    selectedHour.value = hour
    selectedMinute.value = minute
  },
  { immediate: true }
)

// Set default time on mount if no value provided
onMounted(() => {
  if (!props.modelValue) {
    emit('update:modelValue', `${DEFAULT_HOUR}:${DEFAULT_MINUTE}`)
  }
})
</script>

<style scoped>
.custom-time-picker {
  width: 100%;
  position: relative;
}

.time-input {
  min-width: 120px;
}

.time-picker-card {
  border-radius: 8px;
  max-width: 100%;
}

.time-picker-content {
  min-width: 200px;
}

.time-sections {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.time-section {
  flex: 1;
  min-width: 0;
}

.time-label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
  white-space: nowrap;
}

.time-separator {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.time-select {
  width: 100%;
}

:deep(.time-select .v-field) {
  border-radius: 6px;
}

:deep(.time-select .v-field__input) {
  padding-top: 6px;
  padding-bottom: 6px;
}

.time-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  min-width: 64px;
}

/* Mobile Optimizations */
@media (max-width: 600px) {
  .time-picker-card {
    width: calc(100vw - 32px);
    margin: 0 16px;
  }

  .time-sections {
    gap: 4px;
  }
}

/* Dark Mode Optimizations */
:deep(.v-theme--dark) {
  .time-label {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }

  .time-separator {
    color: rgba(var(--v-theme-on-surface), 0.9);
  }
}

/* Touch Device Optimizations */
@media (hover: none) {
  .action-btn {
    padding: 0 16px;
    height: 36px;
  }
}
</style>
