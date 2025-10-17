<template>
  <v-card class="page-header" flat>
    <!-- Gradient Background -->
    <div class="header-gradient"></div>

    <!-- Profile Section -->
    <v-container class="profile-section">
      <div class="profile-content">
        <!-- Avatar and Basic Info -->
        <div class="profile-main">
          <!-- Page Avatar Photo -->
          <PageProfilePhoto
            :page="page"
            :size="avatarSize"
            @photo-updated="onPhotoUpdated"
            class="profile-avatar"
          />

          <!-- Page Info -->
          <div class="page-info">
            <div class="d-flex align-center flex-wrap">
              <h1 class="text-h4 font-weight-bold mb-0 me-2">
                {{ page.name }}
              </h1>
              <v-chip
                v-if="page.is_verified"
                color="primary"
                size="small"
                class="verified-chip"
                prepend-icon="mdi-check-decagram"
              >
                Verified
              </v-chip>
            </div>

            <div v-if="page.tagline" class="tagline">
              {{ page.tagline }}
            </div>

            <!-- Location and Category -->
            <div class="meta-info">
              <v-chip
                v-if="page.country"
                variant="outlined"
                size="small"
                class="meta-chip"
                prepend-icon="mdi-map-marker"
              >
                {{ page.country.name }}
              </v-chip>

              <v-chip
                v-if="page.category"
                variant="outlined"
                size="small"
                class="meta-chip"
                prepend-icon="mdi-briefcase"
              >
                {{ page.category.name }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

// Define interfaces for type safety
interface Country {
  name: string
}

interface Category {
  name: string
}

interface Creator {
  id: number
}

export interface Page {
  cover_url: string | null
  avatar_url: string | null
  name: string
  tagline?: string | null
  is_verified: boolean
  country?: Country | null
  category?: Category | null
  creator: Creator
}

// Define component props
const props = defineProps<{
  page: Page
}>()

// Responsive display
const { smAndDown } = useDisplay()

// Compute avatar size based on screen size
const avatarSize = computed(() => smAndDown.value ? 120 : 160)

// Event handler for when the page avatar is updated
const onPhotoUpdated = (newUrl: string): void => {
  console.log('New page avatar URL:', newUrl)
}
</script>

<style lang="scss" scoped>
.page-header {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

.header-gradient {
  height: 120px;
  background: linear-gradient(135deg, var(--v-primary-base, #1976d2) 0%, var(--v-primary-darken-2, #0d47a1) 100%);
  position: relative;
  
  @media (min-width: 600px) {
    height: 160px;
  }
}

.profile-section {
  position: relative;
  padding-bottom: 24px;
}

.profile-content {
  padding: 0 16px;
}

.profile-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (min-width: 600px) {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
  }
}

.profile-avatar {
  margin-top: -60px;
  border: 4px solid white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: white;
  
  @media (min-width: 600px) {
    margin-top: -80px;
  }
}

.page-info {
  padding-top: 16px;
  width: 100%;
  
  @media (min-width: 600px) {
    padding-top: 20px;
    padding-left: 24px;
  }
}

.verified-chip {
  height: 24px;
  font-weight: 500;
}

.tagline {
  margin: 12px 0;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.5;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.meta-chip {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 400;
}
</style>