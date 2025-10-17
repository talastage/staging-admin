<template>
  <BaseContent :title="title">
    <template #action>
      <BaseButton
        v-if="showViewAll"
        title="View All"
        :action="viewAllTransactions"
        :disabled="isLoading"
        prependIcon="mdi-eye"
        color="primary"
        variant="tonal"
      />
    </template>

    <template #content>
      <div class="transactions-list" ref="transactionListRef">
        <template v-if="transactions.length">
          <WalletTransactionItem
            v-for="transaction in transactions"
            :key="transaction.id"
            :transaction="transaction"
          />
          
          <!-- Loading More -->
          <div v-if="isLoading" class="d-flex justify-center py-4">
            <v-progress-circular indeterminate color="primary" size="24" />
          </div>

          <!-- End Message -->
          <div 
            v-if="!hasMoreTransactions" 
            class="text-center py-4 text-caption text-medium-emphasis"
          >
            No more transactions to load
          </div>
        </template>

        <!-- Empty State -->
        <div v-else-if="!isLoading" class="empty-state">
          <v-icon 
            icon="mdi-cash-multiple-off" 
            size="64" 
            color="grey-lighten-1" 
            class="mb-4" 
          />
          <h3 class="text-h6 mb-2">No Transactions Found</h3>
          <p class="text-body-2 text-medium-emphasis">
            There are no {{ transactionType }} transactions to display.
          </p>
        </div>
      </div>
    </template>
  </BaseContent>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted, watch } from "vue";
  import { useRouter } from "vue-router";
  import { useWalletTransactionStore } from "@/stores/wallet/useWalletTransactionStore";
  import { useInfiniteScroll } from "@vueuse/core";
  
  const props = defineProps({
    transactionType: {
      type: String,
      default: "all",
    },
    limit: {
      type: Number,
      default: 10,
    },
    showViewAll: {
      type: Boolean,
      default: true,
    },
  });
  
  const router = useRouter();
  const transactionStore = useWalletTransactionStore();
  
  const transactions = ref([]);
  const currentPage = ref(1);
  const isLoading = ref(false);
  const transactionListRef = ref(null);
  const hasMoreTransactions = ref(true);
  
  const title = computed(() => {
    switch (props.transactionType) {
      case "deposit":
        return "Deposit Transactions";
      case "withdrawal":
        return "Withdrawal Transactions";
      case "transfer":
        return "Transfer Transactions";
      default:
        return "Recent Transactions";
    }
  });
  
  const fetchTransactions = async (page = currentPage.value) => {
    if (isLoading.value || !hasMoreTransactions.value) return;
  
    isLoading.value = true;
    try {
      const response = await transactionStore.fetchTransactions({
        type: props.transactionType,
        page: page,
        limit: props.limit,
      });
  
      const newTransactions = response.data.map(formatTransaction);
      transactions.value =
        page === 1
          ? newTransactions
          : [...transactions.value, ...newTransactions];
  
      if (response.meta) {
        currentPage.value = response.meta.current_page;
        hasMoreTransactions.value =
          response.meta.current_page < response.meta.last_page;
      } else {
        hasMoreTransactions.value = newTransactions.length === props.limit;
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const formatTransaction = (tx) => ({
    ...tx,
    title: getTitle(tx),
    subtitle: getSubtitle(tx),
  });
  
  const getTitle = (transaction) => {
    return (
      transaction.transaction_type.charAt(0).toUpperCase() +
      transaction.transaction_type.slice(1)
    );
  };
  
  const getSubtitle = (transaction) => {
    return (
      transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
    );
  };
  
  const viewAllTransactions = () => {
    router.push("/wallet/transactions");
  };
  
  const loadMoreTransactions = () => {
    if (hasMoreTransactions.value && !isLoading.value) {
      fetchTransactions(currentPage.value + 1);
    }
  };
  
  // Initialize infinite scroll
  useInfiniteScroll(transactionListRef, loadMoreTransactions, {
    distance: 10,
    throttle: 500, // Add throttling to prevent too many calls
  });
  
  // Watch for transaction type changes
  watch(
    () => props.transactionType,
    () => {
      currentPage.value = 1;
      transactions.value = [];
      hasMoreTransactions.value = true;
      fetchTransactions();
    }
  );
  
  onMounted(fetchTransactions);
  </script>
<style lang="scss" scoped>
.transactions-list {
  height: calc(100vh - 280px);
  overflow-y: auto;
  margin: 0 -24px;
  padding: 0 24px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

@media (max-width: 600px) {
  .transactions-list {
    height: calc(100vh - 240px);
    margin: 0 -16px;
    padding: 0 16px;
  }

  .empty-state {
    min-height: 200px;
    padding: 24px;
  }
}
</style>