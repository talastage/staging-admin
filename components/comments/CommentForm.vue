<template>
  <div class="comment-form mb-6">
    <v-textarea
      v-model="commentText"
      label="Write a comment..."
      rows="3"
      :loading="isSubmitting"
      hide-details
      class="mb-2"
      variant="outlined"
      @keydown="handleKeyDown"
      @focus="handleFocus"
    ></v-textarea>
    <div class="d-flex justify-end">
      <v-btn
        color="primary"
        @click="handleSubmit"
        :disabled="!commentText.trim() || isSubmitting"
        :loading="isSubmitting"
        class="submit-btn"
        elevation="10"
      >
        Post
      </v-btn>
    </div>
  </div>
 </template>
 
 <script setup lang="ts">
 import { ref } from 'vue';
 import { useNuxtApp } from '#app';
 import { useAuthStore } from '~/stores/auth';
 import { useLoginDialogStore } from '~/stores/loginDialog';
 
 const props = defineProps({
  projectAccessUuid: {
    type: String,
    required: true
  },
  parentId: {
    type: Number,
    default: null
  }
 });
 
 const emit = defineEmits(['commentPosted']);
 const { $axios, $protectedAction } = useNuxtApp();
 const authStore = useAuthStore();
 const loginDialogStore = useLoginDialogStore();
 
 const commentText = ref('');
 const isSubmitting = ref(false);
 
 const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
 };
 
 const handleFocus = () => {
  if (!authStore.isLoggedIn) {
    loginDialogStore.show();
  }
 };
 
 const submitComment = async () => {
  if (!commentText.value.trim()) return;
  isSubmitting.value = true;
  
  const endpoint = props.parentId
    ? `/api/comments/${props.parentId}/replies`
    : `/api/projects/${props.projectAccessUuid}/comments`;
  
  const response = await $axios.post(endpoint, {
    content: commentText.value,
  });
  
  commentText.value = '';
  emit('commentPosted', response.data.data);
  isSubmitting.value = false;
 };
 
 const handleSubmit = () => {
  $protectedAction(submitComment, {
    onError: (error) => {
      console.error('Error posting comment:', error);
    }
  });
 };
 </script>