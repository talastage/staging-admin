<template>
  <div class="d-flex align-center pa-3 border rounded-s">
    <img 
      v-if="country?.flag" 
      :src="country.flag" 
      :alt="country.name + ' flag'"
      class="flag-image mr-2"
    />
    <span v-else class="flag-emoji mr-2">🌍</span>
    <span class="text-caption">+{{ country?.phone_code || '000' }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  country?: {
    flag?: string
    name?: string
    phone_code?: string
  } | null
}

defineProps<Props>()
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.rounded-s {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.flag-emoji {
  font-size: 1.2em;
  line-height: 1;
}

.flag-image {
  width: 20px;
  height: 15px;
  object-fit: cover;
  border-radius: 2px;
}
</style>