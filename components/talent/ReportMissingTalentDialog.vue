<template>
  <v-dialog v-model="dialogVisible" max-width="600px">
    <template v-slot:activator="{ props }">
      <v-btn
        color="secondary"
        variant="tonal"
        v-bind="props"
        class="mt-4"
        block
        prepend-icon="mdi-help-circle-outline"
      >
Request New Category
      </v-btn>
    </template>

    <v-card class="rounded-lg">
      <template v-if="!isSubmitted">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6">Request New Category</span>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
            icon="mdi-information"
          >
            Don't see your entertainment category? Help us expand our platform by suggesting new talent categories for our creative community!
          </v-alert>

          <v-form
            ref="form"
            v-model="isFormValid"
            @submit.prevent="submitReport"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.talent_name"
                  label="Entertainment Category Name"
                  :rules="[(v) => !!v || 'Category name is required']"
                  placeholder="e.g., Voice Acting, Stand-up Comedy, Magic Performance"
                  variant="outlined"
                  required
                />
              </v-col>

              <v-col cols="12" v-if="!selectedCategory">
                <v-select
                  v-model="formData.category_id"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Suggested Category (Optional)"
                  placeholder="Select a category"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  placeholder="Describe this entertainment category and why it would benefit our creative community..."
                  variant="outlined"
                  :rules="[
                    (v) => !!v || 'Description is required',
                    (v) =>
                      v?.length >= 20 ||
                      'Description must be at least 20 characters',
                  ]"
                  rows="3"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeDialog"
            :disabled="isSubmitting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="submitReport"
            :loading="isSubmitting"
            :disabled="!isFormValid"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </template>

      <!-- Success View -->
      <template v-else>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6">Request Submitted</span>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4 text-center">
          <v-icon
            color="success"
            size="64"
            icon="mdi-check-circle"
            class="mb-4"
          ></v-icon>

          <h3 class="text-h6 mb-4">Thank You!</h3>

          <v-alert type="success" variant="tonal" class="mb-4">
            Your category request has been successfully submitted. Our team will review it and consider adding it to help grow our entertainment community.
          </v-alert>

          <p class="text-body-2 text-medium-emphasis">
            We'll notify you once we've reviewed your request. Feel free to continue exploring other entertainment categories in the meantime.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn block color="primary" variant="flat" @click="closeDialog">
            Close
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'

const props = defineProps<{
  selectedCategory?: any
}>()

const { $axios } = useNuxtApp()
const talentStore = useTalentCategoryStore()

const dialogVisible = ref(false)
const isSubmitting = ref(false)
const isFormValid = ref(false)
const isSubmitted = ref(false)
const requestId = ref<number | null>(null)
const form = ref<any>(null)

const categories = computed(() => talentStore.categories)

const formData = ref({
  talent_name: '',
  category_id: props.selectedCategory?.id || null,
  description: '',
  examples: '',
})

const closeDialog = () => {
  dialogVisible.value = false
  if (isSubmitted.value) {
    // Reset everything after the dialog is closed
    setTimeout(() => {
      isSubmitted.value = false
      requestId.value = null
      resetForm()
    }, 300)
  } else {
    resetForm()
  }
}

const resetForm = () => {
  formData.value = {
    talent_name: '',
    category_id: props.selectedCategory?.id || null,
    description: '',
    examples: '',
  }
  if (form.value) {
    form.value.reset()
  }
}

const submitReport = async () => {
  if (!form.value?.validate()) return

  isSubmitting.value = true
  try {
    const response = await $axios.post(
      '/api/talent/report-missing',
      formData.value
    )
    requestId.value = response.data.request_id
    isSubmitted.value = true
  } catch (error) {
    console.error('Error submitting talent request:', error)
    // Handle error appropriately
  } finally {
    isSubmitting.value = false
  }
}

// Watch for category changes
watch(
  () => props.selectedCategory,
  (newCategory) => {
    if (newCategory) {
      formData.value.category_id = newCategory.id
    }
  }
)
</script>
