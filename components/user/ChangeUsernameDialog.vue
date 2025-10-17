<!-- components/ChangeUsernameDialog.vue -->
<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400px"
  >
    <v-card>
      <v-card-title>Change Username</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newUsername"
          label="New Username"
          :error-messages="usernameErrors"
          :disabled="!user.can_change_username"
          :rules="[required, username]"
          @input="debouncedCheckUsername"
        ></v-text-field>

        <v-alert v-if="!user.can_change_username" type="warning" class="mt-2">
          Your username can be changed once every 30 days. You can change it
          again after {{ user.next_username_change_date }}.
        </v-alert>

        <v-alert v-if="isChecking" type="info" class="mt-2">
          Checking username availability...
        </v-alert>

        <v-alert v-if="isAvailable" type="success" class="mt-2">
          Username is available!
        </v-alert>

        <v-alert v-if="isAvailable === false" type="error" class="mt-2">
          Username is not available.
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="
            !isUsernameValid || !user.can_change_username || !isAvailable
          "
          @click="confirmUsernameChange"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>

    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Confirm Username Change"
      :message="`Are you sure you want to change your username to @${newUsername}?`"
      @confirm="changeUsername"
      @cancel="showConfirmDialog = false"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useNuxtApp } from "#app";
import { useValidation } from "~/composables/useValidation";
import debounce from "lodash/debounce";

const props = defineProps({
  modelValue: Boolean,
  user: Object,
});

const emit = defineEmits(["update:modelValue", "username-changed"]);

const { $axios, $toast } = useNuxtApp();
const { required, username } = useValidation();

const newUsername = ref("");
const loading = ref(false);
const usernameErrors = ref([]);
const isAvailable = ref(null);
const isChecking = ref(false);
const showConfirmDialog = ref(false);

const isUsernameValid = computed(() => {
  return newUsername.value && username(newUsername.value) === true;
});

const checkUsername = async () => {
  if (!isUsernameValid.value) return;

  isChecking.value = true;
  isAvailable.value = null;

  try {
    const response = await $axios.get(
      `/api/user/check-username/${newUsername.value}`
    );
    isAvailable.value = response.data.available;
  } catch (error) {
    console.error("Error checking username:", error);
    isAvailable.value = false;
  } finally {
    isChecking.value = false;
  }
};

const debouncedCheckUsername = debounce(checkUsername, 300);

const confirmUsernameChange = () => {
  if (
    !isUsernameValid.value ||
    !props.user.can_change_username ||
    !isAvailable.value
  )
    return;
  showConfirmDialog.value = true;
};

const changeUsername = async () => {
  loading.value = true;
  usernameErrors.value = [];

  try {
    const response = await $axios.post("/api/user/change-username", {
      username: newUsername.value,
    });
    emit("username-changed", response.data.username);
    $toast.success("Username changed successfully!");
    emit("update:modelValue", false);
    showConfirmDialog.value = false;
  } catch (error) {
    if (error.response && error.response.data.errors) {
      usernameErrors.value = Object.values(error.response.data.errors).flat();
    } else {
      usernameErrors.value = ["An error occurred while changing the username."];
    }
    $toast.error("Failed to change username. Please try again.");
  } finally {
    loading.value = false;
  }
};

watch(newUsername, () => {
  isAvailable.value = null;
});

// Initialize newUsername when the dialog opens
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      newUsername.value = props.user.username;
    }
  }
);
</script>
