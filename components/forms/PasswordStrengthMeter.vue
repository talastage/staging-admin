<template>
    <div>
      <v-text-field
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="showPassword = !showPassword"
        label="Password"
      ></v-text-field>
      <v-progress-linear
        :value="passwordStrength"
        :color="strengthColor"
        height="5"
      ></v-progress-linear>
      <p>{{ strengthText }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const password = ref('');
  const showPassword = ref(false);
  
  const passwordStrength = computed(() => {
    let strength = 0;
    if (password.value.length >= 8) strength += 25;
    if (password.value.match(/[a-z]/)) strength += 25;
    if (password.value.match(/[A-Z]/)) strength += 25;
    if (password.value.match(/[0-9]/) || password.value.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  });
  
  const strengthColor = computed(() => {
    if (passwordStrength.value <= 25) return 'red';
    if (passwordStrength.value <= 50) return 'orange';
    if (passwordStrength.value <= 75) return 'yellow';
    return 'green';
  });
  
  const strengthText = computed(() => {
    if (passwordStrength.value <= 25) return 'Weak';
    if (passwordStrength.value <= 50) return 'Fair';
    if (passwordStrength.value <= 75) return 'Good';
    return 'Strong';
  });
  </script>