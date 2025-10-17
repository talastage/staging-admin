<template>
  <div>
    <BaseHeader title="Select Wallet"></BaseHeader>

    <div v-if="wallet">
      <v-row class="ma-2">
        <v-col cols="12" md="6" lg="12">
          <div
            class="wallet-card"
            :class="{ selected: walletSelected }"
            @click="selectWallet"
          >
            <div class="wallet-info">
              <div class="wallet-name">{{ wallet.name }}</div>
              <div class="wallet-balance">
                {{ wallet.currency?.symbol }}{{ formattedBalance }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-row class="ma-2">
        <v-col cols="12">
          Loading...
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useWalletStore } from "~/stores/useWalletStore";

const walletStore = useWalletStore();
const walletSelected = ref(false);

const emit = defineEmits(["wallet-selected"]);

onMounted(async () => {
  await walletStore.fetchWallet();
});

const wallet = computed(() => walletStore.wallet);

const selectWallet = () => {
  walletSelected.value = true;
  emit("wallet-selected", wallet.value);
};

const formattedBalance = computed(() => {
  return wallet.value && wallet.value.balance
    ? parseFloat(wallet.value.balance).toFixed(2)
    : "0.00";
});
</script>

<style scoped>
.wallet-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 10px;
  cursor: pointer;
}

.wallet-info {
  display: flex;
  flex-direction: column;
}

.wallet-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.wallet-balance {
  font-size: 16px;
  color: #666;
}

.wallet-card.selected {
  border-color: #2196f3;
  background-color: #e3f2fd;
}
</style>
