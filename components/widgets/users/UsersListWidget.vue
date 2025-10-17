<template>
  <v-container>
      <v-row align="center" justify="start">
          <v-col v-for="user in selectedUsers" :key="user.id" cols="auto">
              <v-chip :disabled="loading" closable @click:close="removeUserFromSelection(user)">
                  <v-avatar left>
                      <img :src="user.profile_photo" alt="Profile Photo" />
                  </v-avatar>
                  {{ getDisplayName(user) }}
              </v-chip>
          </v-col>
          <v-btn color="primary" @click="sendSelectedUsers">Send Invitation</v-btn>
          <v-col cols="12">
              <v-text-field v-model="searchQuery" label="Search Users" outlined @input="searchUsers"></v-text-field>
          </v-col>
      </v-row>
      <v-list two-line>
          <v-list-item-group v-if="filteredUsers.length">
              <v-list-item v-for="user in filteredUsers" :key="user.id" @click="handleAddUser(user)">
                  <template #prepend>
                      <v-avatar size="34" rounded>
                          <v-img src="/images/avatars/avatar-1.png" alt="Profile Photo"></v-img>
                      </v-avatar>
                  </template>
                  <v-list-item-title>
                      {{ getDisplayName(user) }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                      {{ user.email }}
                  </v-list-item-subtitle>
              </v-list-item>
          </v-list-item-group>
          <v-list-item v-else>
              <v-list-item-content>No users found</v-list-item-content>
          </v-list-item>
      </v-list>
  </v-container>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';

const props = defineProps({
  users: {
      type: Object,
      required: true,
      default: () => ({ data: [] }),
  },
  eventId: {
      type: Number,
      required: true,
  },
});

const loading = ref(false);
const searchQuery = ref('');
const selectedUsers = ref([]);
const selectedUserIds = ref(new Set());

const getDisplayName = user => user.display_name || `${user.first_name} ${user.last_name}`;

const handleAddUser = (user) => {
  addUserToSelection(user);
};

const addUserToSelection = (user) => {
  selectedUsers.value.push(user);
  selectedUserIds.value.add(user.id);
};

const removeUserFromSelection = (user) => {
  const index = selectedUsers.value.findIndex(selectedUser => selectedUser.id === user.id);
  if (index > -1) {
      selectedUsers.value.splice(index, 1);
      selectedUserIds.value.delete(user.id);
  }
};

const sendSelectedUsers = () => {
  if (selectedUsers.value.length) {
      emit('update:selectedUsers', selectedUsers.value);
      console.log("Sending selected users:", selectedUsers.value);
  }
};

const filteredUsers = computed(() => {
  const actualArray = props.users.data;  // Access data directly
  if (Array.isArray(actualArray)) {
      return actualArray.filter(user => {
          const name = getDisplayName(user).toLowerCase();
          return name.includes(searchQuery.value.toLowerCase());
      });
  }
  return [];
});

watchEffect(() => {
  const actualArray = props.users.data;  // Access data directly
  if (!Array.isArray(actualArray)) {
      console.error('props.users.data is not an array:', props.users.data);
  }
});

</script>
