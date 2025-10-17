<!-- components/payments/PaymentListSkeleton.vue -->
<template>
  <BaseCard class="mb-3 payment-skeleton">
    <v-card-text>
      <div class="skeleton-layout">
        <!-- Left section -->
        <div class="skeleton-content">
          <div class="d-flex align-center mb-3">
            <v-skeleton-loader type="avatar" size="24" class="mr-3" />
            <v-skeleton-loader type="text" width="120" class="amount-skeleton" />
            <v-skeleton-loader type="chip" width="80" class="ml-2 status-skeleton" />
          </div>
          
          <v-skeleton-loader type="text" width="180" class="mb-2" />
          <v-skeleton-loader type="text" width="140" />
        </div>
        
        <!-- Right section -->
        <div class="skeleton-preview">
          <v-skeleton-loader 
            :type="smAndDown ? 'avatar' : 'image'" 
            :width="smAndDown ? 40 : 120" 
            :height="smAndDown ? 40 : 68" 
            class="preview-skeleton" 
          />
          
          <v-skeleton-loader 
            v-if="!smAndDown" 
            type="text" 
            width="80" 
            class="mt-2 name-skeleton" 
          />
        </div>
      </div>
    </v-card-text>
  </BaseCard>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { mobile, smAndDown } = useDisplay()
</script>

<style scoped>
.skeleton-layout {
  display: flex;
  align-items: flex-start;
}

.skeleton-content {
  flex: 1;
  min-width: 0;
}

.skeleton-preview {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 600px) {
  .skeleton-layout {
    flex-direction: column;
  }
  
  .skeleton-preview {
    margin-left: 0;
    margin-top: 16px;
    flex-direction: row;
    align-items: center;
  }
  
  .name-skeleton {
    margin-left: 12px;
    margin-top: 0;
  }
  
  .status-skeleton {
    display: none;
  }
  
  .amount-skeleton {
    max-width: 100px;
  }
}
</style>