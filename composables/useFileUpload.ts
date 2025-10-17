import { ref, computed } from "vue";
import { useNuxtApp } from "#app";
import { useAuthStore } from "~/stores/auth";

export const useFileUpload = () => {
  const { $axios } = useNuxtApp();
  const authStore = useAuthStore();

  const uploadProgress = ref(0);
  const isUploading = ref(false);
  const uploadError = ref(null);

  const createProject = async (fileName: string) => {
    try {
      const response = await $axios.post("/api/studio/projects/create", {
        name: fileName,
        status: "draft",
        type: "video",
      });
      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  const getPresignedUrl = async (fileName: string) => {
    try {
      const response = await $axios.post("/api/studio/get-presigned-url", {
        fileName,
      });
      return response.data.presignedUrl;
    } catch (error) {
      console.error("Error getting presigned URL:", error);
      throw error;
    }
  };

  const uploadToS3 = async (presignedUrl: string, file: File) => {
    try {
      isUploading.value = true;
      uploadProgress.value = 0;

      await $axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        },
      });

      isUploading.value = false;
      return true;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      isUploading.value = false;
      uploadError.value = error;
      throw error;
    }
  };

  const updateProject = async (projectId: string, projectUrl: string) => {
    try {
      const response = await $axios.put(`/api/studio/projects/${projectId}/publish`, {
        project_url: projectUrl,
        status: "published",
      });
      return response.data;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const uploadFile = async (file: File) => {
    try {
      console.log("File being uploaded:", file.name); // Add this line for debugging

      // Step 1: Create a draft project
      const project = await createProject(file.name);

      // Step 2: Get presigned URL and upload to S3
      const presignedUrl = await getPresignedUrl(file.name);
      await uploadToS3(presignedUrl, file);

      // Step 3: Update the project with the file URL
      const s3Url = presignedUrl.split("?")[0]; // Extract the base S3 URL
      await updateProject(project.access_uuid, s3Url);

      return project;
    } catch (error) {
      console.error("Error in upload process:", error);
      uploadError.value = error;
      throw error;
    }
  };

  return {
    uploadFile,
    uploadProgress: computed(() => uploadProgress.value),
    isUploading: computed(() => isUploading.value),
    uploadError: computed(() => uploadError.value),
  };
};