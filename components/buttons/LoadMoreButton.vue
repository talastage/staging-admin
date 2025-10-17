<template>
  <v-btn
    v-if="hasMore"
    @click="$emit('load-more')"
    color="primary"
    class="mt-4"
    :loading="loading"
    block
  >
    Load More
  </v-btn>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
  hasMore: boolean;
}>();

defineEmits<{
  (e: "load-more"): void;
}>();
</script>
