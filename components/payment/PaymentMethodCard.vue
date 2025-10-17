<template>
  <v-card
    :class="[
      'payment-method-card',
      { 'payment-method-card--selected': selected },
    ]"
    @click="$emit('select')"
    elevation="2"
  >
    <v-card-text class="d-flex align-center">
      <v-checkbox
        :model-value="selected"
        @change="$emit('select')"
        hide-details
        class="mr-2"
      ></v-checkbox>
      <v-avatar size="40" class="mr-3">
        <v-img :src="method.logo" :alt="method.name" cover></v-img>
      </v-avatar>
      <div>
        <div class="text-subtitle-1 font-weight-medium">{{ method.name }}</div>
        <div
          v-if="method.description"
          class="text-caption text-medium-emphasis"
        >
          {{ method.description }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  method: {
    name: string;
    logo: string;
    description?: string;
  };
  selected: boolean;
}>();

defineEmits(["select"]);
</script>

<style scoped>
.payment-method-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method-card:hover {
  transform: translateY(-2px);
}

.payment-method-card--selected {
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>
