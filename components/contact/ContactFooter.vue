<!-- components/footer/ContactFooter.vue -->
<template>
  <div class="contact-footer-wrapper">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <div class="contact-footer-card">
            <div class="contact-footer-content text-center">
              <h2 class="text-h4 font-weight-bold mb-3">{{ title }}</h2>
              <p class="text-subtitle-1 text-medium-emphasis mb-6 mx-auto">
                {{ description }}
              </p>

              <!-- <div class="support-metrics d-flex justify-center mb-8">
                <div class="metric px-4">
                  <div class="metric-value">24/7</div>
                  <div class="metric-label">Support</div>
                </div>
                <v-divider vertical class="mx-2 mx-md-6"></v-divider>
                <div class="metric px-4">
                  <div class="metric-value">1h</div>
                  <div class="metric-label">Avg. Response</div>
                </div>
                <v-divider vertical class="mx-2 mx-md-6"></v-divider>
                <div class="metric px-4">
                  <div class="metric-value">98%</div>
                  <div class="metric-label">Satisfaction</div>
                </div>
              </div> -->

              <div
                class="contact-actions d-flex flex-column flex-sm-row justify-center"
              >
                <v-btn
                  color="primary"
                  size="x-large"
                  class="px-8"
                  prepend-icon="mdi-message-text-outline"
                  :loading="isNavigating"
                  :disabled="isNavigating"
                  @click="handleContactNavigation"
                >
                  Contact Support
                </v-btn>

                <v-btn
                  variant="outlined"
                  size="x-large"
                  class="mt-3 mt-sm-0 ms-sm-4 px-6"
                  prepend-icon="mdi-help-circle-outline"
                  :disabled="isNavigating"
                  @click="handleFaqNavigation"
                >
                  View help articles
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#app'
import { useSnackMessageStore } from '@/stores/useSnackMessage'

interface Props {
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: "Need Help? We're Here For You",
  description:
    'Our dedicated support team is ready to assist you with any questions or concerns you may have.',
})

const snackStore = useSnackMessageStore()
const isNavigating = ref(false)

const handleContactNavigation = async () => {
  if (isNavigating.value) return

  isNavigating.value = true
  try {
    await navigateTo('/contacts')
  } catch (error) {
    console.error('Navigation error:', error)
    snackStore.error('Failed to navigate to contact page')
  } finally {
    isNavigating.value = false
  }
}

const handleFaqNavigation = async () => {
  if (isNavigating.value) return

  isNavigating.value = true
  try {
    await navigateTo('/help')
  } catch (error) {
    console.error('Navigation error:', error)
    snackStore.error('Failed to navigate to FAQ page')
  } finally {
    isNavigating.value = false
  }
}
</script>

<style scoped>
.contact-footer-wrapper {
  width: 100%;
  padding: 64px 0;
  background-color: rgb(var(--v-theme-background));
  border-top: 1px solid rgba(var(--v-border-color), 0.08);
}

.contact-footer-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.contact-footer-content {
  padding: 48px 24px;
  position: relative;
  z-index: 2;
}

.contact-footer-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    to right,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary))
  );
  z-index: 3;
}

.contact-footer-content p {
  max-width: 600px;
}

.support-metrics {
  flex-wrap: wrap;
}

.metric {
  padding: 0 16px;
  min-width: 90px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1.1;
}

.metric-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-actions {
  gap: 16px;
}

/* Dark mode adjustments */
:deep(.v-theme--dark) .contact-footer-card {
  background-color: rgba(var(--v-theme-surface-variant), 0.8);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

/* Responsive styles */
@media (max-width: 600px) {
  .contact-footer-wrapper {
    padding: 40px 0;
  }

  .contact-footer-content {
    padding: 32px 16px;
  }

  .metric {
    padding: 0 12px;
  }

  .metric-value {
    font-size: 24px;
  }
}
</style>
