<template>
  <v-card class="pa-4">
    <v-row align="center" no-gutters>
      <v-col cols="auto" class="mr-4">
        <UserAvatar
          :username="creator.username"
          :profile_photo="creator.profile_photo"
          size="large"
        />
      </v-col>
      <v-col>
        <v-card-title class="text-h6 font-weight-medium pa-0">
          {{ creator.display_name }}
        </v-card-title>
        <v-card-subtitle
          v-if="creator.talent"
          class="text-medium-emphasis pa-0"
        >
          {{ creator.talent }}
        </v-card-subtitle>
      </v-col>
      <v-col cols="auto">
        <!-- Render FanButton only when creator.id is available -->
        <FanButton v-if="creator.id" :userId="creator.id" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  creator: {
    type: Object,
    required: true,
    validator: (value: any) => {
      return (
        value &&
        typeof value === "object" &&
        "username" in value &&
        "profile_photo" in value &&
        "display_name" in value &&
        "talent" in value &&
        "id" in value
      );
    },
  },
});
</script>
