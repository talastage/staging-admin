
<template>
    <v-card>
        <NuxtLink :to="`/user/${props.user.id}`">
            <v-img :src="props.user.profile_photo || 'https://via.placeholder.com/640x480.png/00bbee?text=No+Photo'"
                alt="User Photo"></v-img>
        </NuxtLink>
        <v-card-title>{{ props.user.display_name || 'N/A' }}</v-card-title>
        <v-card-subtitle>
            <p>Email: {{ props.user.email || 'N/A' }}</p>
            <p>First Name: {{ props.user.first_name || 'N/A' }}</p>
            <p>Last Name: {{ props.user.last_name || 'N/A' }}</p>
            <p>Phone: {{ props.user.phone || 'N/A' }}</p>
            <p>Talent Category: {{ props.user.talent_category_name || 'N/A' }}</p>
        </v-card-subtitle>
    </v-card>
</template>
  
<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});
</script>
  
<style scoped>
/* Your styles here */
</style>
  