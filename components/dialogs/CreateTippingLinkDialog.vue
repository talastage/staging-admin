<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>Create Tipping Link</v-card-title>
      <v-card-text>
        <form @submit.prevent="save">
          <v-text-field v-model="form.name" label="Name" required></v-text-field>
          <v-textarea v-model="form.description" label="Description"></v-textarea>
          <v-text-field v-model="form.thumbnail_url" label="Thumbnail URL"></v-text-field>
          <v-text-field v-model="form.project_url" label="Tipping Link URL" required></v-text-field>
        </form>
      </v-card-text>
      <v-card-actions>
        <v-btn type="submit" color="primary" @click="save">Save</v-btn>
        <v-btn text @click="closeDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
const { $axios } = useNuxtApp();

const props = defineProps({
  dialog: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits();

const closeDialog = () => {
  dialog.value = false;
  emit('update:dialog', dialog.value);
};

const dialog = ref(props.dialog);
const form = ref({
  name: '',
  description: '',
  thumbnail_url: '',
  project_url: '',
});

const close = () => {
  dialog.value = false;
  emit('update:dialog', dialog.value);
};

const save = async () => {
  try {
    await $axios.post('/api/tipping-links/', form.value);
    emit('saved');
    close();
  } catch (error) {
    console.error('Error saving tipping link:', error);
  }
};
</script>

<style scoped>
/* Add your styling for the CreateTippingLinkDialog component here */
</style>
