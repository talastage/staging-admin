<template>
  <v-container>
    <v-row justify="space-between" align="center" class="mb-4">
      <v-col>
        <div class="display-4">Exclusive Content</div>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="showUploadDialog = true">
          + Add Exclusive Content
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="isLoading" cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
      <v-col v-for="content in exclusiveContents" :key="content.id" cols="12">
        <v-card class="d-flex align-center mb-4">
          <v-avatar size="40">
            <img :src="content.thumbnail_url" alt="Thumbnail" />
          </v-avatar>
          <v-card-text class="d-flex justify-space-between flex-grow-1">
            <div>{{ content.name }}</div>
            <div>{{ formatPeriod(content.created_at) }}</div>
            <v-chip :color="getStatusColor(content.status)" text-color="white" small>
              {{ content.status }}
            </v-chip>
            <v-btn icon @click="editContent(content)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="moreActions(content)">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="exclusiveContents.length === 0 && !isLoading" cols="12">
        <div class="text-center">No exclusive content available.</div>
      </v-col>
    </v-row>
    <UploadProjectDialog
      :showDialog="showUploadDialog"
      @update:showDialog="showUploadDialog = $event"
      type="exclusive-content"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const props = defineProps({
  project: Object,
});

const isLoading = ref(true);
const showUploadDialog = ref(false);
const exclusiveContents = ref([]);

const { $axios } = useNuxtApp();

onMounted(async () => {
  if (!props.project || !props.project.access_uuid) return;

  try {
    const response = await $axios.get(`/api/studio/projects/${props.project.access_uuid}/exclusive-contents`);
    exclusiveContents.value = response.data.exclusive_contents;
  } catch (error) {
    console.error("Error fetching exclusive contents:", error);
  } finally {
    isLoading.value = false;
  }
});

const formatPeriod = (createdAt: string) => {
  const date = new Date(createdAt);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "draft":
      return "grey";
    case "published":
      return "green";
    default:
      return "blue";
  }
};

const editContent = (content: any) => {
  // Logic to edit content
};

const moreActions = (content: any) => {
  // Logic for more actions
};
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.d-flex {
  display: flex;
}
.align-center {
  align-items: center;
}
.justify-space-between {
  justify-content: space-between;
}
.text-center {
  text-align: center;
}
</style>
