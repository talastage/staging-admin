<template>
  <div>
    <BaseHeader title="Tip Details" :margin-bottom="24"> </BaseHeader>

    <div class="payment-status-container">
      <!-- Loading State -->
      <template v-if="loading">
        <BaseCard>
          <v-card-title class="d-flex align-center pb-2">
            <v-skeleton-loader type="avatar" size="32" class="mr-2" />
            <v-skeleton-loader type="text" width="150" />
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-skeleton-loader type="heading" class="mb-4" />
                <v-skeleton-loader type="chip" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-skeleton-loader type="text" class="mb-4" />
                <v-skeleton-loader type="text" />
              </v-col>
            </v-row>
          </v-card-text>
        </BaseCard>
      </template>

      <!-- Error State -->
      <v-alert v-else-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Success State -->
      <template v-else-if="currentPayment">
        <BaseCard>
          <v-card-title class="d-flex align-center pb-2">
            <v-icon
              :color="getStatusColor(currentPayment.status)"
              size="32"
              class="mr-2"
            >
              {{ getStatusIcon(currentPayment.status) }}
            </v-icon>
            {{ getPaymentTypeTitle(currentPayment.payment_type) }}
          </v-card-title>

          <v-card-text>
            <!-- Payment Details -->
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-subtitle-1 font-weight-bold mb-2">Amount</div>
                <div class="text-h5 mb-4">
                  {{
                    currencyFormatter(
                      currentPayment.amount,
                      currentPayment.currency.symbol,
                      currentPayment.currency.code
                    )
                  }}
                </div>

                <div class="text-subtitle-1 font-weight-bold mb-2">Status</div>
                <v-chip
                  :color="getStatusColor(currentPayment.status)"
                  text-color="white"
                >
                  {{ formatStatus(currentPayment.status) }}
                </v-chip>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-subtitle-1 font-weight-bold mb-2">
                  Reference
                </div>
                <div class="text-body-1 mb-4">
                  {{ currentPayment.reference }}
                </div>

                <div class="text-subtitle-1 font-weight-bold mb-2">Date</div>
                <div class="text-body-1">
                  {{ formatLocalDateTime(currentPayment.created_at) }}
                  <span class="text-caption text-medium-emphasis ml-2">
                    ({{ formatRelativeDate(currentPayment.created_at) }})
                  </span>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Recipient/Project Details -->
            <div class="text-subtitle-1 font-weight-bold mb-3">
              {{ getRecipientTitle(currentPayment.payment_type) }}
            </div>

            <!-- User Card for Tips -->
            <template v-if="currentPayment.payment_type === 'tip'">
              <!-- Single recipient (legacy support) -->
              <UserCard
                v-if="currentPayment.recipient"
                :user="currentPayment.recipient"
                size="medium"
                layout="compact"
              />

              <!-- Multiple recipients -->
              <template
                v-else-if="
                  currentPayment.recipients && currentPayment.recipients.length
                "
              >
                <div
                  v-for="(recipient, index) in currentPayment.recipients"
                  :key="index"
                  class="mb-3"
                >
                  <UserCard :user="recipient" size="medium" layout="compact" />
                </div>
              </template>
            </template>

            <!-- Project Cards for Project Tips/Watching/Premiering -->
            <template
              v-else-if="
                projectPaymentTypes.includes(currentPayment.payment_type)
              "
            >
              <!-- Multiple projects -->
              <template
                v-if="
                  currentPayment.projects && currentPayment.projects.length > 0
                "
              >
                <div
                  v-for="(project, index) in currentPayment.projects"
                  :key="project.id"
                  class="mb-4"
                >
                  <ProjectCardCompact :project="project" size="md">
                    <template #actions>
                      <template
                        v-if="
                          currentPayment.payment_type === 'project_watching'
                        "
                      >
                        <WatchNowButton
                          :access-uuid="project.access_uuid"
                          size="md"
                        >
                          Start Watching
                        </WatchNowButton>
                      </template>
                      <template
                        v-else-if="
                          currentPayment.payment_type === 'project_premiering'
                        "
                      >
                        <v-btn
                          color="primary"
                          variant="tonal"
                          size="small"
                          prepend-icon="mdi-pencil"
                          @click="navigateToEditDraft(project.access_uuid)"
                        >
                          Edit Draft
                        </v-btn>
                      </template>
                    </template>
                  </ProjectCardCompact>
                  <v-divider
                    v-if="index < currentPayment.projects.length - 1"
                    class="my-3"
                  />
                </div>
              </template>

              <!-- Single project (legacy support) -->
              <template v-else-if="currentPayment.project">
                <ProjectCardCompact :project="currentPayment.project" size="md">
                  <template #actions>
                    <template
                      v-if="currentPayment.payment_type === 'project_watching'"
                    >
                      <v-btn
                        color="primary"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-play-circle-outline"
                        @click="
                          navigateToWatch(currentPayment.project.access_uuid)
                        "
                      >
                        Watch Now
                      </v-btn>
                    </template>
                    <template
                      v-else-if="
                        currentPayment.payment_type === 'project_premiering'
                      "
                    >
                      <v-btn
                        color="primary"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-pencil"
                        @click="
                          navigateToEditDraft(
                            currentPayment.project.access_uuid
                          )
                        "
                      >
                        Edit Draft
                      </v-btn>
                    </template>
                  </template>
                </ProjectCardCompact>
              </template>

              <!-- No projects found -->
              <div v-else class="text-body-1 text-medium-emphasis">
                No projects found for this payment.
              </div>
            </template>
          </v-card-text>
        </BaseCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useUserPayments } from '~/composables/useUserPayments'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.MEDIUM,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
  },
})

const router = useRouter()
const { formatRelativeDate, formatLocalDateTime } = useDateFormatter()
const { currencyFormatter } = useCurrencyFormatter()

// Use our payment composable
const {
  currentPayment,
  loading,
  error,
  initPaymentDetail,
  getStatusColor,
  getStatusIcon,
  getPaymentTypeTitle,
  getRecipientTitle,
  formatStatus,
  projectPaymentTypes,
} = useUserPayments()

// Initialize app store
const appsStore = useAppsStore()

const navigateToWatch = (accessUuid: string) => {
  router.push(`/watch/${accessUuid}`)
}

const navigateToEditDraft = (accessUuid: string) => {
  router.push(`/studio/projects/${accessUuid}/edit_draft`)
}

// Fetch necessary data on mount
onMounted(async () => {
  initPaymentDetail()
  await appsStore.fetchTalaStageApp()
})

// Access the TalaStage app
const talastageApp = computed(() => appsStore.talastageApp)

// Apply SEO settings
useSeo({
  title: computed(
    () => `Tip Details - ${talastageApp.value?.name || 'TalaStage'}`
  ),
  description: computed(
    () =>
      talastageApp.value?.seo_description ||
      'View details of your tip transaction on TalaStage'
  ),
  keywords: computed(() => talastageApp.value?.meta_keywords || ''),
  image: computed(
    () =>
      talastageApp.value?.thumbnail_url ||
      talastageApp.value?.logo_url ||
      'https://talastage.com/app-logo.png'
  ),
  url: computed(
    () => talastageApp.value?.canonical_url || 'https://talastage.com'
  ),
  type: 'website',
  siteName: computed(() => talastageApp.value?.name || 'TalaStage'),
  twitter: {
    card: 'summary_large_image',
    site: '@talastage',
  },
  script: computed(() => {
    const schemaMarkup = talastageApp.value?.schema_markup
    if (schemaMarkup) {
      return [
        {
          type: 'application/ld+json',
          innerHTML: schemaMarkup,
        },
      ]
    }
    return []
  }),
  link: computed(() => [
    {
      rel: 'icon',
      type: 'image/png',
      href: talastageApp.value?.favicon_url || '/favicon.png',
    },
  ]),
})
</script>

<style scoped>
.payment-status-container {
  width: 100%;
}

:deep(.v-skeleton-loader) {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
