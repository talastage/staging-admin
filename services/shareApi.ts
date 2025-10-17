// services/shareApi.ts

import { useNuxtApp } from "#app";

export interface ShareData {
  url: string;
  text: string;
  type: string;
}

export const useShareApi = () => {
  const { $axios } = useNuxtApp();

  return {
    getShareData: async (
      entityType: string,
      entityId: string
    ): Promise<ShareData> => {
      const response = await $axios.get(`/api/share/${entityType}/${entityId}`);
      return response.data;
    },

    trackShare: async (
      entityType: string,
      entityId: string,
      platform: string
    ): Promise<void> => {
      await $axios.post(`/api/share/${entityType}/${entityId}/track`, {
        platform,
      });
    },
  };
};
