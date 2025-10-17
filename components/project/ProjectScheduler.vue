<!-- components/ProjectScheduler.vue -->
<template>
  <v-card>
    <v-card-title>Schedule Project Premiere</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSchedule">
        <v-row>
          <v-col cols="12">
            <v-datetime-picker
              v-model="scheduleDate"
              :min="minDate"
              :rules="[(v) => !!v || 'Date is required']"
              label="Premiere Date and Time"
            />
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="timeZone"
              :items="timeZones"
              label="Time Zone"
              :rules="[(v) => !!v || 'Timezone is required']"
            />
          </v-col>

          <v-col cols="12">
            <v-alert v-if="error" type="error" density="compact">
              {{ error }}
            </v-alert>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-spacer />
          <v-btn
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading"
          >
            Schedule Premiere
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  accessUuid: string // Updated from projectId to accessUuid
}>()

const emit = defineEmits(['scheduled'])

const { scheduleProject, error, loading } = useProject()
const scheduleDate = ref<Date | null>(null)
const timeZone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

const minDate = computed(() => {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 5)
  return date
})

const timeZones = computed(() => {
  return Intl.supportedValuesOf('timeZone')
})

async function handleSchedule() {
  if (!scheduleDate.value) return

  try {
    await scheduleProject(props.accessUuid, {
      scheduled_at: scheduleDate.value.toISOString(),
      time_zone: timeZone.value,
    })

    emit('scheduled')
  } catch (e) {
    console.error(e)
  }
}
</script>
