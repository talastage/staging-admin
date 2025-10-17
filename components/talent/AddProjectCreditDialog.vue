<template>
  <!-- Main Dialog -->
  <BaseDialog
    v-model="dialogVisible"
    title="Add Cast & Crew Member"
    max-width="700px"
    :persistent="isLoading"
  >
    <template #default>
      <v-container class="pa-4">
        <v-row>
          <v-col cols="12">
            <v-card variant="flat" class="mb-4">
              <v-card-text>
                <!-- User Search Section with Slotable Button -->
                <SearchUser
                  @user-selected="handleUserSelected"
                  :loading="isLoading"
                  placeholder="Search for cast or crew member..."
                >
                  <!-- Custom slot for the select button -->
                  <template #user-action="{ user, selectUser }">
                    <v-btn
                      color="primary"
                      variant="tonal"
                      size="small"
                      @click="selectUser"
                      :loading="isLoading"
                    >
                      Select
                    </v-btn>
                  </template>
                </SearchUser>

                <!-- Help Text -->
                <v-fade-transition>
                  <div
                    v-if="!selectedUser"
                    class="text-center text-medium-emphasis mt-4"
                  >
                    <v-icon>mdi-information-outline</v-icon>
                    <div class="text-body-2 mt-1">
                      Search and select a user to add them to your project
                    </div>
                  </div>
                </v-fade-transition>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template #actions>
      <v-spacer></v-spacer>
      <v-btn
        color="grey-darken-1"
        variant="text"
        @click="closeDialog"
        :disabled="isLoading"
      >
        Cancel
      </v-btn>
    </template>
  </BaseDialog>

  <!-- Role Selection Dialog -->
  <SelectRoleDialog
    v-if="selectedUser"
    v-model="showRoleDialog"
    :user="selectedUser"
    @back="handleRoleDialogBack"
    @confirm="handleRoleConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useNuxtApp } from '#app'

interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
}

const props = defineProps({
  modelValue: Boolean,
  project: {
    type: Object as () => Project,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'credit-added'])

// Composables
const toast = useToast()
const { $axios } = useNuxtApp()

// State
const isLoading = ref(false)
const selectedUser = ref<User | null>(null)
const showRoleDialog = ref(false)

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Methods
const handleUserSelected = (user: User) => {
  selectedUser.value = user
  dialogVisible.value = false
  showRoleDialog.value = true
}

const handleRoleDialogBack = () => {
  showRoleDialog.value = false
  dialogVisible.value = true
}

const handleRoleConfirm = async ({ talent, categoryId, customRole }) => {
  if (!selectedUser.value) return

  isLoading.value = true
  try {
    const creditData = {
      user_id: selectedUser.value.id,
      talent_category_id: categoryId,
      ...(customRole
        ? { custom_role: customRole }
        : { talent_id: talent.id }),
    }

    const { data } = await $axios.post(
      `/api/projects/${props.project.access_uuid}/credits`,
      creditData
    )

    toast.success('Member added successfully')
    emit('credit-added', data.data)
    closeDialog()
  } catch (error: any) {
    console.error('Error adding member:', error)
    toast.error(error?.response?.data?.message || 'Failed to add member')
  } finally {
    isLoading.value = false
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  showRoleDialog.value = false
  selectedUser.value = null
}

// Handle escape key for both dialogs
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (showRoleDialog.value) {
      handleRoleDialogBack()
    } else if (dialogVisible.value) {
      closeDialog()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.v-dialog {
  transition: transform 0.2s ease-in-out;
}
</style>
