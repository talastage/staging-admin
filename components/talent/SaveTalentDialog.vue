<!-- Components/SaveTalentDialog.vue -->
<template>
  <v-dialog v-model="dialogModel" max-width="400" class="save-dialog">
    <v-card class="rounded-lg">
      <v-card-title
        class="pt-4 px-4 pb-2 d-flex align-center justify-space-between"
      >
        <span>Add to Collection</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"
          class="ml-2"
        />
      </v-card-title>

      <!-- Search with Clear Button -->
      <div class="px-4 pt-2">
        <v-text-field
          v-model="searchQuery"
          placeholder="Filter collections"
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-magnify"
          class="search-field"
          bg-color="grey-lighten-4"
          @keydown.esc="clearSearch"
        >
          <template v-slot:append v-if="searchQuery">
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="clearSearch"
              class="mr-n2"
            />
          </template>
        </v-text-field>
      </div>

      <v-card-text class="px-4 pb-4">
        <!-- Loading State -->
        <v-progress-linear
          v-if="isLoading"
          indeterminate
          color="primary"
          class="mb-4"
        />

        <!-- Collections List -->
        <div class="collections-container mt-4">
          <!-- Create New Collection Button - Moved to top -->
          <v-btn
            block
            variant="outlined"
            color="primary"
            class="mb-4 create-collection-btn"
            height="56"
            @click="showNewCollectionForm = true"
            v-if="!showNewCollectionForm"
          >
            <v-icon icon="mdi-plus" class="mr-2" />
            Create new collection
          </v-btn>

          <!-- New Collection Form -->
          <v-expand-transition>
            <div v-if="showNewCollectionForm" class="new-collection-form mb-4">
              <v-text-field
                v-model="newCollectionName"
                label="Collection name"
                variant="outlined"
                density="compact"
                :error-messages="newCollectionError"
                @keyup.enter="createCollection"
                @keyup.esc="cancelNewCollection"
                autofocus
                :maxlength="50"
                counter
              >
                <template v-slot:append>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click="cancelNewCollection"
                    class="mr-n2"
                  />
                </template>
              </v-text-field>
            </div>
          </v-expand-transition>

          <!-- Collections List -->
          <div v-if="filteredCollections.length > 0" class="collections-list">
            <div
              v-for="collection in filteredCollections"
              :key="collection.id"
              class="collection-item"
              :class="{
                selected: selectedCollections.includes(collection.id),
                'is-saved': isTalentInCollection(collection.id),
                'is-disabled': isTalentInCollection(collection.id),
              }"
              @click="toggleCollection(collection.id)"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-checkbox
                    v-model="selectedCollections"
                    :value="collection.id"
                    hide-details
                    density="compact"
                    :disabled="isTalentInCollection(collection.id)"
                  />
                  <div class="ml-2">
                    <div class="text-subtitle-1">{{ collection.name }}</div>
                    <div class="text-caption text-grey">
                      {{ collection.talents_count }} talent{{
                        collection.talents_count !== 1 ? 's' : ''
                      }}
                      <span
                        v-if="isTalentInCollection(collection.id)"
                        class="text-primary"
                      >
                        • Already saved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!isLoading" class="text-center py-8">
            <v-icon
              icon="mdi-folder-outline"
              size="48"
              color="grey-lighten-1"
            />
            <p class="text-medium-emphasis mt-4">
              {{
                searchQuery
                  ? 'No collections found'
                  : 'Create your first collection'
              }}
            </p>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="isLoading || isSaving"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="showNewCollectionForm"
          color="primary"
          :loading="isSaving"
          :disabled="!newCollectionName.trim() || isLoading"
          @click="createCollection"
        >
          Create
        </v-btn>
        <v-btn
          v-else
          color="primary"
          :loading="isSaving"
          :disabled="!canSave || isLoading"
          @click="handleSaveAction"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTalentCollectionStore } from '@/stores/useTalentCollectionStore'

// Props & Emits
interface Props {
  modelValue: boolean
  username: string // Change from talentId to username to match what's being passed
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

// Store
const store = useTalentCollectionStore()

// State
const searchQuery = ref('')
const selectedCollections = ref<number[]>([])
const showNewCollectionForm = ref(false)
const newCollectionName = ref('')
const newCollectionError = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const collections = computed(() => store.sortedCollections)

const filteredCollections = computed(() => {
  if (!searchQuery.value.trim()) return collections.value
  const query = searchQuery.value.toLowerCase().trim()
  return collections.value.filter((c) => c.name.toLowerCase().includes(query))
})

const canSave = computed(
  () =>
    selectedCollections.value.length > 0 &&
    !selectedCollections.value.some((id) =>
      store.isTalentInCollection(id, props.username)
    ) &&
    !!props.username
)

const isTalentInCollection = (collectionId: number) =>
  store.isTalentInCollection(collectionId, props.talentId)

// Methods
const clearSearch = () => {
  searchQuery.value = ''
}

const resetForm = () => {
  selectedCollections.value = []
  showNewCollectionForm.value = false
  newCollectionName.value = ''
  newCollectionError.value = ''
  searchQuery.value = ''
}

const closeDialog = () => {
  dialogModel.value = false
  resetForm()
}

const cancelNewCollection = () => {
  showNewCollectionForm.value = false
  newCollectionName.value = ''
  newCollectionError.value = ''
}

const createCollection = async () => {
  if (!newCollectionName.value.trim()) return

  isSaving.value = true
  newCollectionError.value = ''

  try {
    const collection = await store.createCollection(
      newCollectionName.value.trim()
    )
    selectedCollections.value = [collection.id]
    // If we get here, the collection was created successfully

    // Check if we should immediately save the talent
    if (props.username) {
      await saveTalent()
    } else {
      // Just close the form and reset if no talent to save
      showNewCollectionForm.value = false
      newCollectionName.value = ''
    }
  } catch (error: any) {
    // Only set error if it's actually an error
    if (!error.response?.data?.data) {
      // Check if we have success data
      newCollectionError.value = error.message || 'Failed to create collection'
    }
  } finally {
    isSaving.value = false
  }
}
const handleSaveAction = async () => {
  if (!canSave.value) return
  await saveTalent()
}

const saveTalent = async () => {
  if (!canSave.value) return
  if (!props.username) {
    console.error('No username provided')
    return
  }

  isSaving.value = true
  console.log('Saving talent:', {
    collectionId: selectedCollections.value[0],
    username: props.username, // Use username instead of talentId
  })

  try {
    await store.addTalentToCollection(
      selectedCollections.value[0],
      props.username // Pass username instead of talentId
    )
    emit('saved')
    closeDialog()
  } catch (error: any) {
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data)
    } else {
      console.error('Error saving talent:', error)
    }
  } finally {
    isSaving.value = false
  }
}

const toggleCollection = (collectionId: number) => {
  if (showNewCollectionForm.value || isTalentInCollection(collectionId)) return

  const index = selectedCollections.value.indexOf(collectionId)
  if (index === -1) {
    selectedCollections.value = [collectionId] // Single selection mode
  } else {
    selectedCollections.value.splice(index, 1)
  }
}

const fetchCollections = async () => {
  isLoading.value = true
  try {
    await store.fetchCollections(true)
  } catch (error) {
    console.error('Failed to load collections:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  if (dialogModel.value) {
    await fetchCollections()
  }
})

// Watchers
watch(
  () => props.modelValue,
  async (newValue) => {
    if (newValue) {
      resetForm()
      await fetchCollections()
    }
  }
)

watch(searchQuery, () => {
  if (showNewCollectionForm.value) {
    showNewCollectionForm.value = false
    newCollectionName.value = ''
  }
})
</script>

<style scoped>
.save-dialog :deep(.v-card) {
  border-radius: 12px;
  overflow: hidden;
}

.collections-list {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.collections-list::-webkit-scrollbar {
  width: 6px;
}

.collections-list::-webkit-scrollbar-track {
  background: transparent;
}

.collections-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.collection-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.collection-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.collection-item.selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.collection-item.is-saved:not(.selected) {
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.search-field {
  border-radius: 8px;
}

.saved-chip {
  opacity: 0.8;
  font-size: 0.75rem;
}

.new-collection-form {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
