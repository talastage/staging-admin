<template>
  <BaseButton
    title="Login"
    :action="openLoginDialog"
    color="primary"
    variant="flat"
    :fullWidth="true"
    customClass="login-button"
    :elevation="0"
  />
</template>

<script setup lang="ts">
import { useLoginDialogStore } from "~/stores/loginDialog";

const loginDialogStore = useLoginDialogStore();
const emit = defineEmits(["login-click"]);

const openLoginDialog = () => {
  loginDialogStore.show();
  emit("login-click");
};
</script>

<style scoped>
.login-button {
  color: white !important;
}
</style>
