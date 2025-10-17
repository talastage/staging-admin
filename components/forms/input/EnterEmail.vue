<template>
    <v-container>
      <v-text-field
        v-model="email"
        label="Email"
        :rules="[emailRules]"
      ></v-text-field>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { useFormValidation } from '@/composables/useValidation';
  
  const email = ref('');
  const { email: emailRules } = useFormValidation();
  
  const emitEmail = () => {
    emit('email', email.value);
  };
  
  watch(email, emitEmail);
  </script>
  