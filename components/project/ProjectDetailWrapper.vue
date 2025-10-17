<template>
    <div class="project-detail-wrapper">
        <!-- Creator's Avatar and Project Information Side by Side -->
        <div class="creator-avatar-and-info">
            <UserAvatar :user="project.creator" cardSize="small" :hideName="false" />
            <div class="project-and-creator-info">
                <ProjectTitle :title="project.name" :maxLength="50" :creator="project.creator" />
            </div>
        </div>
        <div class="separator"></div>
        <ProjectWatchingDetails :watchingCount="project.watchings" :publishDate="project.created_at" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    project: Object
});
</script>

<style scoped>
.project-detail-wrapper {
    display: flex;
    flex-direction: column;
}

.creator-avatar-and-info {
    display: flex;
    align-items: center;
    gap: 12px;
    /* Adjust based on design */
}

.project-and-creator-info {
    display: flex;
    flex-direction: column;
}

.creator-name {
    margin-top: 4px;
    /* Space between title and creator name */
    font-size: 0.9em;
    /* Adjust based on design */
    color: #666;
    /* Subdued text color, adjust as needed */
}
</style>