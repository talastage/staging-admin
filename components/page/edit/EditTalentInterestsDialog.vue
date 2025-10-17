<!-- components/page/edit/EditTalentInterestsDialog.vue -->
<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Investment Talent Categories"
    max-width="800px"
  >
    <template #title>
      <div class="d-flex align-center">
        <span>Investment Talent Categories</span>
        <v-chip class="ml-4" color="info" size="small">
          {{ selectedInterests.length }} Selected
        </v-chip>
      </div>
    </template>

    <v-alert
      v-if="errorMessages.length > 0"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <ul class="ps-4">
        <li v-for="(error, index) in errorMessages" :key="index">
          {{ error }}
        </li>
      </ul>
    </v-alert>

    <!-- Selected Interests Section -->
    <v-sheet class="mb-4 pa-4" rounded border>
      <div class="text-subtitle-1 mb-2">Selected Categories</div>
      <div class="d-flex flex-wrap">
        <v-chip
          v-for="interest in selectedInterests"
          :key="interest.id"
          color="primary"
          class="ma-1"
          closable
          @click:close="removeInterest(interest)"
        >
          {{ interest.name }}
        </v-chip>

        <div v-if="selectedInterests.length === 0" class="text-grey pa-2">
          Select talent categories you're interested in investing
        </div>
      </div>
    </v-sheet>

    <!-- Category Selection Section -->
    <v-sheet class="pa-4" rounded border>
      <div class="text-subtitle-1 mb-2">Add New Category</div>
      <v-row>
        <v-col cols="12">
          <SelectTalentCategory
            v-model="selectedCategory"
            :disabled="loading"
            placeholder="Select a talent category"
          />
        </v-col>

        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            color="primary"
            variant="tonal"
            :disabled="!selectedCategory || loading"
            @click="addInterest"
            prepend-icon="mdi-plus"
          >
            Add Category
          </v-btn>
        </v-col>
      </v-row>
    </v-sheet>

    <template #actions>
      <v-spacer></v-spacer>
      <v-btn
        color="grey-darken-1"
        variant="text"
        @click="handleClose"
        :disabled="loading"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        @click="handleSave"
        :loading="loading"
        :disabled="selectedInterests.length === 0"
      >
        Save Categories
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SelectTalentCategory from '~/components/talent/SelectTalentCategory.vue'
import BaseDialog from '~/components/dialogs/BaseDialog.vue'

interface TalentInterest {
  id: number
  name: string
}

const props = defineProps<{
  modelValue: boolean
  talentInterests: TalentInterest[]
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [interests: TalentInterest[]]
  close: []
}>()

const loading = ref(false)
const selectedInterests = ref<TalentInterest[]>([])
const selectedCategory = ref<any>(null)

// Computed property for error messages
const errorMessages = computed(() => {
  const messages: string[] = []
  if (props.errors) {
    Object.values(props.errors).forEach((errors) => {
      errors.forEach((error) => messages.push(error))
    })
  }
  return messages
})

// Initialize selected interests when the dialog opens
onMounted(() => {
  selectedInterests.value = [...props.talentInterests]
})

// Add a new talent interest
const addInterest = () => {
  if (!selectedCategory.value) return

  // Check if the interest is already selected to avoid duplicates
  const exists = selectedInterests.value.some(
    (interest) => interest.id === selectedCategory.value.id
  )

  if (!exists) {
    selectedInterests.value.push({
      id: selectedCategory.value.id,
      name: selectedCategory.value.name,
    })
  } else {
    // Optional: Show a message that category is already selected
  }

  // Reset selection for next addition
  selectedCategory.value = null
}

// Remove a talent interest
const removeInterest = (interest: TalentInterest) => {
  selectedInterests.value = selectedInterests.value.filter(
    (item) => item.id !== interest.id
  )
}

// Handle dialog close
const handleClose = () => {
  selectedInterests.value = [...props.talentInterests] // Reset to original state
  emit('close')
  emit('update:modelValue', false)
}

// Handle save action
const handleSave = async () => {
  loading.value = true
  try {
    await emit('save', selectedInterests.value)
    emit('update:modelValue', false)
  } finally {
    loading.value = false
  }
}
</script>
