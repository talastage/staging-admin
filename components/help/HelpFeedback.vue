<template>
  <div class="d-flex align-center">
    <p class="text-body-2 text-grey-darken-1 mr-4">Was this article helpful?</p>
    <div class="d-flex">
      <v-btn
        variant="outlined"
        size="small"
        class="mr-2"
        :loading="isSubmittingFeedback"
        :disabled="hasSubmittedFeedback"
        @click="submitFeedback(true)"
      >
        <v-icon size="small" class="mr-1">mdi-thumb-up</v-icon>
        Yes
        <span v-if="feedback?.upvotes" class="ml-1"
          >({{ feedback.upvotes }})</span
        >
      </v-btn>
      <v-btn
        variant="outlined"
        size="small"
        :loading="isSubmittingFeedback"
        :disabled="hasSubmittedFeedback"
        @click="submitFeedback(false)"
      >
        <v-icon size="small" class="mr-1">mdi-thumb-down</v-icon>
        No
        <span v-if="feedback?.downvotes" class="ml-1"
          >({{ feedback.downvotes }})</span
        >
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useHelpFeedback } from '@/composables/help/useHelpFeedback'

interface Props {
  articleId: number
}

const props = defineProps<Props>()
const {
  feedback,
  isSubmittingFeedback,
  hasSubmittedFeedback,
  loadFeedback,
  submitFeedback,
  checkPreviousFeedback,
} = useHelpFeedback(props.articleId)

onMounted(() => {
  loadFeedback()
  checkPreviousFeedback()
})
</script>
