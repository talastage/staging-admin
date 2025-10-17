<template>
  <div class="phone-code-select-container">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
      transition="scale-transition"
      max-width="360"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="outlined"
          class="phone-code-selector"
          rounded="lg"
          block
          height="56"
          :disabled="loading"
        >
          <template v-if="selectedCountry">
            <div class="d-flex align-center w-100">
              <div class="flag-container mr-3">
                <img
                  :src="selectedCountry.flag"
                  :alt="selectedCountry.country"
                  class="country-flag"
                  loading="lazy"
                />
              </div>
              <div class="d-flex flex-column align-start">
                <div class="phone-code text-body-1 font-weight-medium">
                  +{{ selectedCountry.code }}
                </div>
                <div class="country-name text-caption text-grey-darken-1">
                  {{ selectedCountry.country }}
                </div>
              </div>
              <v-spacer />
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
              <v-icon size="24" class="mr-3" color="grey-darken-1">
                mdi-phone
              </v-icon>
              <div class="placeholder text-body-1">{{ label }}</div>
              <v-spacer />
              <v-icon
                :class="['transition-transform', menu ? 'rotate-icon' : '']"
                color="grey-darken-1"
              >
                mdi-chevron-down
              </v-icon>
            </div>
          </template>
        </v-btn>
      </template>

      <v-card class="phone-code-menu pa-0" elevation="8" rounded="lg">
        <div class="search-container pa-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search country or code"
            variant="outlined"
            density="comfortable"
            bg-color="grey-lighten-5"
            hide-details
            rounded="lg"
            clearable
          />
        </div>

        <v-divider />

        <div v-if="loading" class="d-flex justify-center align-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else>
          <div class="codes-container">
            <v-list v-if="filteredPhoneCodes.length > 0" class="code-list pa-0" height="320">
              <v-list-item
                v-for="item in filteredPhoneCodes"
                :key="item.id"
                @click="selectPhoneCode(item.code)"
                :class="['code-list-item py-2', { 'selected-item': selectedCode === item.code }]"
                :active="selectedCode === item.code"
                color="primary"
              >
                <template v-slot:prepend>
                  <div class="flag-container">
                    <img
                      :src="item.flag"
                      :alt="item.country"
                      class="country-flag"
                      loading="lazy"
                    />
                  </div>
                </template>

                <v-list-item-title class="d-flex align-center">
                  <span class="phone-code text-body-1 font-weight-medium">
                    +{{ item.code }}
                  </span>
                  <span class="country-name text-caption text-grey-darken-1 ml-3">
                    {{ item.country }}
                  </span>
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <div v-else class="no-results pa-8 d-flex flex-column align-center">
              <v-icon color="grey-lighten-1" size="40" class="mb-3">
                mdi-magnify-close
              </v-icon>
              <span class="text-body-1 text-grey-darken-1">
                No phone codes found matching "{{ searchQuery }}"
              </span>
              <v-btn variant="text" color="primary" class="mt-2" @click="clearSearch">
                Clear search
              </v-btn>
            </div>
          </div>
        </template>
      </v-card>
    </v-menu>

    <div v-if="errorMessages?.length" class="error-container mt-1">
      <p
        v-for="(error, i) in errorMessages"
        :key="i"
        class="text-error text-caption"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'

interface PhoneCodeItem {
  id: number
  code: string
  country: string
  flag: string
}

interface Props {
  modelValue: string
  label?: string
  errorMessages?: string[]
  rules?: ((value: string) => boolean | string)[]
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Select Phone Code',
  errorMessages: () => [],
  rules: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { countries, loading, fetchCountries } = useCountries()
const menu = ref(false)
const searchQuery = ref('')

// Handle v-model binding
const selectedCode = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Format phone codes from countries
const phoneCodes = computed(() => {
  if (!countries.value?.length) return []
  
  return countries.value.map((country) => ({
    id: country.id,
    code: country.phone_code,
    country: country.name,
    flag: country.flag
  }))
})

// Get the currently selected country object
const selectedCountry = computed(() => {
  if (!selectedCode.value || !phoneCodes.value.length) return null
  return phoneCodes.value.find((item) => item.code === selectedCode.value) || null
})

// Filter phone codes based on search query
const filteredPhoneCodes = computed(() => {
  if (!phoneCodes.value.length) return []
  
  const query = searchQuery.value.toLowerCase().trim()
  
  if (!query) return phoneCodes.value
  
  return phoneCodes.value.filter((item) => 
    item.country.toLowerCase().includes(query) || 
    item.code.includes(query)
  )
})

// Initialize countries data
onMounted(async () => {
  if (!countries.value.length) {
    await fetchCountries()
  }
})

function selectPhoneCode(code: string) {
  selectedCode.value = code
  menu.value = false
  searchQuery.value = ''
}

function clearSearch() {
  searchQuery.value = ''
}

// Clear search when menu closes
watch(menu, (isOpen) => {
  if (!isOpen) {
    setTimeout(() => {
      searchQuery.value = ''
    }, 300)
  }
})
</script>

<style scoped>
.phone-code-select-container {
  width: 100%;
  position: relative;
}

.phone-code-selector {
  width: 100%;
  text-transform: none;
  letter-spacing: normal;
  border: 1px solid rgba(var(--v-border-color), 0.25);
  transition: all 0.25s ease;
  justify-content: flex-start;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.phone-code-selector:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.phone-code-selector:focus,
.phone-code-selector:active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.2);
}

.flag-container {
  width: 32px;
  height: 24px;
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.country-flag {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.phone-code {
  font-weight: 600;
}

.country-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rotate-icon {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.phone-code-menu {
  overflow: hidden;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
}

.search-container {
  background-color: rgb(var(--v-theme-surface));
  position: sticky;
  top: 0;
  z-index: 2;
}

.codes-container {
  overflow: hidden;
}

.code-list {
  overflow-y: auto;
  scrollbar-width: thin;
}

.code-list::-webkit-scrollbar {
  width: 6px;
}

.code-list::-webkit-scrollbar-track {
  background: transparent;
}

.code-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

.code-list-item {
  min-height: 56px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.code-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.selected-item {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.no-results {
  height: 200px;
}

.placeholder {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 400;
}

.error-container {
  padding-left: 12px;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-field__input) {
  padding-top: 10px;
  padding-bottom: 10px;
}

:deep(.v-list-item__prepend) {
  margin-right: 16px;
}
</style>