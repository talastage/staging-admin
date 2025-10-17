<!-- components/forms/select/SelectCountry.vue -->
<template>
  <div class="country-select-container">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      transition="scale-transition"
      max-width="400"
      content-class="country-dropdown"
    >
      <template v-slot:activator="{ props }">
        <div class="select-field-wrapper">
          <v-btn
            v-bind="props"
            variant="outlined"
            class="country-selector"
            rounded="lg"
            block
            height="56"
          >
            <template v-if="modelValue">
              <div class="d-flex align-center w-100">
                <div class="flag-container mr-3">
                  <CountryFlag
                    :flag="modelValue.flag"
                    :country-name="modelValue.name"
                  />
                </div>
                <div class="d-flex flex-column align-start flex-grow-1">
                  <div class="country-name text-body-1 font-weight-medium">
                    {{ modelValue.name }}
                  </div>
                  <div class="country-code text-caption text-primary">
                    +{{ modelValue.phone_code }}
                  </div>
                </div>
                <v-icon
                  :class="['transition-transform', menu ? 'rotate-icon' : '']"
                  color="grey-darken-1"
                >
                  mdi-chevron-down
                </v-icon>
              </div>
            </template>
            <template v-else>
              <div class="d-flex align-center w-100">
                <v-icon size="24" class="globe-icon mr-3" color="grey-darken-1"
                  >mdi-earth</v-icon
                >
                <div class="placeholder text-body-1">Select Country</div>
                <v-spacer></v-spacer>
                <v-icon
                  :class="['transition-transform', menu ? 'rotate-icon' : '']"
                  color="grey-darken-1"
                >
                  mdi-chevron-down
                </v-icon>
              </div>
            </template>
          </v-btn>
        </div>
      </template>

      <v-card class="country-menu pa-0" elevation="8" rounded="lg">
        <!-- Search header section -->
        <div class="search-container pa-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search country or dial code"
            variant="outlined"
            density="comfortable"
            bg-color="grey-lighten-5"
            hide-details
            rounded="lg"
            class="search-field"
            clearable
            @click:clear="clearSearch"
            @input="onSearchInput"
          ></v-text-field>
        </div>

        <v-divider></v-divider>

        <!-- Countries list -->
        <div class="countries-container">
          <template v-if="filteredCountries.length > 0">
            <v-list class="country-list pa-0" height="320">
              <v-list-item
                v-for="country in filteredCountries"
                :key="country.id"
                @click="selectCountry(country)"
                :class="[
                  'country-list-item py-2',
                  modelValue?.id === country.id ? 'selected-item' : '',
                ]"
                :active="modelValue?.id === country.id"
                active-color="primary-lighten-4"
              >
                <template v-slot:prepend>
                  <div class="flag-container">
                    <CountryFlag
                      :flag="country.flag"
                      :country-name="country.name"
                    />
                  </div>
                </template>

                <v-list-item-title
                  class="d-flex align-center justify-space-between"
                >
                  <span class="country-name text-body-1">{{
                    country.name
                  }}</span>
                  <span
                    class="country-code text-caption text-primary font-weight-medium"
                    >+{{ country.phone_code }}</span
                  >
                </v-list-item-title>

                <v-divider
                  v-if="
                    filteredCountries.indexOf(country) <
                    filteredCountries.length - 1
                  "
                />
              </v-list-item>
            </v-list>
          </template>

          <!-- Empty state when no results found -->
          <div v-else class="no-results pa-8 d-flex flex-column align-center">
            <v-icon color="grey-lighten-1" size="40" class="mb-3"
              >mdi-magnify-close</v-icon
            >
            <span class="text-body-1 text-grey-darken-1"
              >No countries found matching "{{ searchQuery }}"</span
            >
            <v-btn
              variant="text"
              color="primary"
              class="mt-2"
              @click="clearSearch"
            >
              Clear search
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useCountryStore } from '~/stores/useCountries'

interface Country {
  id: number
  name: string
  flag: string
  phone_code: string
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<Country>,
    default: null,
  },
  placeholder: {
    type: String,
    default: 'Select Country',
  },
})

const emit = defineEmits(['update:modelValue', 'country-selected'])
const countryStore = useCountryStore()
const menu = ref(false)
const searchQuery = ref('')
const recentlySelected = ref<Country[]>([])
const isLoading = ref(true)

// Load recently selected countries from localStorage
onMounted(async () => {
  isLoading.value = true
  try {
    await countryStore.fetchCountries()
    loadRecentSelections()
  } catch (error) {
    console.error('Error loading countries:', error)
  } finally {
    isLoading.value = false
  }
})

const filteredCountries = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  if (!query) {
    // Sort countries to show recently selected at the top
    const regularCountries = [...countryStore.countries]

    if (recentlySelected.value.length > 0) {
      // Remove any duplicates that would show in both lists
      const filteredRegular = regularCountries.filter(
        (country) =>
          !recentlySelected.value.some((recent) => recent.id === country.id)
      )

      return [...recentlySelected.value, ...filteredRegular]
    }

    return regularCountries
  }

  return countryStore.countries.filter((country) => {
    return (
      country.name.toLowerCase().includes(query) ||
      country.phone_code.includes(query)
    )
  })
})

// Save selected countries to show them at the top of the list
function loadRecentSelections() {
  const saved = localStorage.getItem('recentCountries')
  if (saved) {
    try {
      recentlySelected.value = JSON.parse(saved).slice(0, 3) // Limit to top 3
    } catch (e) {
      console.error('Error loading recent countries', e)
    }
  }
}

function saveRecentSelection(country: Country) {
  // Add to recent selections (removing duplicates)
  const existingIndex = recentlySelected.value.findIndex(
    (c) => c.id === country.id
  )

  if (existingIndex !== -1) {
    recentlySelected.value.splice(existingIndex, 1)
  }

  recentlySelected.value.unshift(country)

  // Keep only the last 3 selections
  if (recentlySelected.value.length > 3) {
    recentlySelected.value = recentlySelected.value.slice(0, 3)
  }

  localStorage.setItem(
    'recentCountries',
    JSON.stringify(recentlySelected.value)
  )
}

function selectCountry(country: Country) {
  emit('update:modelValue', country)
  emit('country-selected', country)
  saveRecentSelection(country)
  menu.value = false
  searchQuery.value = ''
}

function clearSearch() {
  searchQuery.value = ''
}

function onSearchInput() {
  // Can add debounce logic here if needed
}

// Close menu when clicking outside
watch(
  () => menu.value,
  (isOpen) => {
    if (!isOpen) {
      setTimeout(() => {
        searchQuery.value = ''
      }, 300)
    }
  }
)
</script>

<style scoped>
.country-select-container {
  width: 100%;
  position: relative;
}

.select-field-wrapper {
  position: relative;
  width: 100%;
}

.country-selector {
  width: 100%;
  text-transform: none;
  letter-spacing: normal;
  border: 2px solid rgba(var(--v-border-color), 0.12);
  background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8));
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  justify-content: flex-start;
  position: relative;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.country-selector:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.1);
  transform: translateY(-1px);
  background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9));
}

.country-selector:focus,
.country-selector:active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}

.flag-container {
  width: 32px;
  height: 24px;
  overflow: hidden;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--v-border-color), 0.15);
  transition: all 0.2s ease;
}

.flag-container:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.flag-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.country-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
  transition: all 0.2s ease;
}

.country-list-item:hover .country-name {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.country-code {
  font-weight: 600;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0.08));
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.country-list-item:hover .country-code {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.2), rgba(var(--v-theme-primary), 0.15));
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(var(--v-theme-primary), 0.2);
}

.rotate-icon {
  transform: rotate(180deg) scale(1.1);
}

.transition-transform {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.country-menu {
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9)) !important;
  border: 1px solid rgba(var(--v-border-color), 0.15);
}

.search-container {
  background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9));
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.countries-container {
  overflow: hidden;
}

.country-list {
  overflow-y: auto;
  scrollbar-width: thin;
}

.country-list::-webkit-scrollbar {
  width: 6px;
}

.country-list::-webkit-scrollbar-track {
  background: transparent;
}

.country-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

.country-list-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 60px;
  cursor: pointer;
  border-radius: 12px;
  margin: 2px 8px;
  position: relative;
  overflow: hidden;
}

.country-list-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.1), transparent);
  transition: left 0.5s ease;
}

.country-list-item:hover {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.04));
  transform: translateX(6px) scale(1.01);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
}

.country-list-item:hover::before {
  left: 100%;
}

.selected-item {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.15), rgba(var(--v-theme-primary), 0.08));
  border-left: 4px solid rgb(var(--v-theme-primary));
  box-shadow: 0 2px 12px rgba(var(--v-theme-primary), 0.2);
  transform: translateX(4px);
}

.no-results {
  height: 200px;
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 0.5), rgba(var(--v-theme-surface), 0.3));
  border-radius: 12px;
  margin: 8px;
}

.no-results .v-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.placeholder {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 400;
  transition: color 0.2s ease;
}

.country-selector:hover .placeholder {
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.globe-icon {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.country-selector:hover .globe-icon {
  opacity: 1;
  transform: rotate(15deg) scale(1.1);
}

/* Enhanced search field styling */
.search-field {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-field:focus-within {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

.search-field :deep(.v-field) {
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.search-field :deep(.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.4);
}

:deep(.v-field__input) {
  padding-top: 10px;
  padding-bottom: 10px;
}

:deep(.v-list-item__prepend) {
  margin-right: 16px;
}
</style>
