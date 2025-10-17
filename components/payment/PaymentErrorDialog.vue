<template>
  <BaseDialog v-model="dialogVisible" :title="'Payment Error'" max-width="400px">
    <v-card-text>
      <p class="error-message">{{ errorMessage }}</p>
    </v-card-text>
    <template #actions>
      <v-row justify="center" align="center" class="flex-column">
        <v-col cols="12" class="text-center">
          <v-btn
            color="primary"
            variant="elevated"
            @click="handleAddMoney"
            class="add-money-btn"
          >
            <v-icon left>mdi-wallet-plus</v-icon>
            Add Money to Wallet
          </v-btn>
        </v-col>
        <v-col cols="12" class="text-center mt-2">
          <v-btn color="secondary" variant="text" @click="handleClose" class="close-btn">
            Close
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </BaseDialog>
</template>

<script setup>

const props = defineProps({
  errorMessage: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const router = useRouter();

const dialogVisible = ref(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

watch(dialogVisible, (newValue) => {
  if (!newValue) {
    emit("close");
  }
});

const handleClose = () => {
  dialogVisible.value = false;
};

const handleAddMoney = () => {
  dialogVisible.value = false;
  router.push('/wallet/deposit');
};
</script>

<style scoped>
.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.add-money-btn {
  text-transform: none;
  background-color: #6366f1 !important;
  color: white;
  font-weight: 500;
  padding: 0 16px;
  height: 40px;
}

.close-btn {
  text-transform: none;
  color: #6366f1;
  font-weight: 500;
}

.v-card-text {
  padding-bottom: 0;
}

.v-card-actions {
  padding-top: 0;
}
</style>