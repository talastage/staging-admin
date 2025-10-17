<template>
    <h3 class="mb-3">Project Title: {{ item.name }}</h3>
    <UserCard :user="item.user"></UserCard>
</template>

<script setup lang="ts">
const props = defineProps({
    item: {
        type: Object,
        required: true,
        // default: () => ({ })
    },
});
</script>