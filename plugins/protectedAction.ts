// plugins/protectedAction.ts
import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';
import { useLoginDialogStore } from '~/stores/loginDialog';

export default defineNuxtPlugin((nuxtApp) => {
  const protectedAction = async <T>(
    action: () => Promise<T>,
    options: {
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      requiresAuth?: boolean;
    } = {}
  ) => {
    const { onSuccess, onError, requiresAuth = true } = options;
    const authStore = useAuthStore();
    const loginDialogStore = useLoginDialogStore();

    const executeAction = async () => {
      try {
        const result = await action();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (error) {
        if (onError) onError(error);
        throw error;
      }
    };

    if (requiresAuth && !authStore.isLoggedIn) {
      // Show the login dialog
      loginDialogStore.show();

      return new Promise<T>((resolve, reject) => {
        const unsubscribe = authStore.$subscribe(
          (mutation, state) => {
            if (state.isLoggedIn) {
              // User has logged in
              loginDialogStore.hide();
              executeAction()
                .then(resolve)
                .catch(reject)
                .finally(() => {
                  unsubscribe();
                });
            }
          },
          { detached: true }
        );
      });
    } else {
      return executeAction();
    }
  };

  return {
    provide: {
      protectedAction,
    },
  };
});
