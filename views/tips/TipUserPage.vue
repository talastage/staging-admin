<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <LoadingErrorState :isLoading="loading" :error="error">
          <template v-if="entityData">
            <TipDialog
              v-model="showTipDialog"
              :entity="entityData"
              :entityType="entityType"
              :defaultAmount="1000"
            >
              <template #activator="{ props }">
                <v-btn
                  color="primary"
                  block
                  class="mt-4"
                  @click="openTipDialog"
                  v-bind="props"
                >
                  Tip
                  {{
                    entityType === 'user'
                      ? entityData.username
                      : entityData.name
                  }}
                </v-btn>
              </template>
            </TipDialog>
          </template>
        </LoadingErrorState>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'

const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()
const toast = useToast()
const snackStore = useSnackMessageStore()
const { currencyFormatter } = useCurrencyFormatter()

const entityType = computed(() => route.params.entityType as string)
const identifier = computed(() => route.params.identifier as string)

const loading = ref(true)
const error = ref('')
const entityData = ref(null)
const showTipDialog = ref(false)
const tipAmount = ref(0)

onMounted(async () => {
  console.log('Component mounted')
  await fetchEntityData()
})

watch(
  () => entityData.value,
  (newValue) => {
    console.log('Entity data updated:', newValue)
    if (newValue) {
      openTipDialog()
    }
  }
)

async function fetchEntityData() {
  console.log('Fetching entity data')
  loading.value = true
  error.value = ''

  try {
    const response = await $axios.get(
      `/api/tip/${entityType.value}/${identifier.value}`
    )
    entityData.value = response.data.data
    console.log('Entity data fetched:', entityData.value)
  } catch (err) {
    console.error('Error fetching entity data:', err)
    error.value = 'Failed to load data. Please try again.'
    toast.error('Unable to load tipping information. Please try again later.')
  } finally {
    loading.value = false
  }
}

function openTipDialog() {
  console.log('Opening tip dialog')
  showTipDialog.value = true
}
</script>
