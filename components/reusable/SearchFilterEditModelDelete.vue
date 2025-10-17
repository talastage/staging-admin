<script setup lang="ts">
import { ref } from 'vue';
const page = ref({ title: 'Contact List' });

const breadcrumbs = ref([
    {
        text: '2 New Contacts',
        disabled: true,
        href: '#'
    }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <EditableTable1 />
        </v-card-text>
    </v-card>
</template>
