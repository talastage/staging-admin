// ~/composables/useIsProjectCreator.ts
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

export function useIsProjectCreator(project) {
  const authStore = useAuthStore();
  const currentUser = computed(() => authStore.user?.value);
  const isCreator = ref(false);

  watch([currentUser, project], () => {
    if (currentUser.value && project.value && project.value.creator) {
      isCreator.value = currentUser.value.id === project.value.creator.id;
    } else {
      isCreator.value = false;
    }
  });

  return { isCreator };
}