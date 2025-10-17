<template>
  <v-card>
    <v-card-title>{{ project.name }}</v-card-title>
    <v-card-subtitle>{{ project.description }}</v-card-subtitle>
    <v-card-text>
      <p>
        Start Date:
        {{
          project.start_date
            ? new Date(project.start_date).toLocaleDateString()
            : "N/A"
        }}
      </p>
      <p>
        End Date:
        {{
          project.end_date
            ? new Date(project.end_date).toLocaleDateString()
            : "N/A"
        }}
      </p>
      <p>Address: {{ project.address.region }}</p>
      <p>
        Project URL:
        <a :href="project.project_url" target="_blank">{{
          project.project_url
        }}</a>
      </p>
      <p>Is Active: {{ project.is_active ? "Yes" : "No" }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps(["project"]);
const project = props.project;
</script>
