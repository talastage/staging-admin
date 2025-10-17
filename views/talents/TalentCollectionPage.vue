<template>
  <div class="collections-page pa-4">
    <!-- Enhanced Header Section -->
    <v-row class="mb-8" align="center">
      <v-col cols="12" sm="8">
        <div class="header-content">
          <h1 class="text-h4 font-weight-bold gradient-text">
            Your Collections
          </h1>
          <p class="text-subtitle-1 text-medium-emphasis mt-2">
            {{ collectionStore.collections.length }} collections · Organize your
            talents
          </p>
        </div>
      </v-col>
      <v-col cols="12" sm="4" class="d-flex justify-end">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showNewCollectionDialog = true"
          elevation="1"
          class="create-btn"
        >
          New Collection
        </v-btn>
      </v-col>
    </v-row>

    <!-- Improved Skeleton Loader -->
    <v-row v-if="collectionStore.isLoading">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <div class="custom-skeleton">
          <div class="skeleton-preview animate-pulse"></div>
          <div class="skeleton-content">
            <div class="skeleton-title animate-pulse"></div>
            <div class="skeleton-subtitle animate-pulse"></div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Enhanced Collections Grid -->
    <v-row v-else-if="filteredCollections.length">
      <v-col
        v-for="collection in filteredCollections"
        :key="collection.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          :to="`/talents/collections/${collection.id}`"
          class="collection-card"
          :elevation="0"
          rounded="lg"
        >
          <div class="collection-preview pa-2">
            <TransitionGroup
              name="preview"
              tag="div"
              class="preview-grid"
              v-if="collection.preview_talents?.length"
            >
              <v-img
                v-for="talent in collection.preview_talents.slice(0, 4)"
                :key="talent.id"
                :src="talent.profile_photo"
                :alt="talent.username"
                cover
                class="preview-image"
              >
                <template v-slot:placeholder>
                  <div class="image-placeholder"></div>
                </template>
              </v-img>
            </TransitionGroup>
            <v-icon v-else size="48" class="placeholder-icon">
              mdi-folder-outline
            </v-icon>
          </div>

          <v-card-item>
            <v-card-title class="collection-title">
              {{ collection.name }}
            </v-card-title>
            <v-card-subtitle class="collection-meta">
              {{ collection.talents_count }} talents ·
              {{ formatDate(collection.updated_at) }}
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Empty State -->
    <v-row v-else justify="center" class="py-12">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <div class="empty-state">
          <v-icon size="72" class="empty-icon">mdi-folder-outline</v-icon>
          <h3 class="text-h5 mt-6">Start Your First Collection</h3>
          <p class="text-medium-emphasis my-4">
            Create collections to organize and manage your favorite talents
          </p>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showNewCollectionDialog = true"
            size="large"
            class="mt-4"
          >
            Create Collection
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Enhanced Dialog -->
    <v-dialog v-model="showNewCollectionDialog" max-width="500">
      <v-card class="dialog-card">
        <v-card-title class="pt-6 px-6">Create New Collection</v-card-title>
        <v-card-text class="px-6 pt-4">
          <v-text-field
            v-model="newCollectionName"
            label="Collection name"
            variant="outlined"
            :error-messages="newCollectionError"
            autofocus
            @keyup.enter="createCollection"
            class="collection-input"
          />
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" @click="showNewCollectionDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="isCreating"
            :disabled="!newCollectionName.trim()"
            @click="createCollection"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTalentCollectionStore } from '@/stores/useTalentCollectionStore'

const router = useRouter()
const collectionStore = useTalentCollectionStore()

const isCreating = ref(false)
const showNewCollectionDialog = ref(false)
const newCollectionName = ref('')
const newCollectionError = ref('')

const filteredCollections = computed(() => {
  return collectionStore.collections
})

const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`

  return d.toLocaleDateString()
}

const createCollection = async () => {
  if (!newCollectionName.value.trim()) return

  isCreating.value = true
  newCollectionError.value = ''

  try {
    const collection = await collectionStore.createCollection(
      newCollectionName.value.trim()
    )
    showNewCollectionDialog.value = false
    newCollectionName.value = ''
    router.push(`/talents/collections/${collection.id}`)
  } catch (error: any) {
    newCollectionError.value = error.message || 'Failed to create collection'
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  await collectionStore.fetchCollections(true)
})
</script>

<style scoped>
.collections-page {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.gradient-text {
  background: linear-gradient(
    45deg,
    var(--v-theme-primary),
    var(--v-theme-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.collection-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.collection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.collection-preview {
  background: linear-gradient(
    to bottom right,
    rgba(var(--v-theme-surface-variant), 0.8),
    rgba(var(--v-theme-surface-variant), 0.6)
  );
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px;
  height: 100%;
  width: 100%;
}

.preview-image {
  border-radius: 8px;
  transition: transform 0.3s ease;
  aspect-ratio: 1;
}

.preview-image:hover {
  transform: scale(1.05);
}

/* Custom Skeleton Loader */
.custom-skeleton {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  border: 1px solid #f0f0f0;
}

.skeleton-preview {
  height: 200px;
  background: #f5f5f5;
  margin: 12px;
  border-radius: 8px;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-title {
  height: 24px;
  width: 70%;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 16px;
  width: 40%;
  background: #f0f0f0;
  border-radius: 4px;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.image-placeholder {
  background: #f5f5f5;
  width: 100%;
  height: 100%;
}

/* Empty State Styling */
.empty-state {
  padding: 48px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 16px;
}

.empty-icon {
  opacity: 0.6;
  margin-bottom: 16px;
}

.placeholder-icon {
  opacity: 0.5;
}

/* Dialog Styling */
.dialog-card {
  border-radius: 16px;
}

.collection-input {
  margin-top: 16px;
}

/* Collection Title and Meta */
.collection-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 4px;
}

.collection-meta {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* Preview Transition Effects */
.preview-enter-active,
.preview-leave-active {
  transition: all 0.3s ease;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Create Button Enhancement */
.create-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* Header Content Enhancement */
.header-content {
  margin-bottom: 8px;
}

@media (max-width: 600px) {
  .collection-preview {
    aspect-ratio: 3/2;
  }

  .empty-state {
    padding: 32px 16px;
  }

  .header-content {
    text-align: center;
  }
}
</style>
