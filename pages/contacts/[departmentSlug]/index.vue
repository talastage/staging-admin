<template>
  <v-container class="contact-page">
    <!-- Skeleton Loader -->
    <template v-if="loading">
      <div class="skeleton-wrapper">
        <v-skeleton-loader type="heading" class="mb-4" />
        <v-skeleton-loader type="paragraph" class="mb-8" />
        <v-row>
          <v-col cols="12" md="8">
            <v-skeleton-loader type="card" height="400" />
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader type="card" height="200" class="mb-4" />
            <v-skeleton-loader type="card" height="150" />
          </v-col>
        </v-row>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="error-container">
        <v-alert type="error" variant="tonal" prominent>
          <v-icon icon="mdi-alert-circle" size="large" />
          <div class="ml-4">
            <h3 class="text-h6 mb-2">Something went wrong</h3>
            <p class="mb-0">{{ error }}</p>
          </div>
        </v-alert>
      </div>
    </template>

    <template v-else>
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">{{ department.name }}</h1>
          <p class="hero-description">{{ department.description }}</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-content">
        <v-row class="content-grid" no-gutters>
          <!-- Contact Form Section -->
          <v-col cols="12" xl="8" lg="7" md="12" class="form-section">
            <div class="section-card">
              <div class="section-header">
                <v-icon icon="mdi-message-text" class="section-icon" />
                <div class="header-text">
                  <h2 class="section-title">Get in Touch</h2>
                  <p class="section-subtitle">
                    Send us a message and we'll respond within 24 hours
                  </p>
                </div>
              </div>
              <SendSupportMessage />
            </div>
          </v-col>

          <!-- Contact Methods Sidebar -->
          <v-col cols="12" xl="4" lg="5" md="12" class="sidebar-section">
            <div class="sidebar-content">
              <!-- Quick Contact Methods -->
              <div class="contact-methods">
                <h3 class="methods-title">Contact Methods</h3>

                <!-- WhatsApp -->
                <div
                  v-if="hasContacts('whatsapp')"
                  class="contact-method whatsapp"
                >
                  <div class="method-header">
                    <v-icon
                      icon="mdi-whatsapp"
                      class="method-icon whatsapp-icon"
                    />
                    <span class="method-name">WhatsApp</span>
                  </div>
                  <div class="contact-items">
                    <ContactItem
                      v-for="contact in department.contacts.whatsapp"
                      :key="contact.id"
                      type="whatsapp"
                      :value="contact.value"
                      :formatters="formatters"
                      external
                      @copy="copyToClipboard"
                      class="contact-item-modern"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div v-if="hasContacts('email')" class="contact-method email">
                  <div class="method-header">
                    <v-icon icon="mdi-email" class="method-icon email-icon" />
                    <span class="method-name">Email</span>
                  </div>
                  <div class="contact-items">
                    <ContactItem
                      v-for="contact in department.contacts.email"
                      :key="contact.id"
                      type="email"
                      :value="contact.value"
                      :formatters="formatters"
                      @copy="copyToClipboard"
                      class="contact-item-modern"
                    />
                  </div>
                </div>

                <!-- Phone -->
                <div v-if="hasContacts('phone')" class="contact-method phone">
                  <div class="method-header">
                    <v-icon icon="mdi-phone" class="method-icon phone-icon" />
                    <span class="method-name">Phone</span>
                  </div>
                  <div class="contact-items">
                    <ContactItem
                      v-for="contact in department.contacts.phone"
                      :key="contact.id"
                      type="phone"
                      :value="contact.value"
                      :formatters="formatters"
                      @copy="copyToClipboard"
                      class="contact-item-modern"
                    />
                  </div>
                </div>
              </div>

              <!-- Help Section -->
              <div class="help-section">
                <div class="help-card">
                  <v-icon icon="mdi-help-circle" class="help-icon" />
                  <h4 class="help-title">Need Quick Help?</h4>
                  <p class="help-text">
                    Check out our popular articles for instant solutions
                  </p>
                  <HelpPopularArticles />
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- No Contacts Fallback -->
      <div v-if="!hasAnyContacts" class="no-contacts">
        <v-alert type="info" variant="tonal" prominent>
          <v-icon icon="mdi-information" />
          <div class="ml-4">
            <h3 class="text-h6 mb-2">Contact Information Unavailable</h3>
            <p class="mb-0">
              Contact methods are currently being updated. Please try again
              later.
            </p>
          </div>
        </v-alert>
      </div>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFormatting } from '@/composables/useFormatting'
import { useSnackMessageStore } from '@/stores/useSnackMessage'
import { useSeo } from '@/composables/seo/useSeo'
import { useAppsStore } from '@/stores/useApps'
import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: true,
  },
  layout: 'default',
})

// Types
interface Contact {
  id: number
  value: string
  is_default: boolean
  timezone?: string
}

interface Department {
  id: number
  name: string
  slug: string
  description: string
  contacts: {
    whatsapp?: Contact[]
    email?: Contact[]
    phone?: Contact[]
  }
  is_using_default_contacts?: boolean
}

// Composables
const { $axios } = useNuxtApp()
const route = useRoute()
const { formatters } = useFormatting()
const snackStore = useSnackMessageStore()
const appsStore = useAppsStore()

// State
const department = ref<Department | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch app data for SEO
await appsStore.fetchTalaStageApp()
const talastageApp = computed(() => appsStore.talastageApp)

// SEO
useSeo({
  title: `${department.value?.name || 'Contact Us'} - ${
    talastageApp.value?.name || 'TalaStage'
  }`,
  description:
    department.value?.description ||
    talastageApp.value?.seo_description ||
    'Contact our support team for assistance with any questions or concerns you may have.',
  keywords:
    department.value?.meta_keywords ||
    talastageApp.value?.meta_keywords ||
    'contact, support, help, assistance, customer service',
  image:
    department.value?.logo_url ||
    talastageApp.value?.logo_url ||
    '/default-social-image.png',
  url: `${useRuntimeConfig().public.frontendUrl}/contacts/${
    route.params.departmentSlug
  }`,
  type: 'website',
  siteName: talastageApp.value?.name || 'TalaStage',
  twitterUsername: '@talastage',
})

// Computed
const hasAnyContacts = computed(() => {
  if (!department.value?.contacts) return false
  return Object.values(department.value.contacts).some(
    (contacts) => contacts && contacts.length > 0
  )
})

// Methods
const hasContacts = (type: 'whatsapp' | 'email' | 'phone'): boolean => {
  return !!department.value?.contacts?.[type]?.length
}

const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    snackStore.success('Contact copied to clipboard', {
      timeout: 2000,
      closable: true,
    })
  } catch (err) {
    snackStore.error('Failed to copy contact', {
      timeout: 3000,
      closable: true,
    })
  }
}

// Lifecycle
onMounted(async () => {
  try {
    const response = await $axios.get<{
      success: boolean
      data: Department
      message?: string
    }>(`/api/support/departments/${route.params.departmentSlug}`)

    if (response.data.success) {
      department.value = response.data.data
    } else {
      error.value = response.data.message || 'Failed to load department'
      snackStore.error('Failed to load department information')
    }
  } catch (e) {
    error.value = 'Department not found. Please try again later.'
    snackStore.error('Department not found. Please try again later.')
    console.error('Error:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.contact-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;

  @media (min-width: 768px) {
    padding: 0 24px;
  }

  @media (min-width: 1200px) {
    padding: 0 32px;
  }
}

// Skeleton & Error States
.skeleton-wrapper,
.error-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0;

  @media (min-width: 768px) {
    padding: 40px 0;
  }
}

// Hero Section
.hero-section {
  text-align: center;
  padding: 32px 16px 24px;
  background: linear-gradient(
    135deg,
    rgba(25, 118, 210, 0.05) 0%,
    rgba(156, 39, 176, 0.05) 100%
  );
  border-radius: 16px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 48px 24px 32px;
    border-radius: 20px;
    margin-bottom: 32px;
  }

  @media (min-width: 1024px) {
    padding: 60px 40px 40px;
    border-radius: 24px;
    margin-bottom: 40px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 30% 20%,
        rgba(25, 118, 210, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 70% 80%,
        rgba(156, 39, 176, 0.1) 0%,
        transparent 50%
      );
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 700px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: clamp(1.75rem, 4vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #1976d2 0%, #9c27b0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;

    @media (min-width: 768px) {
      margin-bottom: 16px;
    }
  }

  .hero-description {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: rgba(var(--v-theme-on-surface), 0.7);
    margin: 0;
    line-height: 1.5;

    @media (min-width: 768px) {
      line-height: 1.6;
    }
  }
}

// Main Content
.main-content {
  margin-bottom: 40px;

  @media (min-width: 768px) {
    margin-bottom: 60px;
  }
}

.content-grid {
  margin: 0;
  width: 100%;

  // Responsive column spacing
  @media (min-width: 1024px) {
    .form-section {
      padding-right: 20px;
    }

    .sidebar-section {
      padding-left: 20px;
    }
  }

  // Mobile first - stack vertically
  @media (max-width: 1023px) {
    .form-section {
      margin-bottom: 24px;
    }

    .sidebar-section {
      margin-bottom: 0;
    }
  }
}

// Form Section
.form-section {
  .section-card {
    background: rgba(var(--v-theme-surface), 1);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(var(--v-border-color), 0.1);
    position: relative;
    overflow: hidden;
    width: 100%;

    @media (min-width: 768px) {
      padding: 28px;
      border-radius: 18px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
    }

    @media (min-width: 1024px) {
      padding: 32px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #1976d2 0%, #9c27b0 100%);

      @media (min-width: 768px) {
        height: 4px;
      }
    }
  }

  .section-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 12px;

    @media (min-width: 768px) {
      align-items: center;
      margin-bottom: 28px;
      gap: 16px;
    }

    @media (min-width: 1024px) {
      margin-bottom: 32px;
    }

    .section-icon {
      background: linear-gradient(135deg, #1976d2 0%, #9c27b0 100%);
      color: white;
      padding: 10px;
      border-radius: 10px;
      font-size: 1.25rem;
      flex-shrink: 0;

      @media (min-width: 768px) {
        padding: 12px;
        border-radius: 12px;
        font-size: 1.5rem;
      }
    }

    .header-text {
      flex: 1;
      min-width: 0;
    }

    .section-title {
      font-size: clamp(1.25rem, 3vw, 1.75rem);
      font-weight: 600;
      margin: 0 0 4px 0;
      color: rgba(var(--v-theme-on-surface), 0.9);
      line-height: 1.3;
    }

    .section-subtitle {
      color: rgba(var(--v-theme-on-surface), 0.6);
      margin: 0;
      font-size: clamp(0.875rem, 2vw, 0.95rem);
      line-height: 1.4;
    }

    // Mobile adjustments
    @media (max-width: 599px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;

      .header-text {
        width: 100%;
      }
    }
  }
}

// Sidebar Section
.sidebar-section {
  width: 100%;

  .sidebar-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;

    @media (min-width: 768px) {
      gap: 24px;
    }
  }
}

// Contact Methods
.contact-methods {
  background: rgba(var(--v-theme-surface), 1);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  width: 100%;

  @media (min-width: 768px) {
    padding: 22px;
    border-radius: 18px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  }

  @media (min-width: 1024px) {
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  .methods-title {
    font-size: clamp(1.125rem, 2.5vw, 1.25rem);
    font-weight: 600;
    margin-bottom: 16px;
    color: rgba(var(--v-theme-on-surface), 0.9);

    @media (min-width: 768px) {
      margin-bottom: 20px;
    }
  }

  .contact-method {
    &:not(:last-child) {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(var(--v-border-color), 0.1);

      @media (min-width: 768px) {
        margin-bottom: 20px;
        padding-bottom: 20px;
      }
    }

    .method-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;

      @media (min-width: 768px) {
        gap: 12px;
        margin-bottom: 12px;
      }

      .method-icon {
        font-size: 1.125rem;
        padding: 6px;
        border-radius: 6px;
        flex-shrink: 0;

        @media (min-width: 768px) {
          font-size: 1.25rem;
          padding: 8px;
          border-radius: 8px;
        }
      }

      .whatsapp-icon {
        background: rgba(37, 211, 102, 0.1);
        color: #25d366;
      }

      .email-icon {
        background: rgba(25, 118, 210, 0.1);
        color: #1976d2;
      }

      .phone-icon {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }

      .method-name {
        font-weight: 500;
        color: rgba(var(--v-theme-on-surface), 0.8);
        font-size: clamp(0.875rem, 2vw, 1rem);
      }
    }

    .contact-items {
      :deep(.contact-item-modern) {
        border-radius: 6px;
        transition: all 0.2s ease;
        margin-bottom: 4px;

        @media (min-width: 768px) {
          border-radius: 8px;
        }

        &:hover {
          background: rgba(var(--v-theme-primary), 0.05);
          transform: translateX(2px);

          @media (min-width: 768px) {
            transform: translateX(4px);
          }
        }
      }
    }
  }
}

// Help Section
.help-section {
  .help-card {
    background: linear-gradient(
      135deg,
      rgba(25, 118, 210, 0.05) 0%,
      rgba(156, 39, 176, 0.05) 100%
    );
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    border: 1px solid rgba(var(--v-border-color), 0.1);
    position: relative;
    overflow: hidden;
    width: 100%;

    @media (min-width: 768px) {
      padding: 22px;
      border-radius: 18px;
    }

    @media (min-width: 1024px) {
      padding: 24px;
      border-radius: 20px;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(
        circle at 50% 50%,
        rgba(25, 118, 210, 0.05) 0%,
        transparent 70%
      );
      pointer-events: none;
    }

    .help-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, #1976d2 0%, #9c27b0 100%);
      color: white;
      padding: 12px;
      border-radius: 50%;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      @media (min-width: 768px) {
        font-size: 2.25rem;
        padding: 14px;
        margin-bottom: 14px;
      }

      @media (min-width: 1024px) {
        font-size: 2.5rem;
        padding: 16px;
        margin-bottom: 16px;
      }
    }

    .help-title {
      font-size: clamp(1rem, 2.5vw, 1.125rem);
      font-weight: 600;
      margin-bottom: 6px;
      color: rgba(var(--v-theme-on-surface), 0.9);
      position: relative;
      z-index: 1;

      @media (min-width: 768px) {
        margin-bottom: 8px;
      }
    }

    .help-text {
      color: rgba(var(--v-theme-on-surface), 0.6);
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
      font-size: clamp(0.875rem, 2vw, 0.95rem);
      line-height: 1.4;

      @media (min-width: 768px) {
        margin-bottom: 18px;
      }

      @media (min-width: 1024px) {
        margin-bottom: 20px;
      }
    }
  }
}

// No Contacts
.no-contacts {
  max-width: 600px;
  margin: 24px auto;
  text-align: center;

  @media (min-width: 768px) {
    margin: 40px auto;
  }
}

// Dark mode adjustments
:deep(.v-theme--dark) {
  .section-card,
  .contact-methods,
  .help-card {
    background: rgba(var(--v-theme-surface), 0.8);
    backdrop-filter: blur(10px);
  }

  .hero-section {
    background: linear-gradient(
      135deg,
      rgba(25, 118, 210, 0.08) 0%,
      rgba(156, 39, 176, 0.08) 100%
    );
  }
}

// Animations
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);

    @media (min-width: 768px) {
      transform: translateY(30px);
    }
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-card,
.contact-methods,
.help-card {
  animation: slideInUp 0.6s ease-out;
}

// Additional responsive utilities
@media (max-width: 599px) {
  .contact-page {
    padding: 0 12px;
  }
}

// Ensure proper stacking on mobile
@media (max-width: 1023px) {
  .content-grid {
    flex-direction: column;
  }

  .sidebar-section {
    order: 2;
  }

  .form-section {
    order: 1;
  }
}

// Fix potential overflow issues
* {
  box-sizing: border-box;
}

.v-container {
  overflow-x: hidden;
}

// Ensure grid items don't exceed container width
.content-grid > .v-col {
  max-width: 100%;
  flex-basis: auto;
}
</style>
