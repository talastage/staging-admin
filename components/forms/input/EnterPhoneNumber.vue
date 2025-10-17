<template>
  <div class="d-flex align-center">
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="outlined"
          class="country-selector mr-2"
          min-width="100"
        >
          <img
            v-if="selectedCountry"
            :src="selectedCountry.flag"
            :alt="selectedCountry.name"
            class="country-flag mr-2"
            width="24"
            height="18"
          />
          <span>+{{ selectedCountry?.phone_code || "" }}</span>
          <v-icon end>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list height="300" class="overflow-y-auto">
        <v-list-item
          v-for="country in countries"
          :key="country.id"
          @click="selectCountry(country)"
        >
          <v-list-item-title class="d-flex align-center">
            <img
              :src="country.flag"
              :alt="country.name"
              class="mr-2"
              width="24"
              height="18"
            />
            {{ country.name }} (+{{ country.phone_code }})
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-text-field
      v-model="localPhoneNumber"
      placeholder="Phone number"
      variant="outlined"
      density="comfortable"
      hide-details
      class="flex-grow-1"
      @input="emitPhoneNumber"
    ></v-text-field>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useCountryStore } from "~/stores/useCountries";

const props = defineProps({
  modelValue: String,
  countryId: Number,
});

const emit = defineEmits(["update:modelValue", "update:countryId"]);

const countryStore = useCountryStore();
const countries = computed(() => countryStore.countries);

const selectedCountry = ref(null);
const localPhoneNumber = ref("");

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localPhoneNumber.value) {
      const phoneCodeRegex = new RegExp(
        `^\\+${selectedCountry.value?.phone_code || ""}`
      );
      localPhoneNumber.value = newValue.replace(phoneCodeRegex, "");
    }
  }
);

watch(
  () => props.countryId,
  (newValue) => {
    if (newValue !== selectedCountry.value?.id) {
      selectedCountry.value =
        countries.value.find((country) => country.id === newValue) || null;
    }
  }
);

const selectCountry = (country) => {
  selectedCountry.value = country;
  emit("update:countryId", country.id);
  emitPhoneNumber();
};

const emitPhoneNumber = () => {
  const fullNumber = selectedCountry.value
    ? `+${selectedCountry.value.phone_code}${localPhoneNumber.value}`
    : localPhoneNumber.value;
  emit("update:modelValue", fullNumber);
};

// Initialize with a default country (e.g., Rwanda) if not set
if (!selectedCountry.value && countries.value.length > 0) {
  const defaultCountry =
    countries.value.find((country) => country.name === "Rwanda") ||
    countries.value[0];
  selectCountry(defaultCountry);
}
</script>

<style scoped>
.country-selector {
  min-width: 100px;
}
.country-flag {
  width: 24px;
  height: 18px;
  object-fit: cover;
}
</style>
