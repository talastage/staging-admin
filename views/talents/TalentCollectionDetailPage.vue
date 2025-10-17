<template>
  <div class="collection-page">
    <!-- Main Content using BaseContent -->
    <BaseContent
      :title="collection?.name || 'Loading...'"
      :subtitle="collection ? 'Manage your saved talents' : ''"
    >
      <!-- ACTION SLOT -->
      <template #action>
        <div class="d-flex gap-2 flex-wrap">
          <!-- Back to Collections -->
          <v-btn
            variant="text"
            :to="'/talents/collections'"
            class="back-button"
            prepend-icon="mdi-arrow-left"
          >
            Back to Collections
          </v-btn>

          <!-- Rename Collection -->
          <v-btn
            prepend-icon="mdi-pencil"
            variant="tonal"
            v-if="collection"
            @click="showEditDialog = true"
          >
            Rename
          </v-btn>

          <!-- Delete Collection -->
          <v-btn
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete"
            v-if="collection"
            @click="showDeleteDialog = true"
          >
            Delete
          </v-btn>
        </div>
      </template>

      <!-- CONTENT SLOT -->
      <template #content>
        <div class="page-content">
          <!-- Loading with Skeleton Loaders -->
          <div v-if="isLoading" class="loading-state">
            <v-row>
              <v-col
                v-for="n in 4"
                :key="n"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="mb-6"
              >
                <v-skeleton-loader type="image, card, actions" />
              </v-col>
            </v-row>
          </div>

          <!-- Empty State -->
          <div v-else-if="!talents.length" class="empty-state">
            <v-sheet class="pa-16 rounded-lg" color="surface-variant">
              <div class="text-center">
                <v-icon
                  icon="mdi-account-group-outline"
                  size="64"
                  class="mb-6"
                  color="medium-emphasis"
                />
                <h2 class="text-h5 mb-4">Start Your Collection</h2>
                <p class="text-body-1 text-medium-emphasis mb-8">
                  Discover and add talented individuals to your collection
                </p>
                <v-btn
                  color="primary"
                  size="large"
                  prepend-icon="mdi-plus"
                  :to="'/talents'"
                >
                  Browse Talents
                </v-btn>
              </div>
            </v-sheet>
          </div>

          <!-- Talents Grid -->
          <div v-else class="talents-grid">
            <v-row>
              <v-col
                v-for="talent in talents"
                :key="talent.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="talent-column"
              >
                <user-talent-card
                  :user="talent"
                  size="medium"
                  class="talent-card"
                  elevation="0"
                >
                  <template #action>
                    <fan-button
                      :username="talent.username"
                      :initial-fanning-state="talent.is_fanned_by_auth_user"
                      @fanning-updated="handleFanningUpdate(talent.id, $event)"
                    />
                  </template>
                </user-talent-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </template>
    </BaseContent>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="480">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title pa-6">
          Rename Collection
        </v-card-title>
        <v-card-text class="dialog-content pa-6 pt-0">
          <v-text-field
            v-model="editedName"
            label="Collection name"
            variant="outlined"
            :error-messages="editError"
            autofocus
            @keyup.enter="updateCollection"
          />
        </v-card-text>
        <v-card-actions class="dialog-actions pa-6 pt-0">
          <v-spacer />
          <v-btn variant="tonal" @click="showEditDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="isUpdating"
            :disabled="!editedName.trim() || editedName === collection?.name"
            @click="updateCollection"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Delete Dialog (using ConfirmDeleteDialog) -->
    <template>
      <ConfirmDeleteDialog
        :model-value="showDeleteDialog"
        title="Delete Collection"
        :message="deleteMessage"
        :loading="isDeleting"
        @confirm="deleteCollection"
        @cancel="showDeleteDialog = false"
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTalentCollectionStore } from '@/stores/useTalentCollectionStore'

const route = useRoute()
const collectionStore = useTalentCollectionStore()

const collection = ref<any>(null)
const talents = ref<any[]>([])
const isLoading = ref(true)
const isUpdating = ref(false)
const isDeleting = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editedName = ref('')
const editError = ref('')

const deleteMessage = computed(() => {
  return `Are you sure you want to delete "${collection.value?.name}"? This action cannot be undone.`
})

const fetchCollection = async () => {
  try {
    const response = await collectionStore.fetchCollection(
      route.params.id as string
    )
    collection.value = response.collection
    talents.value = response.talents.data
    editedName.value = collection.value.name
  } catch (error) {
    console.error('Failed to fetch collection:', error)
    navigateTo('/talents/collections')
  } finally {
    isLoading.value = false
  }
}

const updateCollection = async () => {
  if (!editedName.value.trim()) return
  isUpdating.value = true
  editError.value = ''
  try {
    await collectionStore.updateCollection(collection.value.id, {
      name: editedName.value.trim(),
    })
    collection.value.name = editedName.value.trim()
    showEditDialog.value = false
  } catch (error: any) {
    editError.value = error.message || 'Failed to update collection'
  } finally {
    isUpdating.value = false
  }
}

const deleteCollection = async () => {
  if (!collection.value?.id || isDeleting.value) return
  isDeleting.value = true
  try {
    const result = await collectionStore.deleteCollection(collection.value.id)
    if (result) {
      showDeleteDialog.value = false
      setTimeout(() => {
        navigateTo('/talents/collections', { replace: true, force: true })
      }, 300)
    }
  } catch (error) {
    console.error('Failed to delete collection:', error)
  } finally {
    isDeleting.value = false
  }
}

const handleFanningUpdate = (talentId: number, isFanning: boolean) => {
  const talent = talents.value.find((t) => t.id === talentId)
  if (talent) {
    talent.is_fanned_by_auth_user = isFanning
  }
}

onMounted(fetchCollection)
</script>

<style scoped>
.collection-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

/* We removed the explicit header section since BaseContent is used now. */

.page-content {
  padding: 24px 0;
}

.loading-state {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: start;
}

.empty-state {
  max-width: 600px;
  margin: 0 auto;
}

.talents-grid {
  margin: 0 -12px;
}

.talent-column {
  display: flex;
  padding: 12px;
}

.talent-card {
  flex: 1;
  transition: all 0.3s;
  border: 1px solid rgba(var(--v-border-color), 0.08);
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
}

.talent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 25px 0 rgba(var(--v-theme-on-surface), 0.05);
}

.dialog-card {
  border-radius: 16px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-content {
  color: rgb(var(--v-theme-on-surface-variant));
}

.dialog-actions {
  gap: 8px;
}

.back-button {
  min-width: 180px;
  height: 40px;
  font-weight: 500;
}

.header-actions {
  gap: 8px;
}

@media (max-width: 600px) {
  .back-button {
    width: 100%;
    min-width: unset;
  }
  .header-actions {
    width: 100%;
  }
  .loading-state {
    justify-content: center;
  }
}
</style>
