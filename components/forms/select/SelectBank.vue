<!-- components/forms/select/SelectBank.vue -->
<template>
  <v-select
    :label="label"
    :items="displayBanks"
    item-value="id"
    item-title="name"
    v-model="selectedBank"
    @update:model-value="emitBank"
    @update:search="handleSearch"
    dense
    return-object
    clearable
    :loading="isLoading"
    :disabled="disabled || isLoading"
    :placeholder="placeholder"
    :error-messages="errorMessage"
    :hint="hint"
    :persistent-hint="!!hint"
    autocomplete
    :menu-props="{ maxHeight: 300 }"
  >
    <template #prepend-item v-if="showSearchInfo">
      <v-list-item class="text-caption text-medium-emphasis">
        <v-list-item-title>
          {{ searchInfoText }}
        </v-list-item-title>
      </v-list-item>
      <v-divider />
    </template>

    <template #append-item v-if="canLoadMore">
      <v-divider />
      <v-list-item @click="loadMore" :disabled="isLoading">
        <v-list-item-title class="text-center text-primary">
          <v-progress-circular v-if="isLoading" size="16" indeterminate />
          <span v-else>Load more banks...</span>
        </v-list-item-title>
      </v-list-item>
    </template>

    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <template #prepend v-if="item.raw.logo_url">
          <v-avatar size="24" class="mr-2">
            <v-img :src="item.raw.logo_url" :alt="item.raw.name" />
          </v-avatar>
        </template>
        <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
      </v-list-item>
    </template>

    <template #selection="{ item }" v-if="selectedBank">
      <div class="d-flex align-center">
        <v-avatar v-if="selectedBank.logo_url" size="20" class="mr-2">
          <v-img :src="selectedBank.logo_url" :alt="selectedBank.name" />
        </v-avatar>
        <span>{{ selectedBank.name }}</span>
      </div>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBanks } from '@/composables/useBanks'

interface Bank {
  id: number
  name: string
  logo_url?: string
}

interface Props {
  modelValue?: Bank | null
  banks?: Bank[] // Optional prop to provide banks directly
  label?: string
  placeholder?: string
  disabled?: boolean
  countryId?: number
  hint?: string
  errorMessage?: string
  searchable?: boolean
  showLogo?: boolean
  loadOnMount?: boolean
  searchDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Choose a bank',
  placeholder: 'Type to search...',
  disabled: false,
  searchable: true,
  showLogo: true,
  loadOnMount: true,
  searchDelay: 300,
})

const emit = defineEmits<{
  'update:modelValue': [bank: Bank | null]
  search: [query: string]
  'load-more': []
  error: [error: string]
}>()

// Use composable only if banks are not provided as props
const banksComposable = props.banks ? null : useBanks()

// Local state
const selectedBank = ref<Bank | null>(props.modelValue || null)
const searchQuery = ref('')

// Computed properties
const displayBanks = computed(() => {
  if (props.banks) {
    // If banks are provided as props, filter them locally
    if (!searchQuery.value) return props.banks
    const query = searchQuery.value.toLowerCase()
    return props.banks.filter((bank) => bank.name.toLowerCase().includes(query))
  }

  // Use composable banks
  return banksComposable?.filteredBanks.value || []
})

const isLoading = computed(() => {
  return banksComposable?.loading.value || false
})

const canLoadMore = computed(() => {
  return !props.banks && banksComposable?.hasMore.value && !isLoading.value
})

const showSearchInfo = computed(() => {
  return (
    !props.banks &&
    banksComposable &&
    (banksComposable.totalCount.value > 0 || banksComposable.error.value)
  )
})

const searchInfoText = computed(() => {
  if (!banksComposable) return ''

  if (banksComposable.error.value) {
    return `Error: ${banksComposable.error.value}`
  }

  const total = banksComposable.totalCount.value
  const current = banksComposable.banks.value.length

  if (searchQuery.value) {
    return `Found ${displayBanks.value.length} of ${total} banks`
  }

  return `Showing ${current} of ${total} banks`
})

// Methods
const handleSearch = (query: string) => {
  searchQuery.value = query
  emit('search', query)

  if (!props.banks && banksComposable && props.searchable) {
    banksComposable.debouncedSearch(query, props.searchDelay)
  }
}

const loadMore = async () => {
  if (!banksComposable || props.banks) return

  try {
    emit('load-more')
    await banksComposable.loadMoreBanks({
      search: searchQuery.value || undefined,
      country_id: props.countryId,
    })
  } catch (error: any) {
    emit('error', error.message || 'Failed to load more banks')
  }
}

const emitBank = (bank: Bank | null) => {
  selectedBank.value = bank
  emit('update:modelValue', bank)
}

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedBank.value = newValue
  }
)

watch(
  () => props.countryId,
  (newCountryId) => {
    if (!props.banks && banksComposable) {
      banksComposable.clearSearch()
      banksComposable.fetchBanks({
        country_id: newCountryId,
        limit: 50,
      })
    }
  }
)

// Initialize
onMounted(async () => {
  if (!props.banks && banksComposable && props.loadOnMount) {
    try {
      await banksComposable.fetchBanks({
        country_id: props.countryId,
        limit: 50,
      })
    } catch (error: any) {
      emit('error', error.message || 'Failed to load banks')
    }
  }
})
</script>

<style scoped>
.v-select :deep(.v-field__input) {
  min-height: 40px;
}

.v-avatar {
  flex-shrink: 0;
}
</style>
