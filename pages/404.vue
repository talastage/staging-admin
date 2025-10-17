<template>
  <div class="fill-height bg-grey-lighten-4">
    <v-container class="fill-height">
      <v-row class="fill-height" align="center" justify="center">
        <v-col cols="12" sm="8" md="6" class="text-center">
          <v-card class="pa-6" elevation="0" rounded="lg">
            <!-- Reduced icon size from 200 to 96 -->
            <v-icon
              icon="mdi-alert-circle-outline"
              size="96"
              color="error"
              class="mb-6"
            />

            <v-card-text>
              <h1 class="text-h3 font-weight-bold mb-4">
                Content Not Available
              </h1>
              <p class="text-body-1 text-medium-emphasis mb-6">
                We couldn't find what you're looking for. The page may have been
                moved, deleted, or is temporarily unavailable.
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
                  to="/help"
                  variant="tonal"
                  size="large"
                  prepend-icon="mdi-help-circle"
                  rounded
                >
                  Visit Help Center
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
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
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
