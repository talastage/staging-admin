// composables/useReactionHandler.ts
import { ref } from "vue";
import { useNuxtApp } from "#app";

export interface ReactionResponse {
  success: boolean;
  message?: string;
}

export function useReactionHandler(entityId: string) {
  const { $axios, $protectedAction } = useNuxtApp();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const submitReaction = async (
    reactionType: "like" | "dislike"
  ): Promise<ReactionResponse> => {
    return await $protectedAction(
      async () => {
        isLoading.value = true;
        error.value = null;

        try {
          const response = await $axios.post(`/api/reactions/${entityId}`, {
            reaction_type: reactionType,
          });

          return {
            success: true,
            ...response.data,
          };
        } catch (err) {
          error.value = err.message || "Failed to submit reaction";
          return {
            success: false,
            message: error.value,
          };
        } finally {
          isLoading.value = false;
        }
      },
      {
        requiresAuth: true,
        onError: (err) => {
          console.error("Error submitting reaction:", err);
        },
      }
    );
  };

  return {
    isLoading,
    error,
    submitReaction,
  };
}
