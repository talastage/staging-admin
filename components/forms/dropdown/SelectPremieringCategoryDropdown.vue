<template>
  <div class="select-premiering-category">
    <!-- If we have a selected category and we're NOT showing the dropdown, show the summary + Change button -->
    <div
      v-if="localSelectedCategory && !showDropdown"
      class="selected-category-display"
    >
      <div class="d-flex align-items-center">
        <v-avatar
          v-if="localSelectedCategory.avatar_url"
          :image="localSelectedCategory.avatar_url"
          size="32"
          class="mr-3"
        />
        <div class="category-info">
          <div class="text-subtitle-1 font-weight-medium">
            {{ localSelectedCategory.name }}
          </div>
          <div
            v-if="localSelectedCategory.description"
            class="text-caption text-medium-emphasis"
          >
            {{ localSelectedCategory.description }}
          </div>
        </div>
      </div>

      <!-- Larger "Change" button using BaseButton.vue -->
      <BaseButton
        title="Change"
        :action="openDropdown"
        :disabled="disabled"
        color="primary"
        variant="elevated"
        :height="48"
        elevation="2"
        customClass="ml-4"
      />
    </div>

    <!-- If no category is selected or user clicked Change, show the v-select -->
    <v-select
      v-else
      ref="selectRef"
      v-model="localSelectedCategory"
      :items="categories"
      :loading="isLoading && !categories.length"
      :disabled="disabled"
      v-model:menu="menuOpen"
      item-title="name"
      item-value="slug"
      label="Select Premiering Category"
      placeholder="Choose a category..."
      return-object
      clearable
      density="comfortable"
      variant="outlined"
      :menu-props="{ maxHeight: '400px' }"
      class="category-select"
      :error-messages="errorMessages"
      hide-details="auto"
      @update:model-value="handleSelection"
    >
      <!-- Custom Selection Display -->
      <template #selection="{ item }">
        <v-avatar
          v-if="item?.raw?.avatar_url"
          :image="item.raw.avatar_url"
          size="24"
          class="mr-2"
        />
        {{ item?.raw?.name }}
      </template>

      <!-- Custom Item Display -->
      <template #item="{ item, props }">
        <v-list-item
          v-bind="props"
          :title="item?.raw?.name"
          :subtitle="item?.raw?.description"
          class="category-item"
        >
          <template #prepend>
            <v-avatar
              v-if="item?.raw?.avatar_url"
              :image="item?.raw?.avatar_url"
              size="40"
            />
          </template>
        </v-list-item>
      </template>

      <!-- Loading State -->
      <template #loader>
        <v-progress-linear indeterminate color="primary" />
      </template>

      <!-- No Data State -->
      <template #no-data>
        <v-list-item>
          <v-list-item-title class="text-center py-2">
            No categories available
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { PremieringCategoryBase } from '~/types/PremieringCategoryBase'

// Define Props
const props = defineProps({
  modelValue: {
    type: Object as () => PremieringCategoryBase | null,
    default: null,
  },
  error: {
    type: String,
    default: '',
  },
  categories: {
    type: Array as () => PremieringCategoryBase[],
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  preSelectedCategory: {
    type: Object as () => PremieringCategoryBase | null,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

// Define Emits
const emit = defineEmits<{
  'update:modelValue': [value: PremieringCategoryBase | null]
  'category-selected': [value: PremieringCategoryBase | null]
}>()

// Local State
const localSelectedCategory = ref<PremieringCategoryBase | null>(null)
const showDropdown = ref(false) // Toggles between summary-view vs. select-view
const menuOpen = ref(false) // Controls v-select's menu
const errorMessages = computed(() => (props.error ? [props.error] : []))
const selectRef = ref<any>(null)

// Initialize selected category from props
onMounted(() => {
  if (props.modelValue) {
    localSelectedCategory.value = props.modelValue
  } else if (props.preSelectedCategory) {
    localSelectedCategory.value = props.preSelectedCategory
  }
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localSelectedCategory.value) {
      localSelectedCategory.value = newValue
      showDropdown.value = false
      menuOpen.value = false
    }
  }
)

// Watch for changes to preSelectedCategory
watch(
  () => props.preSelectedCategory,
  (newValue) => {
    if (newValue && !localSelectedCategory.value) {
      localSelectedCategory.value = newValue
      showDropdown.value = false
      menuOpen.value = false
    }
  }
)

// Open the dropdown
function openDropdown() {
  showDropdown.value = true
  menuOpen.value = true
}

// When user closes the menu manually, go back to summary view
watch(menuOpen, (isOpen) => {
  if (!isOpen) {
    // If user didn't select anything, revert
    if (localSelectedCategory.value) {
      showDropdown.value = false
    }
  }
})

// Handle selection
function handleSelection(newValue: PremieringCategoryBase | null) {
  localSelectedCategory.value = newValue
  emit('update:modelValue', newValue)
  emit('category-selected', newValue)

  // Once a valid category is selected, close the dropdown
  if (newValue) {
    showDropdown.value = false
    menuOpen.value = false
  }
}
</script>

<style scoped>
.selected-category-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.category-info {
  flex-grow: 1;
}

.category-select {
  margin-top: 8px;
}
</style>
