<template>
  <v-form v-model="isValid" @submit.prevent>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="form.name"
            label="Investor Page Name"
            :rules="[(v) => !!v || 'Name is required']"
            required
            hint="Enter a name for your investor profile"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="form.description"
            label="About You as an Investor"
            :rules="[(v) => !!v || 'Description is required']"
            required
            auto-grow
            rows="4"
            hint="Describe your investment interests and experience"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { usePageRegistrationStore } from '~/stores/usePageRegistration'

const store = usePageRegistrationStore()
const isValid = ref(false)

const form = reactive({
  name: store.basicInfo.name || '',
  description: store.basicInfo.description || '',
  page_category_slug: 'investor', // Hardcoded to investor
})

// Watch for form changes and update the store
watch(
  form,
  (newValue) => {
    store.basicInfo = {
      ...store.basicInfo,
      ...newValue,
    }
  },
  { deep: true }
)

defineExpose({ isValid })
</script>

<style scoped>
.v-row {
  margin-bottom: 16px;
}
</style>