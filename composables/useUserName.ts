// composables/useUserName.ts
import { Ref, ref, watchEffect } from 'vue';
import { User } from '~/types'; // Adjust the path as necessary

export const useUserName = (user: Ref<User | undefined>) => {
  const displayName = ref<string>('');

  const computeDisplayName = () => {
    if (user.value) {
      if (user.value.display_name) {
        displayName.value = user.value.display_name;
      } else if (user.value.first_name && user.value.last_name) {
        displayName.value = `${user.value.first_name} ${user.value.last_name}`;
      } else {
        displayName.value = 'Unknown User'; // Fallback value
      }
    } else {
      displayName.value = 'Unknown User'; // Fallback for when user is not defined
    }
  };

  watchEffect(() => {
    computeDisplayName();
  });

  return { displayName };
};
