<template>
  <div class="user-tip-search">
    <BaseCard :elevation="10" class="pa-6">
      <h2 class="text-h5 font-weight-bold mb-4">Support Creators</h2>
      <p class="text-body-1 mb-6">
        Looking for someone to support? Use the search below to find and give
        tips to talented creators on the platform.
      </p>

      <div class="search-container">
        <h3 class="text-subtitle-1 font-weight-medium mb-4">
          Find a Creator to Support
        </h3>
        <SearchUser
          @user-selected="handleUserSelected"
          placeholder="Search users"
        >
          <!-- Custom action slot for each user in results -->
          <template #user-action="{ selectUser }">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              @click="selectUser()"
            >
              Support
            </v-btn>
          </template>
        </SearchUser>
      </div>
    </BaseCard>

    <!-- Using the shared TipDialog component -->
    <TipDialog
      v-model="showTipDialog"
      :entity="selectedUser"
      entity-type="user"
      @transaction-complete="handleTransactionComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showTipDialog = ref(false)
const selectedUser = ref(null)

function handleUserSelected(user) {
  selectedUser.value = user
  showTipDialog.value = true
}

function handleTransactionComplete(amount) {
  // Optional: Handle any logic needed after transaction is complete
  console.log(`Transaction completed with amount: ${amount}`)
}
</script>

<style scoped>
.user-tip-search {
  width: 100%;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
