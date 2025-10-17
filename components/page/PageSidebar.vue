<!-- components/PageSidebar.vue -->
<template>
  <div class="page-sidebar">
    <!-- Quick Info Card -->
    <v-card class="mb-4">
      <v-card-title>Quick Info</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item prepend-icon="mdi-web">
            <v-list-item-title>Website</v-list-item-title>
            <v-list-item-subtitle>{{ page?.website }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item prepend-icon="mdi-account-group">
            <v-list-item-title>Industry</v-list-item-title>
            <v-list-item-subtitle>{{
              page?.subcategory?.name
            }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item prepend-icon="mdi-office-building">
            <v-list-item-title>Company Size</v-list-item-title>
            <v-list-item-subtitle>{{
              page?.company_size
            }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Similar Pages -->
    <v-card>
      <v-card-title>Similar Pages</v-card-title>
      <v-card-text>
        <!-- Add similar pages list here -->
      </v-card-text>
    </v-card>
  </div>
</template>
