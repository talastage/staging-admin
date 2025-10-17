<template>
  <BaseDialog
    :modelValue="showDialog"
    @update:modelValue="$emit('update:showDialog', $event)"
    title="Upload Project"
    max-width="800"
    :fullscreen="$vuetify.display.mdAndDown"
  >
    <v-card flat class="modern-dialog">
      <v-card-text class="pa-6">
        <div class="file-uploaders">
          <FileUploader
            label="Upload your main project video"
            accept="video/mp4"
            :projectAccessUuid="project.access_uuid"
            :uploadUrl="`/api/studio/projects/${project.access_uuid}/upload`"
            @file-selected="handleMainVideoFileSelected"
            @upload-progress="handleMainVideoUploadProgress"
            @upload-complete="handleMainVideoUploadComplete"
            @upload-error="handleMainVideoUploadError"
            @upload-cancelled="handleMainVideoUploadCancelled"
            class="mb-4"
          />

          <FileUploader
            label="Upload a trailer for your project"
            accept="video/mp4"
            :projectAccessUuid="project.access_uuid"
            :uploadUrl="`/api/studio/projects/${project.access_uuid}/upload-trailer`"
            @file-selected="handleTrailerFileSelected"
            @upload-progress="handleTrailerUploadProgress"
            @upload-complete="handleTrailerUploadComplete"
            @upload-error="handleTrailerUploadError"
            @upload-cancelled="handleTrailerUploadCancelled"
            class="mb-4"
          />
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="project.name"
              label="Project Name"
              variant="outlined"
              dense
              class="mb-4"
              :rules="[(v) => !!v || 'Project name is required']"
              required
            ></v-text-field>

            <v-textarea
              v-model="project.description"
              label="Project Description"
              variant="outlined"
              rows="4"
              class="mb-4"
            ></v-textarea>

            <ProjectThumbnailUploader
              :projectAccessUuid="project.access_uuid"
              :thumbnailUrl="project.thumbnail_url"
              @upload="handleThumbnailUpload"
              :disabled="!mainVideoUploadComplete"
            />
          </v-col>
          <v-col cols="12" md="6">
            <VideoPreview
              title="Main Video Preview"
              :videoUrl="project.project_url"
              :loading="mainVideoUploading"
              :uploadComplete="mainVideoUploadComplete"
              class="mb-4"
            />

            <VideoPreview
              title="Trailer Preview"
              :videoUrl="project.trailer_url"
              :loading="trailerUploading"
              :uploadComplete="trailerUploadComplete"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <template #actions>
      <v-spacer></v-spacer>
      <v-btn
        x-large
        rounded
        color="primary"
        class="px-8 py-3 text-h6 font-weight-bold"
        :disabled="!canSave"
        @click="handleSave"
      >
        Next
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectUploadStore } from "~/stores/useProjectUploadStoreDELETE";
import { storeToRefs } from "pinia";

const props = defineProps({
  showDialog: Boolean,
});

const emit = defineEmits(["update:showDialog"]);

const router = useRouter();
const { $axios } = useNuxtApp();
const uploadStore = useProjectUploadStore();
const {
  mainVideoUploading,
  trailerUploading,
  mainVideoUploadComplete,
  trailerUploadComplete,
  mainVideoProgress,
  trailerProgress,
} = storeToRefs(uploadStore);

const project = ref({
  access_uuid: "",
  name: "",
  description: "",
  project_url: null,
  trailer_url: null,
  thumbnail_url: null,
  type: "video",
  source: "hosted",
  parent_id: null,
});

const canSave = computed(() => {
  return (
    project.value.name &&
    project.value.description &&
    project.value.project_url &&
    project.value.trailer_url &&
    project.value.thumbnail_url
  );
});

const handleMainVideoFileSelected = async (file) => {
  if (!project.value.name) {
    project.value.name = file.name.split(".").slice(0, -1).join(".");
  }
  await createProjectIfNeeded();
};

const handleTrailerFileSelected = async (file) => {
  await createProjectIfNeeded();
};

const createProjectIfNeeded = async () => {
  if (!project.value.access_uuid) {
    try {
      const response = await $axios.post("/api/studio/projects/create", {
        name: project.value.name,
        type: "video",
      });
      project.value = { ...project.value, ...response.data };
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  }
};

const handleMainVideoUploadProgress = (progress) => {
  uploadStore.setMainVideoProgress(progress);
};

const handleMainVideoUploadComplete = (response) => {
  project.value.project_url = response.project_url;
  uploadStore.setMainVideoUploadComplete(true);
};

const handleMainVideoUploadError = (error) => {
  uploadStore.setMainVideoUploading(false);
  alert("Failed to upload main video. Please try again.");
};

const handleMainVideoUploadCancelled = () => {
  uploadStore.setMainVideoUploading(false);
  project.value.project_url = null;
};

const handleTrailerUploadProgress = (progress) => {
  uploadStore.setTrailerProgress(progress);
};

const handleTrailerUploadComplete = (response) => {
  project.value.trailer_url = response.trailer_url;
  uploadStore.setTrailerUploadComplete(true);
};

const handleTrailerUploadError = (error) => {
  uploadStore.setTrailerUploading(false);
  alert("Failed to upload trailer. Please try again.");
};

const handleTrailerUploadCancelled = () => {
  uploadStore.setTrailerUploading(false);
  project.value.trailer_url = null;
};

const handleThumbnailUpload = (thumbnailUrl) => {
  project.value.thumbnail_url = thumbnailUrl;
};

const handleSave = async () => {
  if (!canSave.value) {
    alert("Please fill in all required fields and upload all necessary files.");
    return;
  }

  try {
    const response = await $axios.put(
      `/api/studio/projects/${project.value.access_uuid}/publish`,
      project.value
    );
    emit("update:showDialog", false);
    router.push(
      `/studio/projects/${response.data.access_uuid}/premiering-settings`
    );
  } catch (error) {
    console.error("Error saving project:", error);
    alert("An error occurred while saving the project. Please try again.");
  }
};
</script>

<style scoped>
.modern-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.file-uploaders {
  margin-bottom: 24px;
}
</style>
