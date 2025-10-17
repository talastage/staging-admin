<template>
  <v-dialog v-model="show" persistent max-width="400px">
    <v-card>
      <v-card-title class="text-h5">Login</v-card-title>
      <v-card-text>
        <LoginForm @login-success="handleLoginSuccess" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>

const emits = defineEmits(['login-success']);

// Prop to control the dialog's visibility from the parent component
const show = ref(false);

// Expose the `show` ref so it can be controlled by the parent component
defineExpose({ show });

const handleLoginSuccess = () => {
  emits('login-success');
  show.value = false; // Close the dialog on successful login
};
</script>
