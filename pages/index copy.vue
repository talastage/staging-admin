<template>
  <div class="home-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1>Welcome to TalaStage</h1>
          <p>Your Stage to the World of Entertainment</p>
          <v-btn color="primary" to="/watch/test-video">Watch Test Video</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'TalaStage - Your Stage to the World of Entertainment',
  meta: [
    { name: 'description', content: 'Connecting talents across the globe with opportunities to shine and thrive' },
    { property: 'og:title', content: 'TalaStage' },
    { property: 'og:description', content: 'Your Stage to the World of Entertainment' },
  ],
});
</script>

<style scoped>
.home-page {
  padding: 40px 0;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}
</style>
