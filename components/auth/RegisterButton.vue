<template>
  <BaseButton
    :title="label"
    :action="handleClick"
    color="primary"
    variant="outlined"
    :fullWidth="true"
    customClass="register-button"
    :elevation="0"
  />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const props = defineProps({
  label: {
    type: String,
    default: "Register",
  },
});

const router = useRouter();

const handleClick = () => {
  router.push("/register");
};
</script>
