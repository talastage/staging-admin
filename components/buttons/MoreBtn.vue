<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) in menuList"
        :key="i"
        @click="handleSelection(item)"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
const props = defineProps({
  menuList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["select"]);

const handleSelection = (item) => {
  emit("select", item);
};
</script>
