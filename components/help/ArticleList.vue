<!-- components/help/ArticleList.vue -->
<template>
    <div class="article-list">
      <v-list>
        <v-list-item
          v-for="article in articles"
          :key="article.id"
          :title="article.title"
          :subtitle="formatDate(article.updated_at)"
          @click="$emit('select-article', article)"
        >
          <template v-slot:prepend>
            <v-icon>mdi-file-document-outline</v-icon>
          </template>
          <template v-slot:append>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { HelpArticle } from '~/types/help';
  
  defineProps<{
    articles: HelpArticle[];
  }>();
  
  defineEmits<{
    (e: 'select-article', article: HelpArticle): void;
  }>();
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };
  </script>