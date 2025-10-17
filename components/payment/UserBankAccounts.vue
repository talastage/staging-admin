<template>
  <div>
    <v-list>
      <v-list-item
        v-for="account in accounts"
        :key="account.account_number"
        @click="$emit('select', account)"
      >
        <v-list-item-avatar>
          <v-img :src="account.logo"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{
            account.account_holder_name
          }}</v-list-item-title>
          <v-list-item-subtitle>{{
            account.account_number
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  accounts: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
