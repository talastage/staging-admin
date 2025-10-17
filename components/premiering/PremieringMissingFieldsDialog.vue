<template>
  <BaseDialog
    :title="dialogTitle"
    v-model="localModelValue"
    :max-width="maxWidth"
  >
    <template #default>
      <p class="text-body-1 mb-4">
        {{ message }}
      </p>
      <v-list>
        <v-list-item
          v-for="item in missingFields"
          :key="item.field"
          class="mb-2"
        >
          <template #prepend>
            <v-icon
              :icon="
                item.field.includes('upload')
                  ? 'mdi-upload'
                  : 'mdi-alert-circle'
              "
              color="error"
              class="mr-2"
            />
          </template>
          <v-list-item-title>{{ item.message }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
    <template #actions>
      <v-spacer />
      <BaseButton title="OK" :action="closeDialog" color="primary" />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface MissingField {
  field: string
  message: string
}

interface Props {
  modelValue: boolean
  missingFields: MissingField[]
  dialogTitle?: string
  message?: string
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  missingFields: () => [],
  dialogTitle: 'Missing Required Fields',
  message: 'Please address the following before proceeding:',
  maxWidth: '500px',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const localModelValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    localModelValue.value = newVal
  }
)

watch(localModelValue, (val) => {
  emit('update:modelValue', val)
})

function closeDialog(): void {
  localModelValue.value = false
}
</script>
