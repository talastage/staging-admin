<!-- components/help/ArticleView.vue -->
<template>
  <div class="article-view">
    <v-card>
      <v-card-title>{{ article.title }}</v-card-title>
      <v-card-subtitle>
        Last updated: {{ formatDate(article.updated_at) }}
      </v-card-subtitle>

      <v-card-text>
        <div class="article-content" v-html="renderedContent"></div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text v-if="relatedArticles.length">
        <h3 class="text-h6 mb-3">Related Articles</h3>
        <v-list>
          <v-list-item
            v-for="related in relatedArticles"
            :key="related.id"
            :title="related.title"
            @click="$emit('select-article', related)"
          >
            <template v-slot:prepend>
              <v-icon>mdi-file-document-outline</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { HelpArticle } from "~/types/help";
import { marked } from "marked";

const props = defineProps<{
  article: HelpArticle;
  relatedArticles: HelpArticle[];
}>();

defineEmits<{
  (e: "select-article", article: HelpArticle): void;
}>();

const renderedContent = computed(() => {
  return marked(props.article.content);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.article-content {
  line-height: 1.6;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.article-content :deep(p) {
  margin-bottom: 1em;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1em;
  padding-left: 1.5em;
}
</style>
