<template>
  <v-card
    :class="['talent-card', { 'talent-card--selected': isSelected }]"
    @click="$emit('select', talent)"
    :elevation="isSelected ? 2 : 0"
    :color="isSelected ? 'grey-lighten-3' : 'transparent'"
    flat
  >
    <v-list-item>
      <template v-slot:prepend>
        <v-avatar size="40" color="grey-lighten-3">
          <v-img
            v-if="talent.avatar_url"
            :src="talent.avatar_url"
            :alt="talent.name"
            cover
          />
          <v-icon v-else icon="mdi-account" />
        </v-avatar>
      </template>
      <v-list-item-title>{{ talent.name }}</v-list-item-title>
      <v-list-item-subtitle class="text-truncate">{{
        talent.description
      }}</v-list-item-subtitle>
      <template v-slot:append v-if="isSelected && showRemoveButton">
        <v-btn icon size="small" @click.stop="$emit('remove')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-list-item>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

interface Talent {
  id: number;
  name: string;
  description: string;
  avatar_url?: string;
}

const props = defineProps<{
  talent: Talent;
  isSelected?: boolean;
  showRemoveButton?: boolean;
}>();

defineEmits(["select", "remove"]);
</script>

<style scoped>
.talent-card {
  transition: background-color 0.2s ease;
}

.talent-card:hover {
  background-color: var(--v-grey-lighten4);
}

.talent-card--selected {
  background-color: var(--v-grey-lighten3);
}
</style>
