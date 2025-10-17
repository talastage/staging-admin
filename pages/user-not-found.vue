<template>
  <div class="fill-height bg-grey-lighten-4">
    <v-container class="fill-height">
      <v-row class="fill-height" align="center" justify="center">
        <v-col cols="12" sm="8" md="6" class="text-center">
          <v-card class="pa-6" elevation="0" rounded="lg">
            <v-icon
              icon="mdi-account-question"
              size="96"
              color="warning"
              class="mb-6"
            />

            <v-card-text>
              <h1 class="text-h3 font-weight-bold mb-4">User Not Found</h1>
              <p class="text-body-1 text-medium-emphasis mb-6">
                The user profile you're looking for doesn't exist or may have
                been removed.
              </p>

              <v-row justify="center" class="gap-4">
                <v-btn
                  to="/"
                  color="primary"
                  size="large"
                  prepend-icon="mdi-home"
                  rounded
                >
                  Back to Home
                </v-btn>

                <v-btn
                  to="/talents"
                  variant="tonal"
                  size="large"
                  prepend-icon="mdi-compass"
                  rounded
                >
                  Explore Talents
                </v-btn>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { PAGE_WIDTHS } from '~/constants/layouts'
import { useSeo } from '~/composables/seo/useSeo'

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
  middleware: ['noindex'],
})

// Use the SEO composable for better metadata management
useSeo({
  title: 'User Not Found',
  description: 'The user profile you were looking for could not be found.',
  noIndex: true,
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

@media (max-width: 600px) {
  .v-row.gap-4 {
    flex-direction: column;
    gap: 1rem !important;
  }

  .v-row.gap-4 .v-btn {
    width: 100%;
  }
}
</style>
