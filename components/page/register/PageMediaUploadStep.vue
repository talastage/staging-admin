<template>
  <v-container>
    <v-row>
      <!-- Avatar Upload -->
      <v-col cols="12" md="6">
        <v-card class="pa-4" elevation="10">
          <h3 class="text-h6 mb-4">Profile Picture</h3>
          <v-file-input
            v-model="avatarFile"
            accept="image/*"
            label="Upload Profile Picture"
            prepend-icon="mdi-camera"
            :rules="imageRules"
            @change="handleAvatarChange"
          />
          <v-img
            v-if="avatarPreview"
            :src="avatarPreview"
            height="200"
            contain
            class="mt-4"
          />
        </v-card>
      </v-col>

      <!-- Cover Upload -->
      <v-col cols="12" md="6">
        <v-card class="pa-4" elevation="10">
          <h3 class="text-h6 mb-4">Cover Image</h3>
          <v-file-input
            v-model="coverFile"
            accept="image/*"
            label="Upload Cover Image"
            prepend-icon="mdi-image"
            :rules="imageRules"
            @change="handleCoverChange"
          />
          <v-img
            v-if="coverPreview"
            :src="coverPreview"
            height="200"
            contain
            class="mt-4"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { usePageRegistrationStore } from '~/stores/usePageRegistration'

const store = usePageRegistrationStore()
const avatarFile = ref<File | null>(null)
const coverFile = ref<File | null>(null)
const avatarPreview = ref<string>('')
const coverPreview = ref<string>('')

const imageRules = [
  (v: File) => !v || v.size <= 5000000 || 'Image size should be less than 5 MB',
  (v: File) =>
    !v || v.type.startsWith('image/') || 'Please upload an image file',
]

const handleAvatarChange = (file: File) => {
  if (file) {
    avatarPreview.value = URL.createObjectURL(file)
    store.media.avatar_file = file
  }
}

const handleCoverChange = (file: File) => {
  if (file) {
    coverPreview.value = URL.createObjectURL(file)
    store.media.cover_file = file
  }
}

// Cleanup URLs when component is unmounted
onBeforeUnmount(() => {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
})
</script>
