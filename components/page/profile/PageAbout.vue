<template>
  <div class="page-about-tab">
    <v-container>
      <template v-if="pending">
        <v-card v-for="i in 4" :key="`skel-${i}`" elevation="10" class="mb-4">
          <v-card-title>
            <v-skeleton-loader type="text" :width="120 + i * 30" />
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader type="paragraph" />
          </v-card-text>
        </v-card>
      </template>

      <template v-else-if="fetchError">
        <v-alert type="error" title="Error Loading Data" prominent class="mb-4">
          Could not load the page information. Please try refreshing. <br />
          <small>{{ fetchError.message }}</small>
        </v-alert>
      </template>

      <template v-else-if="aboutData">
        <v-card elevation="10" class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>About</span>
            <v-btn
              v-if="isPageCreator"
              icon="mdi-pencil"
              variant="text"
              @click="dialogs.description = true"
              aria-label="Edit Description"
            />
          </v-card-title>
          <v-card-text>
            <p class="text-body-1" v-if="aboutData.basic_info.description">
              {{ aboutData.basic_info.description }}
            </p>
            <p v-else class="text-grey">
              No description available.
              <template v-if="isPageCreator">
                Click the pencil icon to add one.</template
              >
            </p>
          </v-card-text>
        </v-card>

        <v-card elevation="10" class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon start class="mr-2">mdi-map-marker</v-icon>
              <span>Location</span>
            </div>
            <v-btn
              v-if="isPageCreator"
              icon="mdi-pencil"
              variant="text"
              @click="dialogs.location = true"
              aria-label="Edit Location"
            />
          </v-card-title>
          <v-card-text>
            <div v-if="aboutData.location" class="text-body-1">
              <p>{{ formatLocation(aboutData.location) }}</p>
            </div>
            <p v-else class="text-grey">
              No location information available.
              <template v-if="isPageCreator">
                Click the pencil icon to add one.</template
              >
            </p>
          </v-card-text>
        </v-card>

        <v-card
          elevation="10"
          class="mb-4"
          v-if="aboutData.investment_settings"
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon start class="mr-2">mdi-cash</v-icon>
              <span>Maximum Project Budget</span>
            </div>
            <v-btn
              v-if="isPageCreator"
              icon="mdi-pencil"
              variant="text"
              @click="dialogs.investment = true"
              aria-label="Edit Investment Settings"
            />
          </v-card-title>
          <v-card-text>
            <div class="text-body-1">
              This investor can fund projects with budgets up to
              <strong>{{
                formatInvestmentAmount(aboutData.investment_settings)
              }}</strong
              >.
            </div>
          </v-card-text>
        </v-card>
        <v-card elevation="10" class="mb-4" v-else>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon start class="mr-2">mdi-cash</v-icon>
              <span>Maximum Project Budget</span>
            </div>
            <v-btn
              v-if="isPageCreator"
              icon="mdi-pencil"
              variant="text"
              @click="dialogs.investment = true"
              aria-label="Edit Investment Settings"
            />
          </v-card-title>
          <v-card-text>
            <p class="text-grey">
              Investment settings not configured.
              <template v-if="isPageCreator">
                Click the pencil icon to set them up.</template
              >
            </p>
          </v-card-text>
        </v-card>

        <v-card elevation="10" class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon start class="mr-2">mdi-card-account-phone</v-icon>
              <span>Contact Information</span>
            </div>
            <v-btn
              v-if="isPageCreator"
              icon="mdi-pencil"
              variant="text"
              @click="dialogs.contacts = true"
              aria-label="Edit Contact Information"
            />
          </v-card-title>
          <v-card-text>
            <template v-if="aboutData.contacts">
              <v-list v-if="hasBasicContacts" lines="one" class="pa-0">
                <LinkItem
                  v-for="(item, index) in basicLinks"
                  :key="`basic-${index}-${item.label}`"
                  v-bind="item"
                />
              </v-list>
              <p v-else class="text-grey">No contact information provided.</p>
            </template>
            <p v-else class="text-grey">
              No contact information available.
              <template v-if="isPageCreator">
                Click the pencil icon to add it.</template
              >
            </p>
          </v-card-text>
        </v-card>

        <EditDescriptionDialog
          v-model="dialogs.description"
          :description="aboutData.basic_info.description ?? ''"
          :errors="validationErrors"
          @save="saveChanges(Section.Description, $event)"
          @close="closeDialog(Section.Description)"
        />

        <!-- <EditTalentInterestsDialog
          v-model="dialogs.talentInterests"
          :talent-interests="aboutData.talent_interests || []"
          :errors="validationErrors"
          @save="saveChanges(Section.TalentInterests, $event)"
          @close="closeDialog(Section.TalentInterests)"
        /> -->

        <EditLocationDialog
          v-model="dialogs.location"
          :location="aboutData.location ?? fallbackLocation"
          :errors="validationErrors"
          @save="saveChanges(Section.Location, $event)"
          @close="closeDialog(Section.Location)"
        />

        <EditInvestmentDialog
          v-model="dialogs.investment"
          :settings="aboutData.investment_settings ?? fallbackInvestment"
          :errors="validationErrors"
          @save="saveChanges(Section.Investment, $event)"
          @close="closeDialog(Section.Investment)"
        />

        <EditContactsDialog
          v-model="dialogs.contacts"
          :contacts="aboutData.contacts ?? fallbackContacts"
          :errors="validationErrors"
          @save="saveChanges(Section.Contacts, $event)"
          @close="closeDialog(Section.Contacts)"
        />
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
/* ==================================================================== */
/* Imports                                                              */
/* ==================================================================== */
import { ref, computed, reactive, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { usePageAuthStore } from '~/stores/page/pageAuthStore'
import { useAuthStore } from '~/stores/auth'

/* ==================================================================== */
/* Types                                                                */
/* ==================================================================== */
interface Currency {
  id: number
  name: string
  code: string
  symbol: string
}

interface BasicInfo {
  id: number
  name: string
  description: string | null
  type: string
  category: string | null
  subcategory: string | null
  country: string | null
  is_verified: boolean
  verified_at: string | null
}

interface TalentInterest {
  id: number
  name: string
}

interface Location {
  id?: number
  page_id: number
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  created_at?: string // Optional timestamps from API
  updated_at?: string
}

interface InvestmentSettings {
  id?: number
  page_id: number
  max_investment_amount: string | number // API sends string
  currency_id: number
  currency?: Currency
  created_at?: string
  updated_at?: string
}

interface Contact {
  id?: number
  page_id: number
  whatsapp_number: string | null
  phone_number: string | null
  email: string | null
  website_url: string | null
  telegram: string | null
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  created_at?: string
  updated_at?: string
}

// Type for the data structure returned by the /about API endpoint
interface AboutData {
  basic_info: BasicInfo
  location: Location | null
  investment_settings: InvestmentSettings | null
  contacts: Contact | null
  talent_interests: TalentInterest[]
}

// Type for the structure of validation errors from the API
interface ValidationErrors {
  [key: string]: string[] // e.g., { email: ["The email must be a valid email address."] }
}

// Type for the successful API response wrapper
interface ApiSuccessResponse<T> {
  success: true
  data: T
}

// Type for the failed API response wrapper (can include errors or just a message)
interface ApiErrorResponse {
  success: false
  message: string
  errors?: ValidationErrors
}

// Union type for the API response
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Type for the payload emitted by EditInvestmentDialog
interface InvestmentSettingsPayload {
  max_investment_amount: string
}

// Type for the payload emitted by EditDescriptionDialog
type DescriptionPayload = string

// Type for the payload emitted by EditLocationDialog
type LocationPayload = Omit<
  Location,
  'id' | 'page_id' | 'created_at' | 'updated_at'
> // Send only editable fields

// Type for the payload emitted by EditContactsDialog
type ContactsPayload = Omit<
  Contact,
  'id' | 'page_id' | 'created_at' | 'updated_at'
> // Send only editable fields

type TalentInterestsPayload = TalentInterest[]
// Type for the payload passed to saveChanges function
type SectionPayload =
  | DescriptionPayload
  | LocationPayload
  | InvestmentSettingsPayload
  | ContactsPayload
  | TalentInterestsPayload

/* ==================================================================== */
/* Enum for section names                                               */
/* ==================================================================== */
const enum Section {
  Description = 'description',
  Location = 'location',
  Investment = 'investment',
  Contacts = 'contacts',
  TalentInterests = 'talent-interests', // Add new section
}

/* ==================================================================== */
/* Stores & utilities                                                   */
/* ==================================================================== */
const { $axios } = useNuxtApp()
const route = useRoute()
const snackStore = useSnackMessageStore()
const { currencyFormatter } = useCurrencyFormatter() // For display
const pageAuthStore = usePageAuthStore() // Import pageAuthStore
const authStore = useAuthStore() // Import authStore for current user

/* ==================================================================== */
/* Async data fetching                                                  */
/* ==================================================================== */
const pageSlug = computed(() => route.params.pageSlug as string) // Ensure slug is a string

// Fetch page data for permission check
const ensurePageData = async () => {
  if (!pageAuthStore.page && pageSlug.value) {
    try {
      await pageAuthStore.fetchPageData(pageSlug.value)
    } catch (err) {
      console.error('Failed to fetch page data for permission check:', err)
    }
  }
}

// Run once to ensure we have page data
ensurePageData()

// Ensure we always have the latest user data for permission check
const ensureUserData = async () => {
  if (!authStore.user?.value) {
    try {
      await authStore.fetchUser()
    } catch (err) {
      console.error('Failed to fetch user data for permission check:', err)
    }
  }
}

// Run once to ensure we have user data
ensureUserData()

const {
  data: aboutData,
  pending,
  error: fetchError,
  refresh,
} = await useAsyncData<AboutData>(
  `about-${pageSlug.value}`, // Unique key per page slug
  async () => {
    if (!pageSlug.value) {
      throw new Error('Page slug is missing.')
    }
    try {
      const response = await $axios.get<ApiResponse<AboutData>>(
        `/api/pages/${pageSlug.value}/about`
      )
      if (!response.data.success) {
        // Throw error with message from API if available
        throw new Error(
          (response.data as ApiErrorResponse).message ||
            'Failed to fetch about data'
        )
      }
      return (response.data as ApiSuccessResponse<AboutData>).data
    } catch (err: any) {
      console.error('Error fetching about data:', err)
      // Rethrow a standard error object for useAsyncData
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Network error fetching about data'
      )
    }
  },
  {
    watch: [pageSlug], // Re-run fetcher if pageSlug changes
  }
)

// Optional: Show snackbar message if fetching fails
watch(fetchError, (newError) => {
  if (newError) {
    snackStore.error(`Failed to load page data: ${newError.message}`)
  }
})

/* ==================================================================== */
/* Permissions check                                                    */
/* ==================================================================== */
const isPageCreator = computed(() => {
  // Check if current user is the page creator
  const currentUser = authStore.user?.value
  const page = pageAuthStore.page

  if (!currentUser || !page || !page.creator) {
    return false
  }

  return currentUser.id === page.creator.id
})

/* ==================================================================== */
/* Reactive state                                                       */
/* ==================================================================== */
const dialogs = reactive<Record<Section, boolean>>({
  [Section.Description]: false,
  [Section.Location]: false,
  [Section.Investment]: false,
  [Section.Contacts]: false,
  [Section.TalentInterests]: false, // Add new dialog state
})

const validationErrors = ref<ValidationErrors>({})

/* ==================================================================== */
/* Fallback objects                                                     */
/* ==================================================================== */
// Use computed for fallbacks that depend on potentially changing route params
const currentPageId = computed(() =>
  Number(route.params.id || aboutData.value?.basic_info?.id || 0)
)

const fallbackLocation = computed(
  (): Location => ({
    page_id: currentPageId.value,
    address: '',
    city: '',
    state: '',
    country: '',
    latitude: null,
    longitude: null,
  })
)

// Updated fallback Investment (needs a default currency_id)
const fallbackInvestment = computed(
  (): InvestmentSettings => ({
    page_id: currentPageId.value,
    max_investment_amount: '0',
    currency_id: 1, // IMPORTANT: Adjust this to a valid default currency ID in your system
  })
)

const fallbackContacts = computed(
  (): Contact => ({
    page_id: currentPageId.value,
    whatsapp_number: null,
    phone_number: null,
    email: null,
    website_url: null,
    telegram: null,
    facebook_url: null,
    instagram_url: null,
    linkedin_url: null,
    twitter_url: null,
  })
)

/* ==================================================================== */
/* Computed helpers                                                     */
/* ==================================================================== */
const hasData = computed(
  () => !pending.value && !fetchError.value && !!aboutData.value
)

// Robust checks for contacts existence
const hasBasicContacts = computed(() => {
  const c = aboutData.value?.contacts
  return (
    c &&
    [
      'email',
      'phone_number',
      'whatsapp_number',
      'telegram',
      'website_url',
    ].some((k) => !!c[k as keyof Contact])
  )
})

// Link generation computed properties
const basicLinks = computed(() => {
  const c = aboutData.value?.contacts
  if (!c) return []
  const links: { icon: string; label: string | null; href: string | null }[] = [
    {
      icon: 'mdi-email',
      label: c.email,
      href: c.email ? `mailto:${c.email}` : null,
    },
    {
      icon: 'mdi-phone',
      label: c.phone_number,
      href: c.phone_number ? `tel:${c.phone_number}` : null,
    },
    {
      icon: 'mdi-whatsapp',
      label: c.whatsapp_number,
      href: c.whatsapp_number
        ? `https://wa.me/${c.whatsapp_number.replace(/[^0-9+]/g, '')}`
        : null,
    },
    {
      icon: 'mdi-telegram',
      label: c.telegram,
      href: c.telegram ? `https://t.me/${c.telegram.replace(/^@/, '')}` : null,
    },
    { icon: 'mdi-web', label: c.website_url, href: c.website_url },
  ]
  return links.filter((i) => i.label) // Show if label exists
})

/* ==================================================================== */
/* Formatting helpers                                                   */
/* ==================================================================== */
const formatLocation = (loc: Location | null): string => {
  if (!loc) return 'N/A'

  // Handle country object or string
  let countryName = ''
  if (loc.country) {
    if (typeof loc.country === 'object') {
      countryName = loc.country.name || ''
    } else {
      countryName = loc.country
    }
  }

  // Return only one formatted string with address and country
  if (loc.address && countryName) {
    return `${loc.address}, ${countryName}`
  } else if (loc.address) {
    return loc.address
  } else if (countryName) {
    return countryName
  } else {
    return 'N/A'
  }
}

const formatInvestmentAmount = (s: InvestmentSettings | null): string => {
  if (!s) return 'N/A'
  const currencySymbol = s.currency?.symbol ?? s.currency?.code ?? ''
  const amt = parseFloat(String(s.max_investment_amount) || '0')
  if (isNaN(amt)) return 'N/A'
  // Use the imported formatter
  return currencyFormatter(amt, currencySymbol, s.currency?.code)
}
/* ==================================================================== */
/* Dialog Close Handler                                                 */
/* ==================================================================== */
const closeDialog = (section: Section): void => {
  dialogs[section] = false
  // Clear validation errors when a dialog is explicitly closed
  // This prevents old errors from showing up if the dialog is reopened
  validationErrors.value = {}
}

/* ==================================================================== */
/* Save Changes Handler                                                 */
/* ==================================================================== */
const saveChanges = async (
  section: Section,
  payload: SectionPayload
): Promise<void> => {
  if (!aboutData.value) {
    snackStore.error('Cannot save changes: data not loaded.')
    return
  }

  // Permission check before saving
  if (!isPageCreator.value) {
    snackStore.error('You do not have permission to edit this page.')
    closeDialog(section)
    return
  }

  // Store the original data for potential revert (deep copy)
  let originalDataSnapshot: AboutData | null = null
  try {
    originalDataSnapshot = JSON.parse(JSON.stringify(aboutData.value))
  } catch (e) {
    console.error('Failed to clone original data:', e)
    // Proceed without revert capability if cloning fails
  }

  // --- Prepare Payload & Apply Optimistic Update ---
  let apiPayload: Record<string, any>
  let optimisticPayload: any = payload // Use the received payload for optimistic update by default

  if (section === Section.Description) {
    if (typeof payload !== 'string') {
      snackStore.error('Invalid data format for description.')
      return
    }
    apiPayload = { description: payload }
    // optimisticPayload remains the string itself
  } else if (section === Section.TalentInterests) {
    // Handle talent interests specially
    if (!Array.isArray(payload)) {
      snackStore.error('Invalid data format for talent interests.')
      return
    }
    // Extract IDs for the API payload
    apiPayload = {
      talent_interest_ids: (payload as TalentInterest[]).map((item) => item.id),
    }
    optimisticPayload = payload // Keep the full objects for optimistic update
  } else if (typeof payload === 'object' && payload !== null) {
    apiPayload = payload
    // optimisticPayload remains the object
  } else {
    console.error(`Invalid payload type for section ${section}:`, payload)
    snackStore.error(`Invalid data format for ${section}.`)
    return
  }

  // Apply optimistic update
  applyLocalPatch(section, optimisticPayload)
  // Clear previous errors before trying to save
  validationErrors.value = {}
  // Close dialog immediately for better UX
  dialogs[section] = false

  try {
    // Perform API request
    const response = await $axios.put<ApiResponse<any>>(
      `/api/pages/${pageSlug.value}/about/${section}`,
      apiPayload
    )

    if (!response.data.success) {
      // Handle API error response even if request succeeded (status 2xx)
      throw { response: { data: response.data } } // Mimic Axios error structure
    }

    snackStore.success(
      `${
        section.charAt(0).toUpperCase() + section.slice(1)
      } updated successfully`
    )
    validationErrors.value = {} // Clear errors on success

    // Refresh data in the background to ensure consistency with server
    await nextTick() // Ensure optimistic update has rendered if needed
    await refresh() // Use { dedupe: true } if needed
  } catch (err: any) {
    console.error(`Error saving ${section}:`, err.response?.data || err)
    const errorsFromServer = err?.response?.data?.errors as
      | ValidationErrors
      | undefined
    const errorMessage =
      err?.response?.data?.message || `Failed to update ${section}`

    snackStore.error(errorMessage)

    // Revert optimistic update by restoring snapshot if available
    if (originalDataSnapshot && aboutData.value) {
      // Restore the relevant part based on section
      switch (section) {
        case Section.Description:
          aboutData.value.basic_info = originalDataSnapshot.basic_info
          break
        case Section.Location:
          aboutData.value.location = originalDataSnapshot.location
          break
        case Section.Investment:
          aboutData.value.investment_settings =
            originalDataSnapshot.investment_settings
          break
        case Section.Contacts:
          aboutData.value.contacts = originalDataSnapshot.contacts
          break
        case Section.TalentInterests:
          aboutData.value.talent_interests =
            originalDataSnapshot.talent_interests
          break
      }
    } else {
      // Fallback: Refresh data from server if revert isn't possible
      await refresh()
    }

    if (
      errorsFromServer &&
      typeof errorsFromServer === 'object' &&
      Object.keys(errorsFromServer).length > 0
    ) {
      validationErrors.value = errorsFromServer
      // Reopen the dialog to show validation errors
      dialogs[section] = true
    } else {
      // Keep dialog closed for non-validation errors
      dialogs[section] = false
    }
  }
}

/* ==================================================================== */
/* Apply Local Patch (Optimistic Update)                                */
/* ==================================================================== */
function applyLocalPatch(section: Section, payload: any): void {
  if (!aboutData.value) return

  switch (section) {
    case Section.Description:
      if (aboutData.value.basic_info && typeof payload === 'string') {
        aboutData.value.basic_info.description = payload
      }
      break
    case Section.Location:
      const locPayload = payload as LocationPayload
      if (!aboutData.value.location) {
        // Create if null
        aboutData.value.location = { ...fallbackLocation.value, ...locPayload }
      } else {
        // Update existing
        Object.assign(aboutData.value.location, locPayload)
      }
      break
    case Section.Investment:
      const invPayload = payload as InvestmentSettingsPayload
      if (!aboutData.value.investment_settings) {
        // Create if null
        aboutData.value.investment_settings = {
          ...fallbackInvestment.value,
          max_investment_amount: invPayload.max_investment_amount,
        }
      } else {
        // Update existing
        aboutData.value.investment_settings.max_investment_amount =
          invPayload.max_investment_amount
      }
      break
    case Section.Contacts:
      const conPayload = payload as ContactsPayload
      if (!aboutData.value.contacts) {
        // Create if null
        aboutData.value.contacts = { ...fallbackContacts.value, ...conPayload }
      } else {
        // Update existing
        Object.assign(aboutData.value.contacts, conPayload)
      }
      break
    case Section.TalentInterests:
      // Replace entire array for talent interests
      if (Array.isArray(payload)) {
        aboutData.value.talent_interests = [...payload]
      }
      break
  }
}
</script>

<style scoped>
.page-about-tab {
  padding: 20px 0;
}

/* Ensure links within list items behave correctly */
.v-list-item a {
  text-decoration: none;
  color: inherit;
}
.v-list-item a:hover {
  text-decoration: underline;
}

/* Adjust default Vuetify list/item padding if needed */
.v-list.pa-0 {
  padding: 0 !important;
}
.v-list-item {
  padding-left: 0 !important;
  padding-right: 0 !important;
  min-height: 40px; /* Consistent item height */
}
.v-list-item-title {
  line-height: 1.4;
  white-space: normal; /* Allow wrapping */
  word-break: break-word; /* Break long links/emails */
}

.v-card-title,
.v-card-text {
  padding: 16px;
}

.text-grey {
  color: #757575; /* Or use Vuetify theme color */
}
</style>
