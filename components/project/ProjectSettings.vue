<template>
  <v-container>
    <h3>Project Settings</h3>
    <v-list>
      <v-list-item>
        <v-list-item-title>Show Watchings</v-list-item-title>
        <v-list-item-action>
          <v-switch
            v-model="showWatchings"
            @change="updateProjectSettings('show_watchings', showWatchings)"
          ></v-switch>
        </v-list-item-action>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>Show Trailer Views</v-list-item-title>
        <v-list-item-action>
          <v-switch
            v-model="showTrailerViews"
            @change="
              updateProjectSettings('show_trailer_views', showTrailerViews)
            "
          ></v-switch>
        </v-list-item-action>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>Show Investors</v-list-item-title>
        <v-list-item-action>
          <v-switch
            v-model="showInvestors"
            @change="updateProjectSettings('show_investors', showInvestors)"
          ></v-switch>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useNuxtApp } from "#app";

const props = defineProps({
  accessUuid: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["show-snackbar"]);

const showWatchings = ref(false);
const showTrailerViews = ref(false);
const showInvestors = ref(false);

const { $axios } = useNuxtApp();

// Method to fetch the current project settings using the accessUuid
const fetchProjectSettings = async () => {
  try {
    const { data } = await $axios.get(
      `/api/projects/${props.accessUuid}/settings`
    );
    showWatchings.value = data.show_watchings;
    showTrailerViews.value = data.show_trailer_views;
    showInvestors.value = data.show_investors;
  } catch (error) {
    console.error("Error fetching project settings:", error);
    emit("show-snackbar", "Failed to fetch settings.");
  }
};

// Method to update project settings
const updateProjectSettings = async (settingKey, newValue) => {
  try {
    const payload = { [settingKey]: newValue };
    await $axios.put(`/api/projects/${props.accessUuid}/settings`, payload);
    emit("show-snackbar", "Settings saved.");
  } catch (error) {
    console.error("Error updating project settings:", error);
    emit("show-snackbar", "Failed to update settings.");
  }
};

// Fetch project settings when component is mounted
fetchProjectSettings();
</script>

<style lang="scss" scoped></style>
