<template>
  <v-container>
    <UserProfileSettingsCard />

    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-model="localUserDetails.first_name"
        :rules="nameRules"
        label="First Name"
        required
        outlined
        color="primary"
      />
      <v-text-field
        v-model="localUserDetails.last_name"
        :rules="nameRules"
        label="Last Name"
        required
        outlined
        color="primary"
      />
      <v-text-field
        v-model="localUserDetails.display_name"
        :rules="displayNameRules"
        label="Display Name"
        required
        outlined
        color="primary"
      />
      <!-- <v-select
        v-model="localUserDetails.gender"
        :items="genders"
        label="Gender"
        required
        outlined
        color="primary"
      /> -->

      <!-- <v-row>
        <v-col cols="4">
          <v-select
            v-model="birthdayParts.month"
            :items="months"
            label="Month"
            required
            outlined
            color="primary"
            :loading="loading"
          />
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="birthdayParts.day"
            :items="days"
            label="Day"
            required
            outlined
            color="primary"
            :loading="loading"
          />
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="birthdayParts.year"
            :items="years"
            label="Year"
            required
            outlined
            color="primary"
            :loading="loading"
          />
        </v-col>
      </v-row> -->

      <v-row>
        <v-col>
          <v-btn
            color="primary"
            class="mr-3"
            @click="saveDetails"
            :disabled="!canSave || loading"
            flat
          >
            Save Changes
          </v-btn>
          <v-btn color="error" @click="resetForm" flat>Cancel</v-btn>
        </v-col>
      </v-row>

      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64" />
      </v-overlay>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useSnackMessageStore } from '@/stores/useSnackMessage'

const valid = ref(true)
const loading = ref(false)
const canSave = ref(false)

const userDetails = reactive({
  id: 0,
  first_name: '',
  last_name: '',
  display_name: '',
  birthday: '',
  gender: '',
  phone: '',
  username: '',
  profile_photo: '',
  last_username_change: '',
})

const localUserDetails = reactive({ ...userDetails })

// Date handling
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const days = Array.from({ length: 31 }, (_, i) => i + 1)
const years = Array.from(
  { length: 100 },
  (_, i) => new Date().getFullYear() - i
)

function getBirthdayParts(dateString: string) {
  const date = new Date(dateString)
  return {
    month: months[date.getMonth()],
    day: date.getDate(),
    year: date.getFullYear(),
  }
}

function setBirthdayString(year: number, month: string, day: number) {
  const monthIndex = months.indexOf(month)
  localUserDetails.birthday = `${year}-${monthIndex + 1}-${day}`
}

const defaultBirthday = new Date().toISOString()
const birthdayParts = reactive(getBirthdayParts(defaultBirthday))

// Validation rules
const nameRules = [(v: string) => !!v || 'Name is required']
const displayNameRules = [(v: string) => !!v || 'Display name is required']
const genders = ['Male', 'Female', 'Other', 'Prefer not to say']

const hasUnsavedChanges = computed(() => {
  return JSON.stringify(localUserDetails) !== JSON.stringify(userDetails)
})

watch(
  [hasUnsavedChanges, valid],
  () => {
    canSave.value = hasUnsavedChanges.value && valid.value
  },
  { immediate: true }
)

// Rebuild birthday whenever day/month/year changes
watch(
  () => birthdayParts.month,
  (newMonth) =>
    setBirthdayString(birthdayParts.year, newMonth, birthdayParts.day)
)
watch(
  () => birthdayParts.day,
  (newDay) => setBirthdayString(birthdayParts.year, birthdayParts.month, newDay)
)
watch(
  () => birthdayParts.year,
  (newYear) =>
    setBirthdayString(newYear, birthdayParts.month, birthdayParts.day)
)

const { $axios } = useNuxtApp()
const snackStore = useSnackMessageStore()

onMounted(async () => {
  loading.value = true
  try {
    await $axios.get('/sanctum/csrf-cookie', { withCredentials: true })
    const { data } = await $axios.get('/api/user/personal-details', {
      withCredentials: true,
    })

    if (data && data.personalDetails) {
      Object.assign(userDetails, data.personalDetails)
      Object.assign(localUserDetails, data.personalDetails)

      const userBirthday = localUserDetails.birthday || defaultBirthday
      Object.assign(birthdayParts, getBirthdayParts(userBirthday))
    } else {
      snackStore.error('Invalid data received from the server.')
    }
  } catch (e: any) {
    snackStore.error(
      e.response?.data?.message || e.message || 'Failed to load user details.'
    )
  } finally {
    loading.value = false
  }
})

async function saveDetails() {
  if (!valid.value || !canSave.value) return
  loading.value = true

  try {
    await $axios.get('/sanctum/csrf-cookie', { withCredentials: true })
    const { data } = await $axios.put(
      '/api/user/personal-details',
      localUserDetails,
      {
        withCredentials: true,
      }
    )

    // If success, reflect changes in userDetails
    Object.assign(userDetails, localUserDetails)
    canSave.value = false

    // Show success via snack store
    snackStore.success(
      data?.message || 'Personal details updated successfully.'
    )
  } catch (e: any) {
    if (e.response?.data?.errors) {
      const errors = Object.values(e.response.data.errors).join(', ')
      snackStore.error(errors)
    } else {
      snackStore.error(
        e.response?.data?.error || e.message || 'Failed to save user details.'
      )
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(localUserDetails, userDetails)
  Object.assign(birthdayParts, getBirthdayParts(localUserDetails.birthday))
  canSave.value = false
}
</script>
