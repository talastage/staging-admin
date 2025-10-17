<template>
  <v-card elevation="10" class="pa-2">
    <v-list>
      <v-list-item v-for="n in 3" :key="n">
        <template v-slot:prepend>
          <v-skeleton-loader type="avatar" size="24" />
        </template>
        
        <div class="d-flex flex-column gap-1">
          <v-skeleton-loader type="text" width="200" />
          <v-skeleton-loader type="text" width="120" />
        </div>
        
        <v-divider v-if="n < 3" class="mt-2" />
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
// No additional logic needed
</script>