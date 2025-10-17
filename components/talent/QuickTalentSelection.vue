<template>
  <div class="quick-selection-section mb-6">
    <BaseContent
      title="Register Your Category"
      subtitle="Choose from popular categories to connect with like-minded professionals and showcase your expertise."
    >
      <template #content>
        <!-- Talent Search -->
        <SearchTalent
          class="mb-4"
          @talent-selected="handleSearchTalentSelect"
        />

        <v-divider class="mb-4"></v-divider>

        <div class="d-flex align-center mb-3">
          <h4 class="text-subtitle-1 font-weight-medium">Popular Categories</h4>
        </div>

        <!-- Loading State -->
        <div v-if="popularTalentsLoading" class="loading-container">
          <v-row>
            <v-col v-for="n in 8" :key="n" cols="6" sm="4" md="3">
              <v-skeleton-loader type="chip" class="mb-2"></v-skeleton-loader>
            </v-col>
          </v-row>
        </div>

        <!-- Error State -->
        <v-alert v-else-if="popularTalentsError" type="error" class="mb-4">
          {{ popularTalentsError }}
          <template #append>
            <v-btn size="small" variant="text" @click="fetchPopularTalents">
              Retry
            </v-btn>
          </template>
        </v-alert>

        <!-- Talents Grid -->
        <div v-else-if="popularTalents.length > 0" class="talents-grid">
          <v-chip-group
            v-model="selectedPopularTalentIndex"
            column
            :mandatory="false"
            class="talent-chips"
          >
            <v-chip
              v-for="(talent, index) in popularTalents"
              :key="talent.id"
              :value="index"
              variant="elevated"
              size="large"
              class="talent-chip text-body-2"
              :class="{
                'talent-chip--selected': selectedPopularTalentIndex === index,
              }"
              @click="handleTalentSelect(talent, index)"
            >
              {{ talent.name }}
            </v-chip>
          </v-chip-group>
        </div>

        <!-- Empty State -->
        <EmptyStateCard
          v-else
          title="No Popular Categories"
          message="No popular categories available at the moment."
          icon="mdi-star-outline"
          iconColor="grey-lighten-1"
        />
      </template>
    </BaseContent>

    <!-- Quick Registration Confirmation Dialog -->
    <BaseDialog
      v-model="showQuickConfirmDialog"
      title="Confirm Category Registration"
      max-width="450px"
    >
      <div v-if="selectedPopularTalent" class="confirmation-content">
        <div class="text-center mb-4">
          <v-icon size="48" color="primary" class="mb-2">mdi-star</v-icon>
          <h3 class="text-h6 mb-2">Register Your Category</h3>
          <p class="text-body-1">
            You're about to register
            <strong>{{ selectedPopularTalent.name }}</strong>
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            Connect with talented professionals and showcase your expertise to
            potential collaborators.
          </p>
        </div>
      </div>

      <template #actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="cancelQuickSelection"
          :disabled="registering"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="confirmRegistration"
          :loading="registering"
        >
          Confirm Registration
        </v-btn>
      </template>
    </BaseDialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="4000"
      location="top"
    >
      <v-icon>mdi-check-circle</v-icon>
      Category registered successfully!
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineEmits } from 'vue'
import EmptyStateCard from '@/components/common/EmptyStateCard.vue'
import BaseContent from '@/components/base/BaseContent.vue'
import TalentSearch from '~/components/talent/SearchTalent.vue'
import {
  useTalentSelection,
  type PopularTalent,
} from '@/composables/useTalentSelection'

const emit = defineEmits(['talent-registered', 'talent-selected', 'error'])

const {
  popularTalentsLoading,
  registering,
  popularTalentsError,
  popularTalents,
  selectedPopularTalent,
  selectedPopularTalentIndex,
  showQuickConfirmDialog,
  showSuccessSnackbar,
  fetchPopularTalents,
  selectPopularTalent,
  cancelQuickSelection,
  registerTalent,
} = useTalentSelection()

const handleTalentSelect = (talent: PopularTalent, index: number) => {
  selectPopularTalent(talent, index)
  emit('talent-selected', talent)
}

const handleSearchTalentSelect = (talent: any) => {
  // Format the talent to match the structure expected by selectPopularTalent
  const formattedTalent = {
    id: talent.id,
    name: talent.name,
    category_id: talent.category_id,
    category: talent.category,
  }

  // Select the talent (but don't pass an index since it's not from the popular talents array)
  selectPopularTalent(formattedTalent, null)
  emit('talent-selected', formattedTalent)
}

const confirmRegistration = async () => {
  const result = await registerTalent()

  if (result.success) {
    emit('talent-registered', result.talent)
  } else {
    emit('error', result.message)
  }
}

onMounted(async () => {
  await fetchPopularTalents()
})
</script>

<style scoped>
.loading-container {
  padding: 12px 0;
}

.talents-grid {
  padding: 8px 0;
}

.talent-chips {
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.talent-chip {
  margin: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
  min-height: 36px !important;
  padding: 0 16px;
}

.talent-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.talent-chip--selected {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.confirmation-content {
  padding: 16px 0;
}
</style>
