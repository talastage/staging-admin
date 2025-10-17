<template>
  <v-card class="talent-card-skeleton" flat :class="`talent-card-skeleton--${size}`">
    <v-skeleton-loader type="card" :loading="true" class="mx-auto">
      <v-card-text>
        <v-skeleton-loader
          type="image"
          height="180"
          class="mb-2"
        ></v-skeleton-loader>
        <v-skeleton-loader type="text" class="mt-2"></v-skeleton-loader>
        <v-skeleton-loader
          type="text"
          width="60%"
          class="mt-2"
        ></v-skeleton-loader>
      </v-card-text>
    </v-skeleton-loader>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
})
</script>

<style scoped>
.talent-card-skeleton {
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-skeleton-loader__image) {
  border-radius: 8px;
  min-height: 180px;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  background-size: 200% 100%;
  animation: shine 1.5s infinite linear;
}

:deep(.v-skeleton-loader__text) {
  border-radius: 4px;
  background: #e0e0e0;
  animation: pulse 1.5s infinite;
}

:deep(.v-skeleton-loader__card) {
  border-radius: 8px;
}

:deep(.v-card-text) {
  padding: 16px;
}

@keyframes shine {
  to {
    background-position-x: -200%;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>