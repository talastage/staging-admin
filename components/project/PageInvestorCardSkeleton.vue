<template>
  <v-card class="investor-card-skeleton" elevation="2">
    <v-skeleton-loader
      type="image"
      :height="imgHeight"
      class="skeleton-image"
    />

    <div class="card-content">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-skeleton-loader type="text" width="70%" class="skeleton-title" />
        <v-skeleton-loader type="avatar" width="20px" height="20px" />
      </div>

      <!-- Country Location skeleton -->
      <div class="d-flex align-center my-1">
        <v-skeleton-loader
          type="avatar"
          width="16px"
          height="16px"
          class="me-1"
        />
        <v-skeleton-loader type="text" width="50%" />
      </div>

      <!-- Maximum Investment Amount skeleton -->
      <div class="mt-2">
        <v-skeleton-loader type="text" width="60%" class="skeleton-caption" />
        <v-skeleton-loader
          type="text"
          width="40%"
          class="skeleton-amount mt-1"
        />
      </div>
    </div>

    <v-card-actions class="card-actions">
      <v-skeleton-loader type="button" width="100%" :height="buttonHeight" />
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { smAndDown, width } = useDisplay()

// Computed properties for responsive design matching PageInvestorCard
const imgHeight = computed(() => {
  if (width.value < 400) return 120
  if (width.value < 600) return 140
  return 160
})

const buttonHeight = computed(() => {
  return smAndDown.value ? 28 : 32
})
</script>

<style scoped>
.investor-card-skeleton {
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.skeleton-image {
  border-radius: 0;
}

.card-content {
  padding: 12px 16px 8px;
  flex-grow: 1;
}

.card-actions {
  padding: 8px 16px 16px;
}

.skeleton-title {
  height: 20px;
}

.skeleton-caption {
  height: 12px;
}

.skeleton-amount {
  height: 18px;
}

@media (max-width: 600px) {
  .investor-card-skeleton {
    border-radius: 8px;
  }

  .card-content {
    padding: 8px 12px 4px;
  }

  .card-actions {
    padding: 8px 12px 12px;
  }

  .skeleton-title {
    height: 18px;
  }

  .skeleton-amount {
    height: 16px;
  }
}
</style>
