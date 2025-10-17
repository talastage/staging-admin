<!-- components/ContactList.vue -->
<template>
  <v-list>
    <v-list-item v-if="contacts.email">
      <template v-slot:prepend>
        <v-icon>mdi-email</v-icon>
      </template>
      <v-list-item-title>
        <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
      </v-list-item-title>
    </v-list-item>

    <v-list-item v-if="contacts.phone_number">
      <template v-slot:prepend>
        <v-icon>mdi-phone</v-icon>
      </template>
      <v-list-item-title>
        <a :href="`tel:${contacts.phone_number}`">{{
          contacts.phone_number
        }}</a>
      </v-list-item-title>
    </v-list-item>

    <v-list-item v-if="contacts.whatsapp_number">
      <template v-slot:prepend>
        <v-icon>mdi-whatsapp</v-icon>
      </template>
      <v-list-item-title>
        <a :href="`https://wa.me/${contacts.whatsapp_number}`">WhatsApp</a>
      </v-list-item-title>
    </v-list-item>

    <v-list-item v-if="contacts.website_url">
      <template v-slot:prepend>
        <v-icon>mdi-web</v-icon>
      </template>
      <v-list-item-title>
        <a
          :href="contacts.website_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          Website
        </a>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { Contact } from '~/types/page'

defineProps<{
  contacts: Contact
}>()
</script>
