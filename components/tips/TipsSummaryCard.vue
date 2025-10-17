<!-- components/tips/TipsSummaryCard.vue -->
<template>
  <v-card elevation="10" class="mb-4">
    <v-card-title>Tips Summary</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-card variant="outlined" class="pa-4">
            <div class="text-subtitle-2">Sent Tips</div>
            <div class="text-h6">{{ summary?.sent.total_count || 0 }}</div>
            <div v-if="summary?.sent.by_currency?.length" class="text-body-2">
              <div v-for="currency in summary.sent.by_currency" :key="currency.currency?.id">
                {{ currency.total_amount?.formatted || '0' }}
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card variant="outlined" class="pa-4">
            <div class="text-subtitle-2">Received Tips</div>
            <div class="text-h6">{{ summary?.received.total_count || 0 }}</div>
            <div v-if="summary?.received.by_currency?.length" class="text-body-2">
              <div v-for="currency in summary.received.by_currency" :key="currency.currency?.id">
                {{ currency.total_amount?.formatted || '0' }}
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { TipSummary } from '~/types/tips'

defineProps<{
  summary: TipSummary | null
}>()
</script>
