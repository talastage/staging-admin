<template>
  <div class="category-select-dropdown">
    <!-- If we have a selected item and we're NOT showing the dropdown, show summary + Change button -->
    <div
      v-if="localSelectedItem && !showDropdown"
      class="selected-item-display"
    >
      <div class="d-flex align-items-center">
        <v-avatar
          v-if="localSelectedItem.image_url"
          :image="localSelectedItem.image_url"
          size="32"
          class="mr-3"
        />
        <div class="item-info">
          <div class="text-subtitle-1 font-weight-medium">
            {{ localSelectedItem.name }}
          </div>
          <div
            v-if="localSelectedItem.description"
            class="text-caption text-medium-emphasis"
          >
            {{ localSelectedItem.description }}
          </div>
        </div>
      </div>

      <!-- "Change" button using your BaseButton.vue for reusability -->
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

    <!-- If no item is selected or user clicked Change, show the v-select -->
    <v-select
      v-else
      ref="selectRef"
      v-model="localSelectedItem"
      :items="items"
      :loading="isLoading && !items.length"
      :disabled="disabled"
      v-model:menu="menuOpen"
      :item-title="itemTitle"
      :item-value="itemValue"
      :label="label"
      :placeholder="placeholder"
      return-object
      clearable
      density="comfortable"
      variant="outlined"
      :menu-props="{ maxHeight: '400px' }"
      class="generic-category-select"
      :error-messages="errorMessages"
      hide-details="auto"
      @update:model-value="handleSelection"
    >
      <!-- Custom Selection Display -->
      <template #selection="{ item }">
        <v-avatar
          v-if="item?.raw?.image_url"
          :image="item.raw.image_url"
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
          class="generic-category-item"
        >
          <template #prepend>
            <v-avatar
              v-if="item?.raw?.image_url"
              :image="item?.raw?.image_url"
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
            No items available
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'

// Define Props
const props = defineProps({
  modelValue: {
    // The currently selected item (object) or null
    type: Object,
    default: null,
  },
  errorMessage: {
    // Error text to display (optional)
    type: String,
    default: '',
  },
  items: {
    // Array of items to choose from
    type: Array,
    default: () => [],
  },
  isLoading: {
    // Whether to show the loading spinner
    type: Boolean,
    default: false,
  },
  preSelectedItem: {
    // An optional item to select by default
    type: Object,
    default: null,
  },
  disabled: {
    // Disables the entire component
    type: Boolean,
    default: false,
  },
  label: {
    // The label for the select
    type: String,
    default: 'Select an Item',
  },
  placeholder: {
    // The placeholder for the select
    type: String,
    default: 'Choose...',
  },
  itemTitle: {
    // The object property name to display in the list
    type: String,
    default: 'name',
  },
  itemValue: {
    // The object property name used as the v-model "value"
    type: String,
    default: 'slug',
  },
})

// Define Emits
const emit = defineEmits<{
  'update:modelValue': [value: any | null]
  'item-selected': [value: any | null]
}>()

// Local State
const localSelectedItem = ref<any | null>(null)
const showDropdown = ref(false) // Toggles between summary-view vs. select-view
const menuOpen = ref(false) // Controls v-select's menu
const errorMessages = computed(() =>
  props.errorMessage ? [props.errorMessage] : []
)
const selectRef = ref<any>(null)

// Initialize selected item from props
onMounted(() => {
  if (props.modelValue) {
    localSelectedItem.value = props.modelValue
  } else if (props.preSelectedItem) {
    localSelectedItem.value = props.preSelectedItem
  }
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localSelectedItem.value) {
      localSelectedItem.value = newValue
      showDropdown.value = false
      menuOpen.value = false
    }
  }
)

// Watch for changes to preSelectedItem
watch(
  () => props.preSelectedItem,
  (newValue) => {
    if (newValue && !localSelectedItem.value) {
      localSelectedItem.value = newValue
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

// When user closes the menu manually, revert to summary if we have a selected item
watch(menuOpen, (isOpen) => {
  if (!isOpen) {
    if (localSelectedItem.value) {
      showDropdown.value = false
    }
  }
})

// Handle selection
function handleSelection(newValue: any | null) {
  localSelectedItem.value = newValue
  emit('update:modelValue', newValue)
  emit('item-selected', newValue)

  // Once a valid item is selected, close the dropdown
  if (newValue) {
    showDropdown.value = false
    menuOpen.value = false
  }
}
</script>

<style scoped>
.category-select-dropdown {
  width: 100%;
}

.selected-item-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.item-info {
  flex-grow: 1;
}

.generic-category-select {
  margin-top: 8px;
}
</style>
