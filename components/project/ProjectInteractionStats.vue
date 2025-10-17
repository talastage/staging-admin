<template>
  <div class="project-interactions">
    <LikesButton :likes="project.likes" />
    <ViewsButton :views="project.views" />
    <SharesButton :shares="project.shares" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  project: {
    type: Object as () => {
      likes: number;
      views: number;
      shares: number;
      [key: string]: any;
    },
    required: true,
  },
});
</script>

<style scoped>
.project-interactions {
  display: flex;
  gap: 1rem;
}
</style>
