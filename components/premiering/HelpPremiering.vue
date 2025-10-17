<template>
  <v-row justify="center" class="mt-4">
    <v-col cols="12" class="text-center">
      <v-divider class="mb-6" />
      <h3 class="text-h5 mb-4">Need Help Getting Started?</h3>
      <p class="text-medium-emphasis mb-4">
        Our support team is here to help you through the premiering process.
      </p>
      <v-btn color="primary" variant="tonal" @click="navigateToHelp">
        <v-icon start>mdi-help-circle</v-icon>
        View Premiering Guide
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const router = useRouter()

const navigateToHelp = () => {
  router.push('/help/premiering-guide')
}
</script>
