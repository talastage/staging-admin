<!-- components\payment\forms-new\MobileMoneyForm.vue -->
<template>
  <div class="mobile-money-form">
    <PhoneNumberInput
      v-model="phoneNumber"
      :label="`Enter your ${provider.name} number`"
      hint="Enter a valid mobile number (maximum 16 digits)"
      persistent-hint
      @validate="handleValidation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PhoneNumberInput from '~/components/common/PhoneNumberInput.vue'

const props = defineProps({
  provider: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['validate'])

const phoneNumber = ref('')
const isValid = ref(false)

function handleValidation(valid: boolean) {
  isValid.value = valid
  emit('validate', {
    valid: isValid.value,
    data: { phone_number: phoneNumber.value },
  })
}
</script>
