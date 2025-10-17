<template>
  <div class="comment-list" ref="listRef">
    <CommentItem
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      :projectAccessUuid="projectAccessUuid"
      @commentUpdated="handleCommentUpdate"
    />
    <div v-if="isLoading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useInfiniteScroll } from '@vueuse/core'

const props = defineProps({
  projectAccessUuid: {
    type: String,
    required: true,
  },
})

const { $axios } = useNuxtApp()
const comments = ref<any[]>([])
const currentPage = ref(1)
const hasMoreComments = ref(true)
const isLoading = ref(false)
const listRef = ref<HTMLElement | null>(null)

const loadComments = async (page = 1) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const response = await $axios.get(
      `/guest/projects/${props.projectAccessUuid}/comments`,
      {
        params: { page },
      }
    )
    if (page === 1) {
      comments.value = response.data.data
    } else {
      comments.value.push(...response.data.data)
    }
    hasMoreComments.value = response.data.links.next !== null
    currentPage.value = page
  } catch (error) {
    console.error('Error loading comments:', error)
    // TODO: Add error handling, e.g., show a toast notification
  } finally {
    isLoading.value = false
  }
}

const loadMoreComments = () => {
  if (hasMoreComments.value && !isLoading.value) {
    loadComments(currentPage.value + 1)
  }
}

const addNewComment = (newComment: any) => {
  comments.value.unshift(newComment)
}

const handleCommentUpdate = (updatedComment: any) => {
  const index = comments.value.findIndex((c) => c.id === updatedComment.id)
  if (index !== -1) {
    comments.value[index] = updatedComment
  }
}

onMounted(() => loadComments())

// Set up the infinite scroll using VueUse
useInfiniteScroll(
  document,
  () => {
    if (hasMoreComments.value && !isLoading.value) {
      loadMoreComments()
    }
  },
  { distance: 100 }
)

defineExpose({ addNewComment })
</script>

<style scoped>
.comment-list {
  margin-top: 20px;
}
</style>
