<!-- ProjectWatchingDetails.vue -->
<template>
    <div class="project-watching-details">
        <CountStats :watchings="watchingCount" />
        <!-- <DateDisplay :date="publishDate" :withTime="false" /> -->
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    watchingCount: Number,
    publishDate: String
});
</script>

<style scoped>
.project-watching-details {
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>
