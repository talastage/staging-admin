<template>
  <div class="comment-item">
    <div class="comment-header">
      <UserAvatar
        :username="comment.user.username"
        :profile_photo="comment.user.profile_photo"
        size="md"
        class="mr-4"
      />
      <div>
        <div class="text-h6">{{ comment.user.display_name }}</div>
        <div class="text-subtitle-2">{{ formattedDate }}</div>
      </div>
    </div>
    <div class="comment-content text-body-1 mt-4">{{ comment.content }}</div>
    <div class="comment-actions mt-4">
      <v-btn
        variant="text"
        size="large"
        @click="handleReaction('like')"
        :color="comment.user_reaction === 'like' ? 'primary' : ''"
        elevation="10"
      >
        <v-icon size="large" start icon="mdi-thumb-up"></v-icon>
        {{ comment.likes_count }}
      </v-btn>
      <v-btn
        variant="text"
        size="large"
        @click="handleReaction('dislike')"
        :color="comment.user_reaction === 'dislike' ? 'primary' : ''"
        elevation="10"
      >
        <v-icon size="large" start icon="mdi-thumb-down"></v-icon>
        {{ comment.dislikes_count }}
      </v-btn>
      <v-btn
        variant="text"
        size="large"
        @click="showReplyForm = !showReplyForm"
        elevation="10"
      >
        Reply
      </v-btn>
    </div>
    <CommentForm
      v-if="showReplyForm"
      :projectAccessUuid="projectAccessUuid"
      :parentId="comment.id"
      @commentPosted="handleReplyPosted"
      class="mt-4"
    />
    <div v-if="comment.replies_count > 0" class="mt-4">
      <v-btn
        variant="text"
        size="large"
        @click="loadReplies"
        v-if="!showReplies"
        elevation="10"
      >
        View {{ comment.replies_count }} replies
      </v-btn>
      <div v-else class="replies-list">
        <CommentItem
          v-for="reply in replies"
          :key="reply.id"
          :comment="reply"
          :projectAccessUuid="projectAccessUuid"
          class="ml-6 mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useNuxtApp } from "#app";
import { useDateFormatter } from "~/composables/useDateFormatter";

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  projectAccessUuid: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["commentUpdated"]);

const { $axios } = useNuxtApp();
const { formatRelativeDate } = useDateFormatter();
const showReplyForm = ref(false);
const showReplies = ref(false);
const replies = ref<any[]>([]);

const formattedDate = computed(() =>
  formatRelativeDate(props.comment.created_at)
);

const handleReaction = async (type: "like" | "dislike") => {
  try {
    const response = await $axios.post(
      `/api/comments/${props.comment.id}/react`,
      { type }
    );

    if (response.data.message === "Reaction removed successfully") {
      props.comment.user_reaction = null;
      props.comment[`${type}s_count`]--;
    } else {
      if (props.comment.user_reaction && props.comment.user_reaction !== type) {
        props.comment[`${props.comment.user_reaction}s_count`]--;
      }
      props.comment.user_reaction = type;
      props.comment[`${type}s_count`]++;
    }

    emit("commentUpdated", props.comment);
  } catch (error) {
    console.error("Error toggling reaction:", error);
    // TODO: Add error handling, e.g., show a toast notification
  }
};

const handleReplyPosted = (newReply: any) => {
  replies.value.unshift(newReply);
  props.comment.replies_count++;
  showReplyForm.value = false;
  emit("commentUpdated", props.comment);
};

const loadReplies = async () => {
  try {
    const response = await $axios.get(`/api/comments/${props.comment.id}`);
    replies.value = response.data.data.replies;
    showReplies.value = true;
  } catch (error) {
    console.error("Error loading replies:", error);
    // TODO: Add error handling, e.g., show a toast notification
  }
};
</script>

<style scoped>
.comment-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  align-items: center;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.replies-list {
  margin-top: 8px;
  padding-left: 16px;
  border-left: 2px solid #e0e0e0;
}
</style>
