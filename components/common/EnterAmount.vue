<template>
  <v-text-field
    v-model="displayValue"
    :label="`Enter amount`"
    :prefix="currencySymbol"
    type="text"
    class="mb-4"
    outlined
    dense
    :error-messages="errorMessage"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    ref="input"
  >
    <template v-slot:append>
      <v-icon v-if="isValid" color="success">mdi-check-circle</v-icon>
      <v-icon v-else-if="displayValue && !isValid" color="error"
        >mdi-alert-circle</v-icon
      >
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  currencySymbol: {
    type: String,
    required: true,
  },
  max: {
    type: Number,
    default: Number.MAX_SAFE_INTEGER,
  },
  min: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);

const input = ref<HTMLInputElement | null>(null);
const rawValue = ref("");
const errorMessage = ref("");

const displayValue = computed({
  get: () => formatDisplayValue(rawValue.value),
  set: (val) => {
    // Remove all non-numeric characters except decimal point
    rawValue.value = val.replace(/[^\d.]/g, "");
    handleInput();
  },
});

const isValid = computed(() => {
  const value = parseFloat(rawValue.value);
  return !isNaN(value) && value >= props.min && value <= props.max;
});

watch(() => props.modelValue, updateInputValue, { immediate: true });

onMounted(() => {
  updateInputValue(props.modelValue);
});

function updateInputValue(value: number) {
  rawValue.value = value.toString();
  validateInput(false);
}

function formatDisplayValue(value: string): string {
  if (!value) return "";
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function handleInput() {
  const numericValue = parseFloat(rawValue.value);
  if (!isNaN(numericValue)) {
    emit("update:modelValue", numericValue);
  } else {
    emit("update:modelValue", 0);
  }
  validateInput(false);
}

function handleBlur() {
  const value = parseFloat(rawValue.value);
  if (!isNaN(value)) {
    rawValue.value = value.toFixed(2);
    emit("update:modelValue", value);
  } else {
    rawValue.value = "0.00";
    emit("update:modelValue", 0);
  }
  validateInput(true);
}

function handleFocus(event: FocusEvent) {
  const input = event.target as HTMLInputElement;
  input.setSelectionRange(0, input.value.length);
}

function validateInput(isFinal: boolean) {
  const value = parseFloat(rawValue.value);
  if (isFinal && isNaN(value)) {
    errorMessage.value = "Invalid amount";
  } else if (isFinal && value < props.min) {
    errorMessage.value = `Amount too small (min: ${formatAmount(props.min)})`;
  } else if (isFinal && value > props.max) {
    errorMessage.value = `Amount too large (max: ${formatAmount(props.max)})`;
  } else {
    errorMessage.value = "";
  }
}

function formatAmount(amount: number): string {
  return amount
    .toLocaleString("en-US", { style: "currency", currency: "USD" })
    .replace("$", props.currencySymbol);
}
</script>
