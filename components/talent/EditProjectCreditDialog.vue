<template>
  <BaseDialog
    v-model="dialogVisible"
    max-width="600px"
    :persistent="isLoading"
  >
    <template #title>
      <div class="d-flex align-center">
        <span class="text-h6">Edit Role for {{ credit?.user?.display_name }}</span>
      </div>
    </template>

    <template #default>
      <v-container class="pa-4">
        <v-row>
          <v-col cols="12">
            <!-- User Info Header -->
            <div class="d-flex align-center mb-6">
              <v-avatar size="48" class="mr-4">
                <v-img :src="credit?.user?.profile_photo" :alt="credit?.user?.display_name">
                  <template v-slot:placeholder>
                    <v-icon>mdi-account</v-icon>
                  </template>
                </v-img>
              </v-avatar>
              <div>
                <div class="text-h6">{{ credit?.user?.display_name }}</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ credit?.user?.talent || 'No talent specified' }}
                </div>
              </div>
            </div>

            <v-divider class="mb-6" />

            <!-- Role Selection Form -->
            <div class="role-selection">
              <!-- Category Selection -->
              <v-select
                v-model="selectedCategory"
                :items="roleCategories"
                item-title="name"
                item-value="id"
                label="Select Category"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :loading="loadingCategories"
                :disabled="isLoading"
                clearable
                @update:model-value="handleCategoryChange"
              >
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-shape-outline</v-icon>
                </template>
              </v-select>

              <!-- Role Selection Mode Toggle -->
              <div v-if="selectedCategory" class="role-mode-selector mb-3">
                <v-card variant="flat" border class="pa-3 bg-grey-lighten-5">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="info" class="mr-2">mdi-information-outline</v-icon>
                    <span class="text-body-2">Choose how you want to specify the role:</span>
                  </div>
                  
                  <v-btn-toggle
                    v-model="roleInputMode"
                    mandatory
                    color="primary"
                    rounded="pill"
                    class="mb-1"
                  >
                    <v-btn value="existing" :disabled="isLoading">
                      <v-icon start>mdi-format-list-bulleted</v-icon>
                      Select Existing Role
                    </v-btn>
                    <v-btn value="custom" :disabled="isLoading">
                      <v-icon start>mdi-pencil-plus</v-icon>
                      Create Custom Role
                    </v-btn>
                  </v-btn-toggle>
                </v-card>
              </div>

              <!-- Role Selection/Input -->
              <v-combobox
                v-model="selectedRole"
                :items="roleInputMode === 'custom' ? [] : availableRoles"
                item-title="name"
                return-object
                :label="roleInputMode === 'custom' ? 'Enter custom role name' : 'Select a role'"
                variant="outlined"
                density="comfortable"
                :loading="loadingRoles"
                :disabled="!selectedCategory || isLoading"
                :hint="roleInputMode === 'custom' ? 'Type any role title you need' : 'Choose from available roles'"
                persistent-hint
                clearable
                :hide-no-data="roleInputMode === 'custom'"
              >
                <template v-slot:prepend>
                  <v-icon :color="roleInputMode === 'custom' ? 'secondary' : 'primary'">
                    {{ roleInputMode === 'custom' ? 'mdi-pencil-plus' : 'mdi-account-tie' }}
                  </v-icon>
                </template>
                <template v-slot:selection="{ item }">
                  <v-chip
                    :color="isCustomRole(item.raw) ? 'secondary' : 'primary'"
                    variant="flat"
                  >
                    {{ getItemDisplayName(item.raw) }}
                    <v-icon
                      v-if="isCustomRole(item.raw)"
                      size="small"
                      class="ml-1"
                    >
                      mdi-pencil-outline
                    </v-icon>
                  </v-chip>
                </template>
                <template v-slot:item="{ item, props }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.name"
                  ></v-list-item>
                </template>
                <template v-if="roleInputMode === 'custom'" v-slot:append>
                  <v-icon color="secondary">mdi-pencil</v-icon>
                </template>
              </v-combobox>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn
        color="grey-darken-1"
        variant="text"
        @click="closeDialog"
        :disabled="isLoading"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        @click="handleUpdate"
        :loading="isLoading"
        :disabled="!canSubmit"
      >
        Update Role
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useNuxtApp } from '#app'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'

interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
}

interface Role {
  id: number | null
  name: string
  is_custom: boolean
  category: {
    id: number
    name: string
  } | null
}

interface Credit {
  id: number
  user: User
  role: Role
  status: string
  created_at: string
}

interface TalentRole {
  id: number
  name: string
  category_id: number
  is_custom?: boolean
  key?: string
  description?: string
  is_active?: boolean
  display_order?: number
  category?: {
    id: number
    name: string
    slug?: string
  }
}

interface Category {
  id: number
  name: string
  slug?: string
}

const props = defineProps<{
  modelValue: boolean
  credit: Credit | null
  projectAccessUuid: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'credit-updated', credit: Credit): void
}>()

// Composables
const toast = useToast()
const { $axios } = useNuxtApp()
const talentCategoryStore = useTalentCategoryStore()

// State
const isLoading = ref(false)
const loadingCategories = ref(false)
const loadingRoles = ref(false)
const selectedCategory = ref<number | null>(null)
const selectedRole = ref<TalentRole | string | null>(null)
const roleCategories = ref<Category[]>([])
const availableRoles = ref<TalentRole[]>([])
const roleInputMode = ref('existing')

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const canSubmit = computed(() => {
  return selectedCategory.value && selectedRole.value && hasChanges.value
})

const hasChanges = computed(() => {
  if (!props.credit) return false
  
  const categoryChanged = selectedCategory.value !== props.credit.role?.category?.id
  const roleChanged = getRoleComparison()
  
  return categoryChanged || roleChanged
})

// Methods
const getRoleComparison = (): boolean => {
  if (!props.credit || !selectedRole.value) return false
  
  if (typeof selectedRole.value === 'string') {
    return selectedRole.value !== props.credit.role?.name
  }
  
  if (typeof selectedRole.value === 'object') {
    if (props.credit.role?.is_custom) {
      return selectedRole.value.name !== props.credit.role?.name
    } else {
      return selectedRole.value.id !== props.credit.role?.id
    }
  }
  
  return false
}

const fetchRoleCategories = async () => {
  loadingCategories.value = true
  try {
    const { data } = await $axios.get('/guest/talent/categories')
    roleCategories.value = data.data
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    toast.error('Failed to load role categories')
  } finally {
    loadingCategories.value = false
  }
}

const fetchTalentsByCategory = async (categorySlug: string) => {
  if (!categorySlug) return

  loadingRoles.value = true
  try {
    await talentCategoryStore.fetchCategoryTalents(categorySlug)
    availableRoles.value = talentCategoryStore.talents
  } catch (error: any) {
    console.error('Error fetching talents:', error)
    toast.error('Failed to load talents')
    availableRoles.value = []
  } finally {
    loadingRoles.value = false
  }
}

const handleCategoryChange = async (categoryId: number | null) => {
  selectedRole.value = null
  availableRoles.value = []

  if (categoryId) {
    const category = roleCategories.value.find(cat => cat.id === categoryId)
    if (category?.slug) {
      await fetchTalentsByCategory(category.slug)
    }
  }
}

const isCustomRole = (item: any): boolean => {
  if (!item) return false
  if (typeof item === 'string') return true
  if (typeof item === 'object' && !item.id) return true
  return false
}

const getItemDisplayName = (item: any): string => {
  if (!item) return ''
  if (typeof item === 'string') return item
  if (typeof item === 'object') return item.name || ''
  return ''
}

const initializeForm = async () => {
  if (!props.credit) return

  // Set category
  selectedCategory.value = props.credit.role?.category?.id || null

  // Load roles for the category
  if (selectedCategory.value) {
    const category = roleCategories.value.find(cat => cat.id === selectedCategory.value)
    if (category?.slug) {
      await fetchTalentsByCategory(category.slug)
    }
  }

  // Set role and mode
  if (props.credit.role?.is_custom) {
    roleInputMode.value = 'custom'
    selectedRole.value = props.credit.role.name
  } else {
    roleInputMode.value = 'existing'
    // Find the matching role in available roles
    const matchingRole = availableRoles.value.find(role => role.id === props.credit.role?.id)
    selectedRole.value = matchingRole || null
  }
}

const handleUpdate = async () => {
  if (!props.credit || !selectedRole.value || !selectedCategory.value) return

  isLoading.value = true
  try {
    const updateData = {
      talent_category_id: selectedCategory.value,
      ...(roleInputMode.value === 'custom' || typeof selectedRole.value === 'string'
        ? { 
            custom_role: typeof selectedRole.value === 'string' ? selectedRole.value : selectedRole.value.name,
            talent_id: null
          }
        : { 
            talent_id: selectedRole.value.id,
            custom_role: null
          }
      )
    }

    const { data } = await $axios.patch(
      `/api/projects/${props.projectAccessUuid}/credits/${props.credit.id}`,
      updateData
    )

    toast.success('Member role updated successfully')
    emit('credit-updated', data.data)
    closeDialog()
  } catch (error: any) {
    console.error('Error updating credit:', error)
    toast.error(error?.response?.data?.message || 'Failed to update member role')
  } finally {
    isLoading.value = false
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  selectedCategory.value = null
  selectedRole.value = null
  availableRoles.value = []
  roleInputMode.value = 'existing'
}

// Watch for dialog opening
watch(() => props.modelValue, async (newValue) => {
  if (newValue && props.credit) {
    await initializeForm()
  }
})

// Initial setup
onMounted(fetchRoleCategories)
</script>