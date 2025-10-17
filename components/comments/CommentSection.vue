<template>
  <v-card flat class="mt-4">
    <v-card-title>Comments</v-card-title>
    <v-card-text>
      <CommentForm :projectAccessUuid="accessUuid" @commentPosted="handleNewComment" />
      <CommentList :projectAccessUuid="accessUuid" ref="commentList" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const accessUuid = computed(() => route.params.access_uuid as string);
const commentList = ref(null);

const handleNewComment = (newComment: any) => {
  if (commentList.value) {
    commentList.value.addNewComment(newComment);
  }
};
</script>