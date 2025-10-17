<template>
  <v-select
    label="Choose a language"
    :items="languages"
    item-value="id"
    :item-title="itemText"
    v-model="selectedLanguageId"
    @change="emitLanguage"
    dense
    clearable
    placeholder="Type to search..."
  ></v-select>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useLanguageStore } from "@/stores/useLanguages";

const emit = defineEmits(["update:language"]);
const store = useLanguageStore();
const selectedLanguageId = ref(null);

onMounted(async () => {
  if (!store.isFetched) {
    await store.fetchLanguages();
  }
  if (store.selectedLanguage) {
    selectedLanguageId.value = store.selectedLanguage.id;
  }
});

const itemText = (item) => `${item.name}`;

const languages = computed(() => {
  return store.languages.map((language) => ({
    id: language.id,
    name: language.name,
  }));
});

const emitLanguage = (newVal) => {
  emit("update:language", newVal);
};
</script>
