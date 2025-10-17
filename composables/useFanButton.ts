import { ref, computed, watch } from "vue";
import { useNuxtApp } from "#app";
import { useProjectMetadataStore } from "~/stores/useProjectMetadataStore";
import { storeToRefs } from "pinia";
import { useUserFansStore } from "@/stores/useUserFansStore";
import debounce from "lodash/debounce";

export function useFanButton() {
  const { $axios } = useNuxtApp();
  const projectMetadataStore = useProjectMetadataStore();
  const { metadata } = storeToRefs(projectMetadataStore);
  const userFansStore = useUserFansStore();

  const isFanning = ref(false);

  // Update local fan state when metadata changes
  watch(
    () => metadata.value,
    (newMetadata) => {
      if (newMetadata) {
        isFanning.value = newMetadata.fanning_status.is_fanned_by_auth_user;
      }
    },
    { immediate: true }
  );

  const buttonText = computed(() => (isFanning.value ? "Fanning" : "Fan"));

  const debouncedToggleFan = debounce(async (username: string) => {
    try {
      const result = isFanning.value
        ? await userFansStore.fanUser(username)
        : await userFansStore.unfanUser(username);

      if (!result.success) {
        throw new Error(result.message || "Failed to update fanning status");
      }

      // Update metadata store
      if (metadata.value) {
        metadata.value.fanning_status.is_fanned_by_auth_user = isFanning.value;
      }

      return result.fanCount;
    } catch (error) {
      console.error("Error updating fanning status:", error);
      // Revert the local state if the API call fails
      isFanning.value = !isFanning.value;
      throw error;
    }
  }, 300);

  const toggleFan = async (username: string) => {
    // Immediately update the UI
    isFanning.value = !isFanning.value;

    try {
      // Call the API in the background
      const fanCount = await debouncedToggleFan(username);
      return { success: true, fanCount };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update fanning status. Please try again later.",
      };
    }
  };

  return {
    isFanning,
    buttonText,
    toggleFan,
  };
}
