<template>
    <div>
        <v-btn @click="initiateTransfer">Transfer (${{ amount }})</v-btn>
        <v-snackbar v-model="showSnackbar">{{ snackbarMessage }}</v-snackbar>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';

const { $axios } = useNuxtApp();

const props = defineProps({
    amount: {
        type: Number,
        required: true,
    },
    walletId: {
        type: [String, Number],
        required: true,
    },

    receiverWalletCode: {
        type: String,
        required: true,
    },

});

const showSnackbar = ref(false);
const snackbarMessage = ref('');

const initiateTransfer = async () => {
    if (!props.amount || props.amount <= 0) {
        snackbarMessage.value = "Invalid amount. Please enter a positive number.";
        showSnackbar.value = true;
        return;
    }

    if (!props.walletId) {
        snackbarMessage.value = "Invalid wallet ID. Please select a wallet.";
        showSnackbar.value = true;
        return;
    }

    try {
        const response = await $axios.post(`/api/wallet/${props.walletId}/transfer`, {
            amount: props.amount
        });

        snackbarMessage.value = response.data.message;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            snackbarMessage.value = error.response.data.message;
        } else {
            snackbarMessage.value = 'An unexpected error occurred.';
        }
    } finally {
        showSnackbar.value = true;
    }
};
</script>
  
<style scoped>
/* You can add styles specific to this component here */
</style>
  