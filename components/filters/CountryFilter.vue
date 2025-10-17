<template>
  <v-select
    v-model="selectedCountry"
    :items="countriesWithAllOption"
    item-title="name"
    item-value="id"
    return-object
    :label="label"
    variant="outlined"
    density="comfortable"
    class="country-filter"
    @update:model-value="updateSelectedCountry"
  >
    <template v-slot:selection="{ item }">
      <v-avatar size="24" class="me-2" v-if="item.raw.flag">
        <v-img :src="item.raw.flag" :alt="item.raw.name"></v-img>
      </v-avatar>
      {{ item.raw.name }}
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" :title="item.raw.name">
        <template v-slot:prepend>
          <v-avatar size="24" class="me-2" v-if="item.raw.flag">
            <v-img :src="item.raw.flag" :alt="item.raw.name"></v-img>
          </v-avatar>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCountryStore } from "@/stores/useCountries";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  label: {
    type: String,
    default: "Filter by Country",
  },
});

const emit = defineEmits(["update:modelValue"]);

const countryStore = useCountryStore();
const authStore = useAuthStore();

const { countries, selectedCountry: storeSelectedCountry } = storeToRefs(countryStore);
const { state: authState } = storeToRefs(authStore);

const selectedCountry = ref(storeSelectedCountry.value);

const countriesWithAllOption = computed(() => {
  const allCountriesOption = { id: "all", name: "All Countries", flag: null };
  return [allCountriesOption, ...countries.value];
});

const getUserCountry = () => {
  if (authState.value.user && authState.value.user.country_id) {
    return countries.value.find(
      (country) => country.id === authState.value.user.country_id
    ) || null;
  }
  return null;
};

const updateSelectedCountry = (country) => {
  selectedCountry.value = country;
  countryStore.setSelectedCountry(country);
  emit("update:modelValue", country);
};

onMounted(async () => {
  if (!countryStore.isFetched) {
    await countryStore.fetchCountries();
  }

  countryStore.loadSelectedCountry();

  if (storeSelectedCountry.value) {
    selectedCountry.value = storeSelectedCountry.value;
  } else {
    const userCountry = getUserCountry();
    if (userCountry) {
      updateSelectedCountry(userCountry);
    } else if (countries.value.length) {
      updateSelectedCountry(countries.value[0]);
    }
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== selectedCountry.value) {
      selectedCountry.value = newValue;
    }
  }
);

watch(
  () => authState.value.user,
  () => {
    const userCountry = getUserCountry();
    if (
      userCountry &&
      (!selectedCountry.value || selectedCountry.value.id === "all")
    ) {
      updateSelectedCountry(userCountry);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.country-filter {
  width: 100%;
}
</style>