<template>
  <v-container class="select-user-list">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Search users"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-list>
          <v-list-item
            v-for="user in filteredUsers"
            :key="user.id"
            class="mb-2"
          >
            <UserCard :user="user" :clickable="false">
              <template #action>
                <v-checkbox
                  v-model="selectedUsers"
                  :value="user.id"
                  hide-details
                  class="checkbox-right"
                />
              </template>
            </UserCard>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["selectionChange"]);

const searchQuery = ref("");
const selectedUsers = ref([]);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return props.users;
  const lowercaseQuery = searchQuery.value.toLowerCase();
  return props.users.filter(
    (user) =>
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.talent.toLowerCase().includes(lowercaseQuery)
  );
});

watch(selectedUsers, (newVal) => {
  emit("selectionChange", newVal);
});
</script>

<style scoped>
.select-user-list {
  max-width: 600px;
  margin: 0 auto;
}

.checkbox-right {
  margin-left: auto;
}
</style>
