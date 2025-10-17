<template>
  <div class="project-detail">
    <v-row>
      <!-- Project Details Form -->
      <v-col cols="12" md="8">
        <v-text-field
          v-model="localProject.name"
          label="Project Name"
          variant="outlined"
          class="mb-4 project-name-field"
          :rules="[(v) => !!v || 'Project name is required']"
          required
          placeholder="Enter your project name"
          @input="debouncedSave"
        />

        <v-text-field
          v-model="localProject.project_url"
          label="Project URL"
          variant="outlined"
          class="mb-4 project-url-field"
          :rules="[
            (v) => !!v || 'Project URL is required',
            (v) => isValidUrl(v) || 'Enter a valid URL',
          ]"
          required
          placeholder="Enter the project URL (e.g., YouTube link)"
          @input="debouncedSave"
        />

        <v-textarea
          v-model="localProject.description"
          label="Description (Optional)"
          variant="outlined"
          rows="3"
          auto-grow
          class="mb-4 project-description-field"
          :counter="5000"
          :rules="[
            (v) =>
              v.length <= 5000 || 'Description must be 5000 characters or less',
          ]"
          placeholder="Tell viewers about your project"
          @input="debouncedSave"
        />

        <SelectCategoryDropdown
          :categories="categories"
          v-model="localProject.category_id"
          @category-selected="handleCategorySelected"
          :loading="isFetchingCategories"
        />
      </v-col>

      <!-- Project Preview Section -->
      <v-col cols="12" md="4">
        <v-card elevation="1" class="project-preview-card">
          <v-card-title>Project Preview</v-card-title>
          <v-card-text>
            <p><strong>Name:</strong> {{ localProject.name || 'Not Set' }}</p>
            <p>
              <strong>URL:</strong>
              <a :href="localProject.project_url" target="_blank">{{
                localProject.project_url || 'Not Set'
              }}</a>
            </p>
            <p><strong>Category:</strong> {{ categoryName || 'Not Set' }}</p>
            <p>
              <strong>Description:</strong>
              {{ localProject.description || 'Not Set' }}
            </p>
          </v-card-text>

          <!-- Video Preview -->
          <v-card-actions>
            <VideoPreview
              v-if="localProject.project_url"
              :videoUrl="localProject.project_url"
              :autoplay="false"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import debounce from 'lodash/debounce'
import { useToast } from 'vue-toastification'
import { useProjectCategoryStore } from '@/stores/useProjectCategories'

// Props and emits
defineProps({
  project: {
    type: Object,
    required: true,
  },
})
defineEmits(['details-saved', 'update:project'])

const toast = useToast()
const projectCategoryStore = useProjectCategoryStore()

// Local state
const localProject = ref({ ...props.project })

// Debounced save function to update project details
const debouncedSave = debounce(() => {
  if (
    !localProject.value.name ||
    !localProject.value.project_url ||
    !localProject.value.category_id
  ) {
    return
  }

  emit('update:project', localProject.value)
  emit('details-saved', localProject.value)
}, 500)

// Watch for updates to the props and sync them with the local state
watch(
  () => props.project,
  (newProject) => {
    localProject.value = { ...localProject.value, ...newProject }
  },
  { deep: true }
)

// Handle category selection
function handleCategorySelected(categoryId) {
  localProject.value.category_id = categoryId
  debouncedSave()
}

// Fetch categories from the store
const categories = computed(() => projectCategoryStore.categories)
const isFetchingCategories = computed(() => projectCategoryStore.isFetching)

onMounted(async () => {
  if (!categories.value.length) {
    try {
      await projectCategoryStore.fetchCategories()
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories. Please try again.')
    }
  }
})

// Validate URL
function isValidUrl(url) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  )
  return !!pattern.test(url)
}

// Computed category name for the preview
const categoryName = computed(() => {
  const category = categories.value.find(
    (cat) => cat.id === localProject.value.category_id
  )
  return category ? category.name : null
})
</script>

<style scoped>
.project-name-field,
.project-url-field,
.project-description-field {
  font-size: 1rem;
}

.project-preview-card {
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
