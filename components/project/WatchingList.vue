<template>
  <v-list dense>
    <v-list-item
      v-for="watching in watchings"
      :key="watching.user.id"
      class="watching-item"
    >
      <v-card class="mb-3" >
        <v-row align="center">
          <v-col cols="4">
            <UserProfile :user="watching.user" />
          </v-col>
          <v-col cols="8">
            <div class="details">
              <div><strong>Amount:</strong> {{ watching.amount }}</div>
              <div>
                <strong>Service Fee:</strong> {{ watching.app_service_fee }}
              </div>
              <div>
                <strong>Paid Amount:</strong> {{ watching.payment_paid_amount }}
              </div>
              <div><strong>Currency:</strong> {{ watching.currency_code }}</div>
              <div><strong>Created:</strong> {{ watching.created_at }}</div>
            </div>
          </v-col>
        </v-row></v-card
      >
    </v-list-item>
  </v-list>
</template>

<script setup>
const props = defineProps({
  watchings: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.watching-item {
  display: flex;
  flex-wrap: wrap;
}

.details {
  display: flex;
  flex-direction: column;
}
</style>
