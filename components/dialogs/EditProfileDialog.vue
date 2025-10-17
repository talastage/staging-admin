<template>
  <BaseDialog v-model="dialog" title="Edit Profile" max-width="500px">
    <template #content>
      <v-form ref="form" @submit.prevent="saveProfile">
        <!-- User profile photo upload component -->
        <UserProfilePhotoUpload
          :profile-photo="user.profile_photo"
          @photo-selected="updateProfilePhoto"
        />

        <!-- First name field -->
        <v-text-field
          label="First Name"
          v-model="editedUser.first_name"
        required
        ></v-text-field>

        <!-- Last name field -->
        <v-text-field
          label="Last Name"
          v-model="editedUser.last_name"
          required
        ></v-text-field>

        <!-- Username field -->
        <v-text-field
          label="Username"
          v-model="editedUser.username"
          required
        ></v-text-field>

        <!-- Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" type="submit">Save</v-btn>
        </v-card-actions>
      </v-form>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">

interface Props {
  user: {
    first_name: string;
    last_name: string;
    username: string;
    profile_photo: string;
  };
  modelValue: boolean;
}

const props = defineProps<Props>();

// Ensure the editedUser reactive state is always in sync with the prop
const editedUser = ref({ ...props.user });

const dialog = ref(props.modelValue);

// Watch for external changes and update the internal state
watch(
  () => props.modelValue,
  (newVal) => {
    dialog.value = newVal;
  }
);

watch(dialog, (newVal) => {
  if (!newVal) {
    editedUser.value = { ...props.user }; // Reset form when dialog is closed
  }
});

// Handle form submission
const saveProfile = () => {
  // TODO: Add logic to save the user's edited details, likely using an API call.
  console.log("Save profile:", editedUser.value);
  dialog.value = false; // Close the dialog
};

// Logic to update profile photo
const updateProfilePhoto = (newPhoto) => {
  // TODO: Add logic to handle the profile photo update, likely using an API call.
  console.log("New profile photo:", newPhoto);
};
</script>
