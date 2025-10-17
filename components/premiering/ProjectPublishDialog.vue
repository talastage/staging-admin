<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="dialogTitle"
    max-width="800"
  >
    <template #title>
      <div class="d-flex align-center">
        <v-icon :icon="dialogIcon" color="primary" class="mr-3" />
        <span class="text-h5">{{ dialogTitle }}</span>
      </div>
    </template>
    
    <PremieringProjectSettings 
      ref="settingsRef"
      :project="project"
      @publish-success="handleSuccess"
    />
    
    <template #actions>
      <v-spacer />
      <v-btn
        color="secondary"
        variant="tonal"
        @click="$emit('update:modelValue', false)"
      >
        Cancel
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PropType } from 'vue'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import PremieringProjectSettings from '~/components/premiering/PremieringProjectSettings.vue'
import BaseDialog from '~/components/dialogs/BaseDialog.vue'
import type { StudioProject } from '~/types/studio-project'

const props = defineProps({
  modelValue: Boolean,
  project: {
    type: Object as PropType<StudioProject>,
    default: null,
  },
  mode: {
    type: String as PropType<'publish' | 'unpublish'>,
    default: 'publish'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'success'
])

const snackStore = useSnackMessageStore()
const settingsRef = ref<InstanceType<typeof PremieringProjectSettings> | null>(null)

const dialogTitle = computed(() => {
  return props.mode === 'publish' 
    ? 'Publish Project' 
    : 'Unpublish Project'
})

const dialogIcon = computed(() => {
  return props.mode === 'publish' 
    ? 'mdi-rocket-launch' 
    : 'mdi-archive-arrow-down'
})

function handleSuccess() {
  emit('success')
  emit('update:modelValue', false)
  
  const message = props.mode === 'publish' 
    ? 'Project published successfully!' 
    : 'Project unpublished successfully!'
  
  snackStore.success(message)
}
</script>