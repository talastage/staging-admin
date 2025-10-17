<template>
  <BaseCard :elevation="cardElevation" class="tip-url-sharing-header-card">
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar color="primary" variant="tonal" size="48">
          <v-icon icon="mdi-currency-usd" />
        </v-avatar>
      </template>

      <v-card-title>Grow Your Income with Tips</v-card-title>
      <v-card-subtitle>
        Share your personal tip URL to start receiving support from your fans
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <v-row align="center">
        <v-col cols="12" md="8">
          <div class="d-flex flex-column flex-md-row gap-3">
            <div class="tip-feature d-flex align-center">
              <v-icon
                icon="mdi-check-circle"
                color="success"
                class="mr-2"
                size="small"
              />
              <span class="text-caption">Direct financial support</span>
            </div>
            <div class="tip-feature d-flex align-center">
              <v-icon
                icon="mdi-check-circle"
                color="success"
                class="mr-2"
                size="small"
              />
              <span class="text-caption">Easy social sharing</span>
            </div>
            <div class="tip-feature d-flex align-center">
              <v-icon
                icon="mdi-check-circle"
                color="success"
                class="mr-2"
                size="small"
              />
              <span class="text-caption">Real-time tracking</span>
            </div>
          </div>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex justify-center justify-md-end mt-3 mt-md-0"
        >
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-share-variant"
            size="large"
            class="px-6"
            @click="$emit('show-share')"
          >
            Share My Tip Link
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </BaseCard>
</template>

<script setup>
// Define props
defineProps({
  cardElevation: {
    type: [Number, String],
    default: 2, // Reduced elevation for a more subtle shadow
  },
})

// Define emitted events
defineEmits(['show-share'])
</script>

<style scoped>
/* Specific styles for this header card */
.tip-url-sharing-header-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Styles for the feature list items */
.tip-feature {
  padding: 4px 8px;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border-radius: 16px;
}

/* Style for the gap between feature items */
.gap-3 {
  gap: 0.75rem;
}

@media (max-width: 600px) {
  .gap-3 {
    gap: 0.5rem;
  }
}
</style>