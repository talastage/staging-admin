<template>
  <v-container class="policy-detail-container">
    <v-row v-if="loading">
      <v-col cols="12" class="d-flex justify-center align-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>
        <v-btn color="primary" to="/policies" prepend-icon="mdi-arrow-left">
          Back to Policies
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <!-- Main Content Area -->
      <v-col cols="12">
        <v-card class="policy-content-card" rounded="lg">
          <v-card-item>
            <v-card-title class="text-h4 font-weight-bold">
              {{ policyTitle }}
            </v-card-title>
            <v-card-subtitle class="mt-2">
              Last updated: {{ formatDate(policyUpdatedAt) }}
            </v-card-subtitle>
          </v-card-item>

          <v-divider></v-divider>

          <v-card-text class="policy-content">
            <div
              v-for="section in policySections"
              :key="section.id"
              :id="section.id"
              class="policy-section mb-8"
            >
              <h2 class="text-h5 font-weight-medium mb-4">
                {{ section.title }}
              </h2>
              <div v-html="section.content" class="policy-html-content"></div>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-btn
              color="primary"
              variant="text"
              to="/policies"
              prepend-icon="mdi-arrow-left"
            >
              Back to Policies
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon @click="scrollToTop">
              <v-icon>mdi-arrow-up</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'

const route = useRoute()
const { $axios } = useNuxtApp()

const policyTitle = ref('')
const policyUpdatedAt = ref('')
const policySections = ref([])
const loading = ref(true)
const error = ref('')
// No longer needed since we removed the sidebar navigation
// const activeSection = ref('')

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Fetch policy details based on slug
const fetchPolicyDetails = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $axios.get(
      `/api/policies/${route.params.policySlug}`
    )
    policyTitle.value = response.data.name
    policyUpdatedAt.value = response.data.updated_at

    policySections.value = response.data.contents.map((content, index) => ({
      id: `section-${index + 1}`,
      title: content.title,
      content: content.content,
    }))

    // No longer need to set active section since sidebar is removed
  } catch (err) {
    console.error('Error fetching policy details:', err)
    error.value = 'Unable to load policy. Please try again later.'
  } finally {
    loading.value = false
  }
}

// No longer needed since we removed the sidebar navigation
// const scrollToSection = (id) => {
//   const element = document.getElementById(id)
//   if (element) {
//     element.scrollIntoView({ behavior: 'smooth' })
//   }
// }

// Scroll to top of the page
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Update active section based on scroll position
// No longer needed since we removed the sidebar
const handleScroll = () => {
  // Simplified scroll handler - only used for potential future enhancements
  return
}

onMounted(() => {
  fetchPolicyDetails()
})

// No longer need scroll event listeners
// onUnmounted(() => {
//   window.removeEventListener('scroll', handleScroll)
// })
</script>

<style scoped>
.policy-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 4rem;
}

/* Removed sidebar styles as it's no longer needed */

.policy-content-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.policy-section {
  scroll-margin-top: 24px;
}

.policy-html-content {
  line-height: 1.7;
}

.policy-html-content :deep(h1),
.policy-html-content :deep(h2),
.policy-html-content :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.policy-html-content :deep(p) {
  margin-bottom: 1rem;
}

.policy-html-content :deep(ul),
.policy-html-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.policy-html-content :deep(li) {
  margin-bottom: 0.5rem;
}

.policy-html-content :deep(a) {
  color: var(--v-primary-base);
  text-decoration: none;
}

.policy-html-content :deep(a:hover) {
  text-decoration: underline;
}
</style>
