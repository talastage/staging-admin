<template>
    <v-card class="upload-card" outlined>
      <v-card-text>
        <template v-if="!isUploading">
          <v-row align="center" no-gutters>
            <v-col cols="auto" class="mr-4">
              <v-icon size="48" color="primary">mdi-upload</v-icon>
            </v-col>
            <v-col>
              <div class="text-h6">Upload Trailer</div>
              <div class="text-caption">Upload file from local storage.</div>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-btn color="primary" @click="openDialog">Upload</v-btn>
            </v-col>
          </v-row>
        </template>
  
        <template v-else>
          <v-row align="center" no-gutters>
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">{{ file?.name }}</div>
              <v-progress-linear
                :value="uploadProgress"
                height="20"
                rounded
                :color="uploadProgress === 100 ? 'green' : 'primary'"
              >
                <template v-slot:default="{ value }">
                  <strong>{{ Math.ceil(value) }}%</strong>
                </template>
              </v-progress-linear>
              <div class="text-caption mt-1">{{ formattedFileSize }}</div>
              <div class="text-caption mt-1">Speed: {{ uploadSpeedFormatted }}</div>
              <div class="text-caption mt-1">Time Left: {{ timeLeftFormatted }}</div>
              <v-btn
                color="success"
                v-if="uploadProgress === 100"
                @click="openDialog"
              >
                Change
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-card-text>
  
      <v-dialog v-model="showDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Upload Project Trailer</span>
          </v-card-title>
          <v-card-text>
            <div
              class="drop-zone"
              @dragover.prevent
              @dragenter.prevent
              @drop="handleDrop"
              @dragover="highlight"
              @dragleave="unhighlight"
            >
              <v-icon size="48" color="blue lighten-2">mdi-cloud-upload</v-icon>
              <p class="upload-text">Drag & drop to upload</p>
              <p class="browse-text" @click="browseFile">or browse</p>
              <v-file-input
                :model-value="file ? [file] : []"
                label="Drop MP4 or MOV video file here"
                accept="video/mp4,video/quicktime"
                @change="handleFileChange"
                hide-input
                class="hidden-input"
              ></v-file-input>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from "vue";
  import { useNuxtApp } from "#app";
  import { useProjectUploadStore } from "~/stores/useProjectUploadStoreDELETE";
  
  const { $axios } = useNuxtApp();
  const store = useProjectUploadStore();
  
  const showDialog = ref(false);
  const file = ref<File | null>(null);
  const uploadProgress = ref(0);
  const isUploading = ref(false);
  const uploadSpeed = ref(0);
  const uploadStartTime = ref(0);
  
  const formattedFileSize = computed(() => {
    if (!file.value) return "";
    const size = file.value.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  });
  
  const uploadSpeedFormatted = computed(() => {
    if (uploadSpeed.value === 0) return "Calculating...";
    const size = uploadSpeed.value;
    if (size < 1024) return `${size.toFixed(2)} B/s`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB/s`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB/s`;
  });
  
  const timeLeftFormatted = computed(() => {
    if (uploadProgress.value === 100) return "";
    if (uploadProgress.value === 0 || uploadSpeed.value === 0)
      return "Calculating...";
    const bytesLeft = file.value!.size * (1 - uploadProgress.value / 100);
    const secondsLeft = bytesLeft / uploadSpeed.value;
    const minutes = Math.floor(secondsLeft / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} left`;
  });
  
  const openDialog = () => {
    showDialog.value = true;
  };
  
  const closeDialog = () => {
    showDialog.value = false;
  };
  
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    file.value = event.dataTransfer?.files[0] || null;
    closeDialog();
    uploadTrailer();
  };
  
  const handleFileChange = (newFiles: File[]) => {
    file.value = newFiles[0] || null;
    closeDialog();
    uploadTrailer();
  };
  
  const browseFile = () => {
    const fileInput = document.querySelector(".hidden-input input");
    if (fileInput) {
      fileInput.click();
    }
  };
  
  const uploadTrailer = async () => {
    if (!file.value) return;
  
    const formData = new FormData();
    formData.append("file", file.value);
  
    const access_uuid = store.project?.access_uuid;
    if (!access_uuid) {
      console.error("Project access UUID is not defined.");
      return;
    }
  
    isUploading.value = true;
    uploadProgress.value = 0;
    uploadStartTime.value = Date.now();
  
    try {
      const response = await $axios.post(
        `/api/studio/projects/${access_uuid}/upload-trailer`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              uploadProgress.value =
                (progressEvent.loaded / progressEvent.total) * 100;
              const elapsedTime = (Date.now() - uploadStartTime.value) / 1000;
              uploadSpeed.value = progressEvent.loaded / elapsedTime;
            }
          },
        }
      );
  
      const trailerUrl = response.data.trailer_url;
      store.updateProjectData({ trailer_url: trailerUrl });
    } catch (error) {
      console.error("Error uploading trailer:", error);
    } finally {
      isUploading.value = false;
      if (uploadProgress.value === 100) {
        console.log("Upload complete!");
      }
    }
  };
  
  const highlight = (event: DragEvent) => {
    event.currentTarget?.classList.add("highlight");
  };
  
  const unhighlight = (event: DragEvent) => {
    event.currentTarget?.classList.remove("highlight");
  };
  </script>
  
  <style scoped>
  .upload-card {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .drop-zone {
    border: 2px dashed #ccc;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    transition: background-color 0.3s ease;
  }
  
  .drop-zone.highlight {
    background-color: #e0e0e0;
  }
  
  .upload-text {
    margin: 10px 0;
    font-size: 16px;
  }
  
  .browse-text {
    color: #1a73e8;
    cursor: pointer;
  }
  
  .hidden-input {
    display: none;
  }
  </style>
  