import { defineStore } from "pinia";

export const useCommentStore = defineStore("comment", {
  state: () => ({
    comments: [] as any[],
  }),
  actions: {
    addComment(comment: any) {
      this.comments.unshift(comment);
    },
    addComments(newComments: any[]) {
      this.comments.push(...newComments);
    },
    updateComment(updatedComment: any) {
      const index = this.comments.findIndex((c) => c.id === updatedComment.id);
      if (index !== -1) {
        this.comments[index] = { ...this.comments[index], ...updatedComment };
      }
    },
    addReply(parentId: number, reply: any) {
      const parentComment = this.comments.find((c) => c.id === parentId);
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(reply);
        parentComment.replies_count = (parentComment.replies_count || 0) + 1;
      }
    },
    updateCommentReaction(commentId: number, newReactionState: any) {
      const comment = this.comments.find((c) => c.id === commentId);
      if (comment) {
        comment.likes_count = newReactionState.likes_count;
        comment.dislikes_count = newReactionState.dislikes_count;
        comment.user_reaction = newReactionState.user_reaction;
      }
    },
  },
});
