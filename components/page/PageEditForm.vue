<!-- components/PageEditForm.vue -->
<template>
  <v-form @submit.prevent="handleSubmit">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="formData.name"
            label="Page Name"
            required
            :rules="[(v) => !!v || 'Name is required']"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="formData.tagline"
            label="Tagline"
            required
            :rules="[(v) => !!v || 'Tagline is required']"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            label="Description"
            required
            :rules="[(v) => !!v || 'Description is required']"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea v-model="formData.about" label="About" rows="5" />
        </v-col>

        <!-- Add other fields as needed -->
      </v-row>
    </v-container>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="$emit('cancel')"> Cancel </v-btn>
      <v-btn color="primary" type="submit" :loading="loading">
        Save Changes
      </v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['saved', 'cancel'])

const loading = ref(false)
const formData = ref({
  name: props.page.name,
  tagline: props.page.tagline,
  description: props.page.description,
  about: props.page.about,
})

const handleSubmit = async () => {
  try {
    loading.value = true
    emit('saved', formData.value)
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    loading.value = false
  }
}
</script>
