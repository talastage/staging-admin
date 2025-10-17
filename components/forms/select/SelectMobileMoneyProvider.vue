<template>
  <v-select
    label="Choose a mobile money provider"
    :items="filteredProviders"
    item-value="id"
    :item-title="itemTitle"
    v-model="selectedProviderId"
    @update:model-value="handleProviderChange"
    dense
    clearable
    :loading="loading"
    :disabled="loading"
    :error-messages="errorMessage"
    variant="outlined"
    required
    placeholder="Type to search..."
  ></v-select>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useMobileMoneyProviderStore } from "@/stores/useMobileMoneyProviderStore";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  errorMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);
const store = useMobileMoneyProviderStore();
const authStore = useAuthStore();
const selectedProviderId = ref(null);
const loading = ref(false);

const itemTitle = (item) => `${item.name}`;

// Initialize selectedProviderId when modelValue changes
watch(
  () => props.modelValue,
  (newVal) => {
    selectedProviderId.value = newVal?.id || null;
  },
  { immediate: true }
);

// Filter providers based on user's country
const filteredProviders = computed(() => {
  const userCountryId = authStore.user?.value?.country_id;
  if (!userCountryId) return [];

  return store.providers.filter(
    (provider) => provider.country_id === userCountryId
  );
});

// Handle provider selection change
const handleProviderChange = (newVal) => {
  const provider = store.providers.find((p) => p.id === newVal);
  emit("update:modelValue", provider || null);
};

// Fetch providers on component mount
onMounted(async () => {
  if (!store.isFetched) {
    loading.value = true;
    try {
      await store.fetchMobileMoneyProviders();
    } catch (error) {
      console.error("Failed to fetch mobile money providers:", error);
    } finally {
      loading.value = false;
    }
  }
});
</script>
