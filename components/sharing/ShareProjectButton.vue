<template>
  <div>
    <v-btn @click="openShareDialog" class="custom-btn" variant="tonal">
      <v-icon start>mdi-share-variant</v-icon>
      Share
    </v-btn>
    <ClientOnly>
      <ShareProjectDialog
        v-model="isShareDialogOpen"
        :share-url="shareUrl"
        :share-text="shareText"
        :entity-type="entityType"
        :entity-id="entityId"
        :entity="cleanEntity"
        @open-embed="openEmbedDialog"
        @update:model-value="handleShareDialogUpdate"
      />
      <EmbedDialog
        v-model="isEmbedDialogOpen"
        :entity="cleanEntity"
        @close="closeEmbedDialog"
        @update:model-value="handleEmbedDialogUpdate"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import { useRuntimeConfig } from '#app'

interface ShareableEntity {
  id: string | number
  name: string
  description?: string
  access_uuid?: string
  thumbnail_url?: string
  [key: string]: any
}

const props = defineProps<{
  entityType: string
  entity: ShareableEntity
  customShareUrl?: string
  customShareText?: string
}>()

const config = useRuntimeConfig()
const isShareDialogOpen = ref(false)
const isEmbedDialogOpen = ref(false)

// Clean the entity to avoid reactivity issues
const cleanEntity = computed(() => {
  if (!props.entity) return {}

  try {
    // Convert reactive object to plain object
    const raw = toRaw(props.entity)
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      access_uuid: raw.access_uuid,
      thumbnail_url: raw.thumbnail_url,
    }
  } catch (error) {
    console.warn('Error cleaning entity:', error)
    return {
      id: props.entity.id || '',
      name: props.entity.name || '',
      description: props.entity.description || '',
      access_uuid: props.entity.access_uuid || '',
      thumbnail_url: props.entity.thumbnail_url || '',
    }
  }
})

const entityId = computed(() => {
  return cleanEntity.value.id ? String(cleanEntity.value.id) : ''
})

const shareUrl = computed(() => {
  if (props.customShareUrl) return props.customShareUrl
  if (!cleanEntity.value.id) return ''

  // Use runtime config for SSR safety
  const baseUrl =
    config.public.frontendUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  return `${baseUrl}/${props.entityType}/${cleanEntity.value.id}`
})

const shareText = computed(() => {
  if (props.customShareText) return props.customShareText
  if (!cleanEntity.value.name) return ''
  return `Check out this ${props.entityType}: ${cleanEntity.value.name}`
})

const openShareDialog = () => {
  isShareDialogOpen.value = true
}

const openEmbedDialog = () => {
  isShareDialogOpen.value = false
  isEmbedDialogOpen.value = true
}

const closeEmbedDialog = () => {
  isEmbedDialogOpen.value = false
}

const handleShareDialogUpdate = (value: boolean) => {
  isShareDialogOpen.value = value
}

const handleEmbedDialogUpdate = (value: boolean) => {
  isEmbedDialogOpen.value = value
}

// Watch for entity changes with error handling
watch(
  () => props.entity,
  (newEntity) => {
    if (!newEntity || typeof newEntity !== 'object') {
      console.warn('ShareProjectButton received invalid entity:', newEntity)
    }
  },
  { immediate: true, deep: false } // Changed to shallow watch
)
</script>

<style scoped>
.custom-btn {
  border-radius: 20px;
  padding: 0 16px;
  height: 36px;
  text-transform: none;
  font-weight: 500;
}
</style>
