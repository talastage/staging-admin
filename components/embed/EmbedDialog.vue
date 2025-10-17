<template>
  <BaseDialog
    v-model="isOpen"
    :title="`Embed ${getEntityName}`"
    max-width="800px"
    :show-close-button="true"
    @update:model-value="updateModelValue"
  >
    <v-row>
      <v-col cols="12" md="5">
        <v-img
          :src="getThumbnailUrl"
          :aspect-ratio="16 / 9"
          cover
          class="rounded-lg"
        ></v-img>
      </v-col>
      <v-col cols="12" md="7">
        <v-text-field
          v-model="embedCode"
          readonly
          label="Embed Code"
          variant="outlined"
          density="comfortable"
          hide-details
          class="mb-4"
        >
          <template v-slot:append>
            <v-btn
              icon
              variant="text"
              @click="copyEmbedCode"
              :color="isCopied ? 'success' : 'primary'"
            >
              <v-icon>{{ isCopied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="embedWidth"
              label="Width"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateEmbedCode"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="embedHeight"
              label="Height"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateEmbedCode"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-checkbox
          v-model="autoplay"
          label="Autoplay"
          hide-details
          class="mt-4"
          @update:model-value="updateEmbedCode"
        ></v-checkbox>
      </v-col>
    </v-row>

    <template #actions>
      <v-spacer></v-spacer>
      <v-btn color="secondary" @click="closeDialog" variant="tonal">
        Close
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

interface EmbeddableEntity {
  id?: string | number
  name?: string
  description?: string
  access_uuid?: string
  thumbnail_url?: string
  [key: string]: any
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  entity: {
    type: Object as () => EmbeddableEntity,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const config = useRuntimeConfig()
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const embedWidth = ref(560)
const embedHeight = ref(315)
const autoplay = ref(false)
const embedCode = ref('')
const isCopied = ref(false)

const getEntityName = computed(() => {
  return props.entity && props.entity.name ? props.entity.name : ''
})

const getThumbnailUrl = computed(() => {
  return props.entity && props.entity.thumbnail_url
    ? props.entity.thumbnail_url
    : '/placeholder-thumbnail.jpg'
})

const updateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
  if (!value) {
    emit('close')
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('close')
}

const updateEmbedCode = () => {
  if (!props.entity || !props.entity.access_uuid) {
    // Prevent trying to create embed code without an entity or access_uuid
    embedCode.value = ''
    return
  }

  const baseUrl = config.public?.appUrl || window.location.origin
  const projectUrl = `${baseUrl}/embed/${props.entity.access_uuid}`
  const autoplayParam = autoplay.value ? '?autoplay=1' : ''

  embedCode.value = `<iframe width="${embedWidth.value}" height="${embedHeight.value}" src="${projectUrl}${autoplayParam}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
}

const copyEmbedCode = async () => {
  if (!embedCode.value) return

  try {
    await navigator.clipboard.writeText(embedCode.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy embed code:', err)
    // Fallback method for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = embedCode.value
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      isCopied.value = true
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
    }
    document.body.removeChild(textarea)
  }
}

// Check if entity exists and has required properties
watch(
  () => props.entity,
  (newEntity) => {
    if (newEntity) {
      updateEmbedCode()
    }
  },
  { immediate: true, deep: true }
)

// Validate entity on mount
onMounted(() => {
  if (!props.entity) {
    console.warn('EmbedDialog received no entity')
    return
  }

  if (!props.entity.access_uuid) {
    console.warn('EmbedDialog entity missing access_uuid')
  }

  updateEmbedCode()
})
</script>

<style scoped>
/* Only keeping specific styles that won't be inherited from BaseDialog */
.v-text-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.22;
}

.v-checkbox :deep(.v-selection-control__wrapper) {
  margin-right: 8px;
}
</style>
