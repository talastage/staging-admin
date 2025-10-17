<template>
  <v-card class="report-dialog">
    <!-- Header -->
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <div>
        <div class="text-h6">Need support?</div>
        <div class="text-subtitle-2 text-grey">How can we help?</div>
      </div>
      <div class="d-flex align-center">
        <v-btn icon="mdi-minus" variant="text" density="compact" class="me-2" />
        <v-btn icon="mdi-close" variant="text" density="compact" />
      </div>
    </v-card-title>

    <!-- Form -->
    <v-card-text>
      <v-form
        ref="form"
        v-model="formValid"
        @submit.prevent="submitReport"
        validate-on="submit"
      >
        <div class="text-body-2 mb-1">What were you trying to do?</div>
        <v-select
          v-model="formData.category_id"
          :items="categories"
          item-title="name"
          item-value="id"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors['category_id']"
          :rules="[(v) => !!v || 'Please select a category']"
          class="mb-4"
        />

        <div class="text-body-2 mb-1">Describe your issue</div>
        <v-textarea
          v-model="formData.description"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors['description']"
          :rules="[
            (v) => !!v || 'Please describe your issue',
            (v) =>
              v.length >= 10 || 'Description must be at least 10 characters',
            (v) =>
              v.length <= 2000 || 'Description must not exceed 2000 characters',
          ]"
          class="mb-4"
        />

        <!-- File Upload -->
        <div class="d-flex align-center mb-2">
          <v-btn
            prepend-icon="mdi-paperclip"
            variant="text"
            color="primary"
            density="comfortable"
            class="text-none px-0"
            @click="$refs.fileInput.click()"
          >
            Attach Files (Optional)
          </v-btn>
          <input
            ref="fileInput"
            type="file"
            accept="image/*, .pdf, .doc, .docx"
            multiple
            class="d-none"
            @change="handleFileUpload"
          />
        </div>

        <!-- File Preview -->
        <div v-if="files.length" class="mb-4">
          <v-chip
            v-for="(file, index) in files"
            :key="index"
            variant="outlined"
            closable
            class="me-2 mb-2"
            prepend-icon="mdi-file"
            @click:close="removeFile(index)"
          >
            {{ file.name }}
          </v-chip>
        </div>

        <!-- Submit Button -->
        <div class="d-flex justify-end mt-4 mb-16">
          <v-btn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            size="large"
          >
            Submit
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <!-- Bottom Navigation -->
    <v-bottom-navigation fixed>
      <v-btn>
        <v-icon>mdi-home</v-icon>
        Home
      </v-btn>
      <v-btn>
        <v-icon>mdi-message</v-icon>
        Messages
      </v-btn>
      <v-btn>
        <v-icon>mdi-help-circle</v-icon>
        Help
      </v-btn>
      <v-btn color="primary">
        <v-icon>mdi-flag</v-icon>
        Report
      </v-btn>
    </v-bottom-navigation>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" persistent max-width="400">
      <v-card>
        <v-card-text class="pa-6 text-center">
          <v-icon color="success" size="64" class="mb-4">
            mdi-check-circle
          </v-icon>
          <h2 class="text-h5 mb-2">Thank You!</h2>
          <p class="text-body-1 mb-4">
            Your report has been submitted successfully. We'll review it and get
            back to you soon.
          </p>
          <v-btn color="primary" block @click="handleSuccessClose">
            Done
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
const { $axios } = useNuxtApp();

// Form refs and data
const form = ref(null);
const fileInput = ref(null);
const formValid = ref(false);
const formData = ref({
  category_id: null,
  description: "",
});
const files = ref([]);
const categories = ref([]);
const isSubmitting = ref(false);
const successDialog = ref(false);
const validationErrors = ref({});

// Fetch categories on mount
onMounted(async () => {
  try {
    const response = await $axios.get("/api/problem-reports/categories");
    categories.value = response.data.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    handleError(error);
  }
});

// File handling
const handleFileUpload = (event) => {
  const newFiles = Array.from(event.target.files);
  const invalidFiles = newFiles.filter(
    (file) =>
      file.size > 10 * 1024 * 1024 || // 10MB
      ![
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type)
  );

  if (invalidFiles.length) {
    handleError(
      new Error("Some files were rejected. Please check file size and type.")
    );
    return;
  }

  files.value = [...files.value, ...newFiles];
  event.target.value = ""; // Reset input
};

const removeFile = (index) => {
  files.value = files.value.filter((_, i) => i !== index);
};

// Submit handler
const submitReport = async () => {
  // Reset validation errors
  validationErrors.value = {};

  // Validate form
  const { valid } = await form.value.validate();
  if (!valid) return;

  isSubmitting.value = true;

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("category_id", formData.value.category_id);
    formDataToSend.append("description", formData.value.description);

    files.value.forEach((file) => {
      formDataToSend.append("attachments[]", file);
    });

    const response = await $axios.post(
      "/api/problem-reports/reports",
      formDataToSend,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.status === "success") {
      successDialog.value = true;
    }
  } catch (error) {
    handleError(error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleError = (error) => {
  if (error.response?.data?.errors) {
    // Set validation errors from backend
    validationErrors.value = error.response.data.errors;
  } else {
    // Set generic error message
    validationErrors.value = {
      general: [
        error.response?.data?.message || error.message || "An error occurred",
      ],
    };
  }
};

const handleSuccessClose = () => {
  successDialog.value = false;
  resetForm();
};

const resetForm = () => {
  form.value?.reset();
  formData.value = {
    category_id: null,
    description: "",
  };
  files.value = [];
  validationErrors.value = {};
};
</script>

<style scoped>
.report-dialog {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.v-card-text {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 56px; /* Height of bottom navigation */
}

.v-bottom-navigation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

:deep(.v-field) {
  border-radius: 8px !important;
}

:deep(.v-textarea textarea) {
  min-height: 100px;
}

:deep(.v-messages) {
  color: rgb(var(--v-theme-error)) !important;
  font-size: 12px;
  min-height: 0;
  padding-top: 4px;
}
</style>
