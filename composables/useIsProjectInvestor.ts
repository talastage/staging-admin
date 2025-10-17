// ~/composables/useIsProjectContributor.ts
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

export function useIsProjectContributor(project) {
  const authStore = useAuthStore();
  const currentUser = computed(() => authStore.user?.value);
  const isContributor = ref(false);

  watch([currentUser, project], () => {
    if (currentUser.value && project.value && project.value.investors) {
      isContributor.value = project.value.investors.some(investor => investor.user_id === currentUser.value.id);
    } else {
      isContributor.value = false;
    }
  });

  return { isContributor };
}
