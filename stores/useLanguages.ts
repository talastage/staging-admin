import { defineStore } from "pinia";
import { ref } from "vue";
import { useNuxtApp } from "#app";
import { Language } from "@/types/Language"; // Assuming you have a Language type defined

export const useLanguageStore = defineStore("languages", () => {
  const languages = ref<Language[]>([]);
  const selectedLanguage = ref<Language | null>(null);
  const isFetched = ref(false);

  const { $axios } = useNuxtApp();

  const fetchLanguages = async () => {
    try {
      const response = await $axios.get("/api/languages");
      languages.value = response.data.data; // Assuming the API response structure
      isFetched.value = true;

      // Set the default or user-selected language
      const defaultLanguage = languages.value.find((lang) => lang.default);
      if (defaultLanguage) {
        selectedLanguage.value = defaultLanguage;
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const updateLanguage = async (languageId: number) => {
    try {
      await $axios.put("/api/settings/language", {
        language_id: languageId,
      });
      const updatedLanguage = languages.value.find(
        (language) => language.id === languageId
      );
      if (updatedLanguage) {
        selectedLanguage.value = updatedLanguage;
      }
      console.log("Language updated successfully.");
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  return {
    languages,
    selectedLanguage,
    isFetched,
    fetchLanguages,
    updateLanguage,
  };
});
