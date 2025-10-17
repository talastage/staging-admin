// stores/useWalletTransactionStore.ts
import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import type { AxiosError } from "axios";
import { isAxiosError } from "axios";
import { useWalletStore } from "../useWalletStore";

interface TransactionParams {
  type?: "all" | "deposit" | "withdrawal" | "transfer";
  page?: number;
  limit?: number;
  recent?: boolean;
}

interface TransferData {
  recipient_id: string;
  amount: number;
  currency: string;
  description?: string;
}

interface TransactionData {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface TransactionError {
  message: string;
  status?: number;
  code?: string;
}

export const useWalletTransactionStore = defineStore(
  "wallet-transactions",
  () => {
    const { $axios } = useNuxtApp();
    const walletStore = useWalletStore();

    const handleTransactionError = (err: unknown): never => {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<any>;
        const errorData: TransactionError = {
          message: axiosError.response?.data?.message || axiosError.message,
          status: axiosError.response?.status,
          code: axiosError.response?.data?.code,
        };
        throw errorData;
      }
      const genericError: TransactionError = {
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
      };
      throw genericError;
    };

    const transferFunds = async (transferData: TransferData) => {
      try {
        const { data } = await $axios.post(
          "/api/wallet/transfer",
          transferData
        );
        // Refresh wallet balance after transfer
        await walletStore.fetchWallet();
        return data;
      } catch (error) {
        return handleTransactionError(error);
      }
    };

    const processTransaction = async (
      transactionType: "deposit" | "withdrawal",
      transactionData: TransactionData
    ) => {
      try {
        const { data } = await $axios.post(
          `/api/wallet/transactions/${transactionType}`,
          transactionData
        );
        // Refresh wallet balance after transaction
        await walletStore.fetchWallet();
        return data;
      } catch (error) {
        return handleTransactionError(error);
      }
    };

    const fetchTransactions = async (params: TransactionParams = {}) => {
      const { type = "all", page = 1, limit = 10, recent = false } = params;
      try {
        const { data } = await $axios.get("/api/wallet/transactions", {
          params: { type, page, limit, recent },
        });
        return data;
      } catch (error) {
        return handleTransactionError(error);
      }
    };

    const fetchWalletStatistics = async () => {
      try {
        const { data } = await $axios.get(
          "/api/wallet/transactions/statistics"
        );
        return data;
      } catch (error) {
        return handleTransactionError(error);
      }
    };

    return {
      transferFunds,
      processTransaction,
      fetchTransactions,
      fetchWalletStatistics,
    };
  }
);
