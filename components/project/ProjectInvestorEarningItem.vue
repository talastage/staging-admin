<template>
  <!-- Grid View -->
  <BaseCard
    v-if="viewType === 'grid'"
    class="project-investor-item"
    :elevation="2"
    hover
  >
    <!-- Investor Header -->
    <div class="investor-header">
      <div class="avatar-container">
        <user-avatar
          v-if="isUser"
          :username="investorUsername"
          :profile_photo="investorPhoto"
          size="md"
        />
        <page-avatar
          v-else-if="investor.investor"
          :page="investor.investor"
          :default-image="defaultPageImage"
          size="md"
        />
        <v-avatar v-else size="40" :image="defaultUserImage"></v-avatar>
      </div>
      <div class="investor-info">
        <div class="text-subtitle-1 font-weight-medium text-truncate">
          {{ displayName }}
        </div>
        <v-chip
          :color="investor.type === 'creator' ? 'primary' : 'secondary'"
          density="compact"
          size="x-small"
          class="mt-1"
        >
          {{ investor.type }}
        </v-chip>
      </div>
    </div>

    <!-- Earnings Details -->
    <div class="earnings-details">
      <div class="detail-row">
        <div class="detail-icon">
          <v-icon size="small">mdi-percent</v-icon>
        </div>
        <div class="detail-content">
          <div class="detail-label">Share</div>
          <div class="detail-value">{{ investor.share_percentage }}%</div>
        </div>
      </div>

      <div class="detail-row">
        <div class="detail-icon">
          <v-icon size="small">mdi-cash</v-icon>
        </div>
        <div class="detail-content">
          <div class="detail-label">Gross</div>
          <div class="detail-value">{{ formattedGrossAmount }}</div>
        </div>
      </div>

      <div class="detail-row">
        <div class="detail-icon">
          <v-icon size="small">mdi-cash-check</v-icon>
        </div>
        <div class="detail-content">
          <div class="detail-label">Net</div>
          <div class="detail-value">{{ formattedNetAmount }}</div>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <!-- <base-button
      title="View Details"
      :action="navigateToDetails"
      prepend-icon="mdi-information"
      variant="tonal"
      density="comfortable"
      size="small"
      class="details-btn"
      full-width
    /> -->
  </BaseCard>

  <!-- List View -->
  <v-list-item
    v-else
    class="project-investor-item-list"
    rounded
    variant="elevated"
    :elevation="1"
    :active="false"
    @click="navigateToDetails"
  >
    <template #prepend>
      <user-avatar
        v-if="isUser"
        :username="investorUsername"
        :profile_photo="investorPhoto"
        size="sm"
      />
      <page-avatar
        v-else-if="investor.investor"
        :page="investor.investor"
        :default-image="defaultPageImage"
        size="sm"
      />
      <v-avatar v-else size="32" :image="defaultUserImage"></v-avatar>
    </template>

    <v-list-item-title class="font-weight-medium text-truncate">
      {{ displayName }}
    </v-list-item-title>

    <v-list-item-subtitle class="compact-info">
      <v-icon size="x-small" class="mr-1">mdi-percent</v-icon>
      {{ investor.share_percentage }}% |
      <v-icon size="x-small" class="mr-1 ml-1">mdi-cash-check</v-icon>
      {{ formattedNetAmount }}
    </v-list-item-subtitle>

    <template #append>
      <v-icon size="small" color="primary">mdi-chevron-right</v-icon>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'

interface EarningsCurrency {
  code: string
  symbol: string
}

interface Earnings {
  total_gross_amount: number
  total_net_amount: number
  currency: EarningsCurrency
}

interface InvestorData {
  id: number
  investor_type: { is_user: boolean }
  investor: {
    username?: string
    profile_photo?: string
    display_name?: string
    name?: string
  } | null
  share_percentage: number
  earnings: Earnings
  type: 'creator' | 'investor'
}

const props = defineProps<{
  investor: InvestorData
  accessUuid: string
  viewType: 'grid' | 'list'
}>()

const router = useRouter()

// Default images for avatars
const defaultUserImage = ref('/images/default-user-avatar.png')
const defaultPageImage = ref('/images/default-page-avatar.png')

// Memoized computed properties for better performance
const isUser = computed(() => props.investor.investor_type?.is_user)

const displayName = computed(() => {
  if (isUser.value) {
    return props.investor.investor?.display_name || 'Unnamed User'
  } else {
    return props.investor.investor?.name || 'Unnamed Page'
  }
})

const investorUsername = computed(() => props.investor.investor?.username || '')

const investorPhoto = computed(
  () => props.investor.investor?.profile_photo || defaultUserImage.value
)

const hasValidInvestor = computed(
  () => props.investor.investor && props.investor.investor.id
)

const formattedGrossAmount = computed(() =>
  formatCurrency(props.investor.earnings.total_gross_amount)
)

const formattedNetAmount = computed(() =>
  formatCurrency(props.investor.earnings.total_net_amount)
)

function formatCurrency(amount: number): string {
  if (!props.investor?.earnings?.currency) {
    return `${amount.toFixed(2)}`
  }

  const { code, symbol } = props.investor.earnings.currency

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code || 'USD',
      currencyDisplay: 'symbol',
    }).format(amount)
  } catch (error) {
    // Fallback for invalid currency codes
    return `${symbol || '$'}${amount.toFixed(2)}`
  }
}

function navigateToDetails(event?: Event): void {
  if (event) event.preventDefault()

  if (!hasValidInvestor.value) {
    console.warn('Cannot navigate: Invalid investor data')
    return
  }

  router.push(
    `/investments/earnings/projects/${props.accessUuid}/investor-details-${props.investor.investor.id}`
  )
}
</script>

<style scoped>
.project-investor-item {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.project-investor-item:hover {
  transform: translateY(-2px);
}

.investor-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar-container {
  margin-right: 10px;
}

.investor-info {
  flex: 1;
  min-width: 0; /* For text-truncate to work properly */
}

.earnings-details {
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  width: 24px;
}

.detail-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.detail-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.detail-value {
  font-weight: 500;
  font-size: 0.875rem;
}

.details-btn {
  margin-top: auto;
}

/* List view styles */
.project-investor-item-list {
  height: auto;
  padding: 8px 16px;
  margin-bottom: 8px;
}

.compact-info {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

/* Add proper spacing between avatar and text in list view */
:deep(.v-list-item__prepend) {
  margin-right: 12px !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
