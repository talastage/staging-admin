<!-- components/UserList.vue -->
<template>
  <div>
    <v-row>
      <v-col v-for="user in users" :key="user.id" cols="12">
        <v-card>
          <v-card-text class="d-flex align-center">
            <UserAvatar :username="user.username" :profile_photo="user.profile_photo" :size="48" />
            <div class="ml-4">
              <v-card-title class="pa-0 text-subtitle-1">{{ user.display_name }}</v-card-title>
              <v-card-subtitle class="pa-0 text-caption">@{{ user.username }}</v-card-subtitle>
              <v-chip x-small class="mt-1">{{ user.talent }}</v-chip>
            </div>
          </v-card-text>
          <v-card-text v-if="user.projects && user.projects.length">
            <h3 class="text-h6 mb-2">Projects</h3>
            <ProjectList :projects="user.projects" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>


defineProps({
  users: {
    type: Array,
    required: true,
  },
});
</script>