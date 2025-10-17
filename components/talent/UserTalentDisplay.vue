<!-- components/UserTalentDisplay.vue -->
<template>
  <v-card
    class="user-talent-display"
    :class="{
      'pa-3': !compact,
      'pa-2': compact,
    }"
    variant="outlined"
    flat
  >
    <v-card-text class="d-flex align-center">
      <div class="talent-content">
        <template v-if="userTalent">
          <div class="text-body-2 textSecondary label-text">
            Your Current Talent
          </div>
          <div class="text-h6 textSecondary font-weight-medium">
            {{ userTalent.talent }}
          </div>
        </template>
        <template v-else>
          <div class="text-h6 textSecondary">No talent selected</div>
          <div class="text-body-2 textSecondary">
            Select a talent category to begin
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface TalentDetails {
  category: string
  talent: string
  category_id?: number
  talent_id?: number
}

interface Props {
  userTalent: TalentDetails | null
  compact?: boolean
  elevated?: boolean
}

withDefaults(defineProps<Props>(), {
  userTalent: null,
  compact: false,
  elevated: false,
})
</script>

<style scoped>
.user-talent-display {
  width: 100%;
  background-color: white;
  border: 1px solid #e4e6eb;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.talent-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-text {
  margin-bottom: 2px;
}

:deep(.v-card-text) {
  padding: 12px 16px;
}

:deep(.v-card) {
  box-shadow: none !important;
}
</style>
