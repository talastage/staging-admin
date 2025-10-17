<template>
  <div class="demo-page">
    <!-- Demo Header -->
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="pa-6 mb-6" elevation="2">
            <div class="text-center">
              <v-icon size="64" color="primary" class="mb-4"
                >mdi-account-star</v-icon
              >
              <h1 class="text-h4 mb-2">Talent Registration Demo</h1>
              <p class="text-body-1 text-medium-emphasis mb-4">
                Test the integrated TalentRegisterDialog component with
                different modes and scenarios
              </p>

              <!-- Demo Controls -->
              <div class="demo-controls mb-4">
                <v-btn-toggle v-model="selectedMode" color="primary" mandatory>
                  <v-btn value="create" size="large">
                    <v-icon>mdi-plus</v-icon>
                    Create Mode
                  </v-btn>
                  <v-btn value="update" size="large">
                    <v-icon>mdi-pencil</v-icon>
                    Update Mode
                  </v-btn>
                </v-btn-toggle>
              </div>

              <!-- User State Toggle (for testing) -->
              <div class="mb-4">
                <v-switch
                  v-model="hasExistingTalent"
                  label="Simulate user with existing talent"
                  color="primary"
                  hide-details
                ></v-switch>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <v-btn
                  color="primary"
                  size="large"
                  @click="openDialog"
                  :prepend-icon="
                    selectedMode === 'create' ? 'mdi-plus' : 'mdi-pencil'
                  "
                >
                  {{
                    selectedMode === 'create'
                      ? 'Register New Talent'
                      : 'Update Talent'
                  }}
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Demo Status Card -->
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="pa-4" elevation="1">
            <h3 class="text-h6 mb-3">Demo Status</h3>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="status-item">
                  <strong>Current Mode:</strong>
                  <v-chip
                    :color="selectedMode === 'create' ? 'success' : 'info'"
                    class="ml-2"
                  >
                    {{ selectedMode.toUpperCase() }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="status-item">
                  <strong>Dialog Open:</strong>
                  <v-chip
                    :color="showDialog ? 'success' : 'default'"
                    class="ml-2"
                  >
                    {{ showDialog ? 'Yes' : 'No' }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="status-item">
                  <strong>Has Existing Talent:</strong>
                  <v-chip
                    :color="hasExistingTalent ? 'warning' : 'default'"
                    class="ml-2"
                  >
                    {{ hasExistingTalent ? 'Yes' : 'No' }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="status-item">
                  <strong>Event Count:</strong>
                  <v-chip color="primary" class="ml-2">
                    {{ eventCount }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Events Log -->
      <v-row justify="center" v-if="events.length > 0">
        <v-col cols="12" md="8">
          <v-card class="pa-4" elevation="1">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6">Events Log</h3>
              <v-btn size="small" variant="text" @click="clearEvents">
                Clear Log
              </v-btn>
            </div>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="(event, index) in events"
                :key="index"
                :dot-color="
                  event.type === 'success'
                    ? 'success'
                    : event.type === 'error'
                    ? 'error'
                    : 'info'
                "
                size="small"
              >
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <strong>{{ event.title }}</strong>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ event.description }}
                    </div>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ event.timestamp }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card>
        </v-col>
      </v-row>

      <!-- Mock Data Display (for reference) -->
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon>mdi-code-json</v-icon>
                Mock Data Reference
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="mb-3">
                  <h4>Current User State:</h4>
                  <pre class="text-caption">{{
                    JSON.stringify(currentUser, null, 2)
                  }}</pre>
                </div>
                <div class="mb-3">
                  <h4>Sample Popular Talents:</h4>
                  <pre class="text-caption">{{
                    JSON.stringify(samplePopularTalents, null, 2)
                  }}</pre>
                </div>
                <div>
                  <h4>Sample Categories:</h4>
                  <pre class="text-caption">{{
                    JSON.stringify(sampleCategories, null, 2)
                  }}</pre>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-container>

    <!-- The TalentRegisterDialog Component -->
    <TalentRegisterDialog
      v-model="showDialog"
      :mode="selectedMode"
      @talent-updated="handleTalentUpdated"
    />

    <!-- Demo Snackbars for feedback -->
    <v-snackbar
      v-model="showFeedback"
      :color="feedbackColor"
      timeout="3000"
      location="bottom right"
    >
      {{ feedbackMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Demo state
const selectedMode = ref<'create' | 'update'>('create')
const showDialog = ref(false)
const hasExistingTalent = ref(false)
const eventCount = ref(0)
const events = ref<
  Array<{
    title: string
    description: string
    timestamp: string
    type: 'info' | 'success' | 'error'
  }>
>([])

// Feedback state
const showFeedback = ref(false)
const feedbackMessage = ref('')
const feedbackColor = ref('success')

// Mock user data
const currentUser = computed(() => {
  if (hasExistingTalent.value) {
    return {
      id: 1,
      name: 'John Demo User',
      email: 'demo@example.com',
      has_talent: 'yes',
      talent: 'Web Development',
      talent_details: {
        category: 'Technology',
        talent: 'Web Development',
        talent_id: 101,
        category_id: 1,
      },
    }
  } else {
    return {
      id: 1,
      name: 'John Demo User',
      email: 'demo@example.com',
      has_talent: 'no',
      talent: null,
      talent_details: null,
    }
  }
})

// Sample data for reference
const samplePopularTalents = [
  {
    id: 101,
    name: 'Web Development',
    category_id: 1,
    category: { id: 1, name: 'Technology', slug: 'technology' },
  },
  {
    id: 102,
    name: 'Mobile App Development',
    category_id: 1,
    category: { id: 1, name: 'Technology', slug: 'technology' },
  },
  {
    id: 201,
    name: 'Graphic Design',
    category_id: 2,
    category: { id: 2, name: 'Design', slug: 'design' },
  },
  {
    id: 202,
    name: 'UI/UX Design',
    category_id: 2,
    category: { id: 2, name: 'Design', slug: 'design' },
  },
  {
    id: 301,
    name: 'Content Writing',
    category_id: 3,
    category: { id: 3, name: 'Writing', slug: 'writing' },
  },
  {
    id: 302,
    name: 'Copy Writing',
    category_id: 3,
    category: { id: 3, name: 'Writing', slug: 'writing' },
  },
  {
    id: 401,
    name: 'Digital Marketing',
    category_id: 4,
    category: { id: 4, name: 'Marketing', slug: 'marketing' },
  },
  {
    id: 402,
    name: 'Social Media Management',
    category_id: 4,
    category: { id: 4, name: 'Marketing', slug: 'marketing' },
  },
]

const sampleCategories = [
  { id: 1, name: 'Technology', slug: 'technology', avatar_url: null },
  { id: 2, name: 'Design', slug: 'design', avatar_url: null },
  { id: 3, name: 'Writing & Content', slug: 'writing', avatar_url: null },
  { id: 4, name: 'Marketing', slug: 'marketing', avatar_url: null },
  { id: 5, name: 'Business', slug: 'business', avatar_url: null },
]

// Methods
const openDialog = () => {
  showDialog.value = true
  addEvent(
    'Dialog Opened',
    `Opened dialog in ${selectedMode.value} mode`,
    'info'
  )
}

const handleTalentUpdated = (talent: any) => {
  addEvent(
    'Talent Updated',
    `Talent ${selectedMode.value === 'create' ? 'registered' : 'updated'}: ${
      talent?.name || 'Unknown'
    }`,
    'success'
  )

  showFeedbackMessage(
    `Talent ${
      selectedMode.value === 'create' ? 'registered' : 'updated'
    } successfully!`,
    'success'
  )
}

const addEvent = (
  title: string,
  description: string,
  type: 'info' | 'success' | 'error'
) => {
  const now = new Date()
  events.value.unshift({
    title,
    description,
    timestamp: now.toLocaleTimeString(),
    type,
  })
  eventCount.value++

  // Keep only last 10 events
  if (events.value.length > 10) {
    events.value = events.value.slice(0, 10)
  }
}

const clearEvents = () => {
  events.value = []
  eventCount.value = 0
  addEvent('Events Cleared', 'Event log has been cleared', 'info')
}

const showFeedbackMessage = (message: string, color: string) => {
  feedbackMessage.value = message
  feedbackColor.value = color
  showFeedback.value = true
}

// Watch for mode changes
watch(selectedMode, (newMode) => {
  addEvent('Mode Changed', `Switched to ${newMode} mode`, 'info')
})

watch(hasExistingTalent, (hasExisting) => {
  addEvent(
    'User State Changed',
    `User ${hasExisting ? 'now has' : 'no longer has'} existing talent`,
    'info'
  )
})

watch(showDialog, (isOpen) => {
  if (!isOpen) {
    addEvent('Dialog Closed', 'Dialog has been closed', 'info')
  }
})
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  padding: 24px 0;
}

.demo-controls {
  margin: 16px 0;
}

.action-buttons {
  margin-top: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

pre {
  background: rgb(var(--v-theme-surface-variant));
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.v-timeline {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}

:deep(.v-btn-toggle) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-btn-toggle .v-btn) {
  border-radius: 0;
}

:deep(.v-timeline-item) {
  padding-bottom: 16px;
}

.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-1px);
}
</style>
