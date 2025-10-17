// composables/useLoginDialog.ts
import { ref } from 'vue';

export const useLoginDialog = () => {
  const isLoginDialogOpen = ref(false);

  const openLoginDialog = () => {
    isLoginDialogOpen.value = true;
  };

  const closeLoginDialog = () => {
    isLoginDialogOpen.value = false;
  };

  return { isLoginDialogOpen, openLoginDialog, closeLoginDialog };
};
