// stores/useWalletSettingsStore.ts
import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import type { AxiosError } from "axios";
import { isAxiosError } from "axios";
import { useWalletStore } from "./useWalletStore";

interface SettingsError {
  message: string;
  status?: number;
  code?: string;
}

export const useWalletSettingsStore = defineStore("wallet-settings", () => {
  const { $axios } = useNuxtApp();
  const walletStore = useWalletStore();

  const handleSettingsError = (err: unknown): never => {
    if (isAxiosError(err)) {
      const axiosError = err as AxiosError<any>;
      const errorData: SettingsError = {
        message: axiosError.response?.data?.message || axiosError.message,
        status: axiosError.response?.status,
        code: axiosError.response?.data?.code,
      };
      throw errorData;
    }
    const genericError: SettingsError = {
      message:
        err instanceof Error ? err.message : "An unexpected error occurred",
    };
    throw genericError;
  };

  const changeWalletCurrency = async (currencyId: number) => {
    try {
      await $axios.post("/api/wallet/currencies/change", {
        currency_id: currencyId,
      });
      // Refresh wallet data to get updated currency
      await walletStore.fetchWallet();
    } catch (error) {
      return handleSettingsError(error);
    }
  };

  return {
    changeWalletCurrency,
  };
});
