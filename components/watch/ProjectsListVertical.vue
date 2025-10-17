<template>
    <div class="projects-list-vertical">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    projects: {
        type: Array,
        required: true,
    },
});
</script>

<style scoped>
.projects-list-vertical {
    display: flex;
    flex-direction: column;
    gap: 20px;
    /* Space between project cards */
    padding: 10px 0;
}
</style>