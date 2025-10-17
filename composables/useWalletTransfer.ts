import { ref, computed } from 'vue';
import { useWalletStore } from '@/stores/useWalletStore';

export function useWalletTransfer(senderWallet) {
  const walletStore = useWalletStore();

  const currentStep = ref(1);
  const receiverUser = ref(null);
  const receiverWalletCode = ref('');
  const amount = ref(0);
  const alert = ref({ visible: false, text: '', type: 'success' });

  const isAmountValid = computed(() => {
    return amount.value > 0 && amount.value <= parseFloat(senderWallet.balance);
  });

  const handleWalletVerified = (data) => {
    receiverUser.value = data.user;
    receiverWalletCode.value = data.walletCode;
    currentStep.value = 2;
  };

  const submitTransfer = async () => {
    if (!isAmountValid.value) return;

    try {
      const transferData = {
        sender_wallet_id: senderWallet.id,
        receiver_wallet_code: receiverWalletCode.value,
        amount: amount.value,
      };

      await walletStore.transferFunds(transferData);
      alert.value = { visible: true, text: 'Transfer successful', type: 'success' };
      resetDialog();
    } catch (error) {
      console.error('Transfer failed:', error);
      alert.value = {
        visible: true,
        text: error.message || 'An unknown error occurred',
        type: 'error',
      };
    }
  };

  const resetDialog = () => {
    currentStep.value = 1;
    receiverUser.value = null;
    receiverWalletCode.value = '';
    amount.value = 0;
    alert.value.visible = false;
  };

  return {
    currentStep,
    receiverUser,
    receiverWalletCode,
    amount,
    alert,
    isAmountValid,
    handleWalletVerified,
    submitTransfer,
    resetDialog,
  };
}