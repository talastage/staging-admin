<!-- components/SearchInput.vue -->
<template>
  <v-card class="search-component" elevation="10" rounded="lg">
    <v-text-field
      v-model="searchTerm"
      :placeholder="placeholder"
      :density="density"
      :variant="variant"
      :hide-details="hideDetails"
      :autofocus="autofocus"
      clearable
      single-line
      @keydown.enter="handleSearch"
      @click:clear="clearSearch"
    >
      <template #append>
        <div class="d-flex align-center">
          <v-progress-circular
            v-if="loading"
            indeterminate
            size="24"
            width="2"
            color="primary"
            class="mr-2"
          />
          <v-divider vertical class="mx-2" />
          <v-icon
            icon="mdi-magnify"
            class="text-medium-emphasis cursor-pointer"
            @click="handleSearch"
          />
        </div>
      </template>
    </v-text-field>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
  autofocus?: boolean
  modelValue?: string
  loading?: boolean
  density?: 'default' | 'comfortable' | 'compact'
  variant?: 'outlined' | 'plain' | 'underlined' | 'filled' | 'solo'
  hideDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  autofocus: false,
  modelValue: '',
  loading: false,
  density: 'comfortable',
  variant: 'outlined',
  hideDetails: true,
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const searchTerm = ref(props.modelValue)

const handleSearch = () => {
  emit('search', searchTerm.value)
}

const clearSearch = () => {
  searchTerm.value = ''
  emit('clear')
  emit('update:modelValue', '')
}

watch(searchTerm, (newValue) => {
  emit('update:modelValue', newValue)
})

// Auto-focus functionality
const inputRef = ref<HTMLInputElement>()
onMounted(() => {
  if (props.autofocus && inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<style scoped>
.search-component {
  max-width: 100%;
  margin: 0 auto;
  transition: all 0.3s ease;

  :deep(.v-field__outline) {
    --v-field-border-opacity: 0.2;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.cursor-pointer {
  cursor: pointer;
}

:deep(.v-field__append-inner) {
  padding-inline-start: 0;
}

/* Optional: Add hover effect to the search icon */
:deep(.v-icon.cursor-pointer:hover) {
  opacity: 0.8;
}
</style>
