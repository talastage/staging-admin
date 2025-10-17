<!-- components/support/SupportHomeTab.vue -->
<template>
  <div class="home-tab pa-4">
    <div class="text-h6 mb-4">Welcome to Support</div>
    <v-list>
      <v-list-item
        prepend-icon="mdi-message-text"
        title="Send us a message"
        subtitle="We typically respond within 24 hours"
        @click="goToMessages"
      ></v-list-item>
      <NuxtLink to="/contacts" class="text-decoration-none">
        <v-list-item
          prepend-icon="mdi-email"
          title="Contact Us"
          subtitle="Get in touch with our support team"
        ></v-list-item>
      </NuxtLink>
    </v-list>
  </div>
</template>

<script setup>
const emit = defineEmits(['update:activeTab'])

const goToMessages = () => emit('update:activeTab', 'messages')
</script>
