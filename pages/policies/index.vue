<template>
  <v-container class="policies-index-container">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">Policies</h1>
        <p class="text-subtitle-1 text-medium-emphasis mb-6">
          Review our policies and terms of service
        </p>
      </v-col>
    </v-row>

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
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="!policies.length">
      <v-col cols="12">
        <v-card class="pa-6 text-center">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-file-document-outline</v-icon
          >
          <h3 class="text-h5 mb-2">No Policies Found</h3>
          <p class="text-body-1 text-medium-emphasis">
            There are currently no policies available.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="policy in policies"
        :key="policy.id"
        cols="12"
        sm="6"
        lg="4"
        class="d-flex"
      >
        <v-card
          :to="`/policies/${policy.slug}`"
          class="policy-card"
          elevation="2"
          rounded="lg"
          hover
        >
          <v-card-title class="text-h6 font-weight-bold">
            {{ policy.name }}
          </v-card-title>
          <v-card-subtitle v-if="policy.description" class="pt-2">
            {{ truncateDescription(policy.description) }}
          </v-card-subtitle>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              :to="`/policies/${policy.slug}`"
              class="text-none"
            >
              Read More
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePoliciesStore } from '@/stores/usePoliciesStore'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

// Define page metadata
definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: { showCategories: true, showDrawer: true, miniDrawer: true },
  layout: 'default',
})

const policiesStore = usePoliciesStore()
const policies = ref([])
const loading = ref(true)
const error = ref('')

// Fetch all policies
const fetchPolicies = async () => {
  loading.value = true
  error.value = ''

  try {
    await policiesStore.fetchPolicies()
    policies.value = policiesStore.policies
  } catch (err) {
    console.error('Error fetching policies:', err)
    error.value = 'Unable to load policies. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Truncate description for display
const truncateDescription = (description: string) => {
  if (!description) return ''
  return description.length > 100
    ? `${description.substring(0, 100)}...`
    : description
}

// Set SEO metadata
useSeo({
  title: 'Policies - TalaStage',
  description: 'Review TalaStage policies, terms of service, and guidelines.',
  keywords: 'policies, terms of service, guidelines, privacy policy, TalaStage',
  url: `${useRuntimeConfig().public.frontendUrl}/policies`,
  type: 'website',
})

onMounted(fetchPolicies)
</script>

<style scoped>
.policies-index-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.policy-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.policy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
  line-height: 1.4;
}

.v-card-actions {
  margin-top: auto;
}
</style>
