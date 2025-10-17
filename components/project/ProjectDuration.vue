<!-- ProjectDuration.vue -->
<template>
    <div class="project-duration">{{ formattedDuration }}</div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps({
    duration: Number, // duration in seconds
});

const formattedDuration = computed(() => {
    const hours = Math.floor(props.duration / 3600);
    const minutes = Math.floor((props.duration % 3600) / 60);
    const seconds = Math.floor(props.duration % 60);
    return [
        hours ? String(hours).padStart(2, '0') : null,
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0')
    ].filter(Boolean).join(':');
});
</script>

<style scoped>
.project-duration {
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 2px 4px;
    border-radius: 2px;
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 14px;
}
</style>