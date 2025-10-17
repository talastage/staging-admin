<template>
  <BaseDialog
    v-model="dialogVisible"
    max-width="600px"
    :show-close-button="false"
  >
    <template #title>
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          @click="goBack"
          class="mr-2"
          :disabled="isLoading"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span class="text-h6">Add Role for {{ user.display_name }}</span>
      </div>
    </template>

    <template #default>
      <v-container class="pa-4">
        <v-row>
          <v-col cols="12">
            <!-- User Info Header -->
            <div class="d-flex align-center mb-6">
              <v-avatar size="48" class="mr-4">
                <v-img :src="user.profile_photo" :alt="user.display_name">
                  <template v-slot:placeholder>
                    <v-icon>mdi-account</v-icon>
                  </template>
                </v-img>
              </v-avatar>
              <div>
                <div class="text-h6">{{ user.display_name }}</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ user.talent || 'No talent specified' }}
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
        @click="goBack"
        :disabled="isLoading"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        @click="handleConfirm"
        :loading="isLoading"
        :disabled="!canSubmit"
      >
        Confirm Role
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useNuxtApp } from '#app'

interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
}

interface Role {
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
}

const props = defineProps<{
  modelValue: boolean
  user: User
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'back'): void
  (e: 'confirm', data: { role: Role | string; categoryId: number }): void
}>()

// Composables
const toast = useToast()
const { $axios } = useNuxtApp()

// State
const isLoading = ref(false)
const loadingCategories = ref(false)
const loadingRoles = ref(false)
const selectedCategory = ref<number | null>(null)
const selectedRole = ref<Role | string | null>(null)
const roleCategories = ref<Category[]>([])
const availableRoles = ref<Role[]>([])
const roleInputMode = ref('existing') // New state for role input mode

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const canSubmit = computed(() => {
  return selectedCategory.value && selectedRole.value
})

// Methods
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

const fetchRolesByCategory = async (categoryId: number) => {
  if (!categoryId) return

  loadingRoles.value = true
  try {
    const { data } = await $axios.get(
      `/guest/talent/categories/${categoryId}/roles`
    )
    availableRoles.value = data.data
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    toast.error('Failed to load roles')
    availableRoles.value = []
  } finally {
    loadingRoles.value = false
  }
}

const handleCategoryChange = async (categoryId: number | null) => {
  selectedRole.value = null
  availableRoles.value = []
  roleInputMode.value = 'existing' // Reset to existing mode when category changes

  if (categoryId) {
    await fetchRolesByCategory(categoryId)
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

const handleConfirm = () => {
  if (!selectedRole.value || !selectedCategory.value) return

  emit('confirm', {
    role: selectedRole.value,
    categoryId: selectedCategory.value,
  })
}

const goBack = () => {
  emit('back')
  resetForm()
}

const resetForm = () => {
  selectedCategory.value = null
  selectedRole.value = null
  availableRoles.value = []
  roleInputMode.value = 'existing'
}

// Initial setup
onMounted(fetchRoleCategories)
</script>