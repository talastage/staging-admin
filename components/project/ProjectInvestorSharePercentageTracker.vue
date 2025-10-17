<template>
  <div>
    <!-- Compact Investment Data Display -->
    <v-card elevation="10" class="mb-4">
      <v-card-item>
        <v-card-title class="text-h6">
          Project Investors Share Distribution
        </v-card-title>

        <!-- Progress Bar Section -->
        <div class="mt-4">
          <div class="d-flex justify-space-between mb-1">
            <span class="text-caption">Creator Share</span>
            <span class="text-caption">Investor Share</span>
          </div>
          <div class="progress-container">
            <v-progress-linear
              :model-value="stats.creator_shares"
              height="24"
              color="primary"
              rounded
            >
              <template #default>
                <strong>{{ stats.creator_shares }}%</strong>
              </template>
            </v-progress-linear>

            <div
              class="investor-share-overlay"
              :style="{ width: `${stats.investor_shares}%` }"
            >
              <strong>{{ stats.investor_shares }}%</strong>
            </div>
          </div>
        </div>
      </v-card-item>
    </v-card>

    <!-- Stats Cards -->
    <v-row>
      <!-- Creator Shares -->
      <v-col cols="12" sm="4">
        <v-card elevation="10" class="stat-card">
          <v-card-item>
            <template #prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon icon="mdi-account-star" />
              </v-avatar>
            </template>
            <v-card-title>
              Creator Shares
              <div class="text-h5 mt-2">{{ stats.creator_shares }}%</div>
            </v-card-title>
          </v-card-item>
        </v-card>
      </v-col>

      <!-- Investor Shares -->
      <v-col cols="12" sm="4">
        <v-card elevation="10" class="stat-card">
          <v-card-item>
            <template #prepend>
              <v-avatar color="success" variant="tonal">
                <v-icon icon="mdi-account-group" />
              </v-avatar>
            </template>
            <v-card-title>
              Investor Shares
              <div class="text-h5 mt-2">{{ stats.investor_shares }}%</div>
            </v-card-title>
          </v-card-item>
        </v-card>
      </v-col>

      <!-- Total Investors -->
      <v-col cols="12" sm="4">
        <v-card elevation="10" class="stat-card">
          <v-card-item>
            <template #prepend>
              <v-avatar color="info" variant="tonal">
                <v-icon icon="mdi-account-multiple" />
              </v-avatar>
            </template>
            <v-card-title>
              Total Investors
              <div class="text-h5 mt-2">{{ stats.total_investors }}</div>
            </v-card-title>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  creator_shares: number
  investor_shares: number
  total_investors: number
}

defineProps<{
  stats: Stats
}>()
</script>

<style scoped>
.progress-container {
  position: relative;
  height: 24px;
}

.v-progress-linear {
  position: absolute;
  width: 100%;
}

.investor-share-overlay {
  position: absolute;
  right: 0;
  top: 0;
  height: 24px;
  background-color: var(--v-theme-success);
  border-radius: 0 12px 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: width 0.3s ease;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

:deep(.v-progress-linear__content) {
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>
