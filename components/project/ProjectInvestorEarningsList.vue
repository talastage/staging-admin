<template>
  <div>
    <template v-if="investors.length === 0">
      <v-alert type="info" variant="tonal">
        No investors found for this project.
      </v-alert>
    </template>

    <v-row v-else-if="viewType === 'grid'" class="investor-grid">
      <v-col
        v-for="investor in investors"
        :key="investor.id"
        cols="12"
        sm="6"
        md="4"
        class="mb-4"
      >
        <project-investor-earning-item
          :investor="investor"
          :access-uuid="accessUuid"
          view-type="grid"
        />
      </v-col>
    </v-row>

    <v-list v-else class="investor-list pa-0">
      <project-investor-earning-item
        v-for="investor in investors"
        :key="investor.id"
        :investor="investor"
        :access-uuid="accessUuid"
        view-type="list"
      />
    </v-list>
  </div>
</template>

<script setup lang="ts">
// Well-defined type for the investor object
interface EarningsCurrency {
  code: string
  symbol: string
}

interface Earnings {
  total_gross_amount: number
  total_net_amount: number
  currency: EarningsCurrency
}

interface InvestorType {
  is_user: boolean
}

interface InvestorData {
  id: number
  investor_type: InvestorType
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

interface Props {
  investors: InvestorData[]
  accessUuid: string
  viewType: 'grid' | 'list'
}

defineProps<Props>()
</script>

<style scoped>
.investor-grid {
  margin-top: 8px;
}

.investor-list {
  background: transparent;
}
</style>
