<template>
  <v-card class="investor-card" elevation="2">
    <!-- Clickable Image -->
    <v-img
      :src="page.avatar_url"
      :height="imgHeight"
      cover
      class="cursor-pointer"
      @click="navigateToProfile"
    >
      <template #placeholder>
        <v-skeleton-loader type="image" />
      </template>
    </v-img>
    
    <div class="card-content">
      <div class="d-flex align-center justify-space-between">
        <div class="text-truncate font-weight-bold" :class="titleClass">{{ page.name }}</div>
        <v-icon
          v-if="page.is_verified"
          color="primary"
          icon="mdi-check-decagram"
          :size="smAndDown ? 'x-small' : 'small'"
        />
      </div>

      <!-- Country Location with icon -->
      <div class="d-flex align-center my-1">
        <v-icon icon="mdi-map-marker" :size="smAndDown ? 'x-small' : 'small'" color="grey" class="me-1" />
        <span :class="subtitleClass" class="text-medium-emphasis">{{ page.country }}</span>
      </div>

      <!-- Maximum Investment Amount section -->
      <div class="mt-2">
        <div class="text-caption text-medium-emphasis">Max Project Budget</div>
        <div :class="amountClass" class="font-weight-bold primary--text">
          {{ page.investment_settings?.formatted_amount }}
        </div>
      </div>
    </div>

    <v-card-actions class="card-actions">
      <v-btn
        block
        color="primary"
        variant="tonal"
        :to="`/profile/${page.type}/${page.slug}`"
        class="text-none"
        :size="smAndDown ? 'x-small' : 'small'"
      >
        View Profile
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { computed } from 'vue'

const props = defineProps({
  page: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { smAndDown, width } = useDisplay()

// Computed properties for responsive design
const imgHeight = computed(() => {
  if (width.value < 400) return 120
  if (width.value < 600) return 140
  return 160
})

const titleClass = computed(() => {
  return smAndDown.value ? 'text-subtitle-2' : 'text-subtitle-1'
})

const subtitleClass = computed(() => {
  return smAndDown.value ? 'text-caption' : 'text-body-2'
})

const amountClass = computed(() => {
  return smAndDown.value ? 'text-subtitle-2' : 'text-subtitle-1'
})

// Methods
const navigateToProfile = () => {
  router.push(`/profile/${props.page.type}/${props.page.slug}`)
}
</script>

<style scoped>
.investor-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.investor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.card-content {
  padding: 12px 16px 8px;
  flex-grow: 1;
}

.card-actions {
  padding: 8px 16px 16px;
}

@media (max-width: 600px) {
  .investor-card {
    border-radius: 8px;
  }
  
  .card-content {
    padding: 8px 12px 4px;
  }
  
  .card-actions {
    padding: 8px 12px 12px;
  }
}
</style>