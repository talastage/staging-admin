<template>
  <div class="user-recent-project-widget">
    <v-card>
      <v-list>
        <v-list-item v-for="user in users" :key="user.id">
          <UserCard :user="user" />
        </v-list-item>
      </v-list></v-card>
  </div>
</template>

<script setup lang="ts">

const users = ref([]);

// Fetch users with recent projects
onMounted(async () => {
  const { $axios } = useNuxtApp();
  try {
    const response = await $axios.get('api/widgets/recently-published-users');
    if (response.data && response.data.data) {
      users.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching suggested users with projects:', error);
  }
});
</script>

<style scoped>
.user-recent-project-widget {
  /* Your styles here */
}

.v-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Add other styling as needed */
</style>