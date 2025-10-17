<!-- components/PremiereSchedule.vue -->
<template>
  <div class="premiere-schedule">
    <div class="schedule-timeline">
      <div v-for="day in upcomingDays" :key="day.date" class="day-column">
        <h3>{{ formatDate(day.date) }}</h3>
        <div class="premieres-list">
          <div
            v-for="premiere in day.premieres"
            :key="premiere.id"
            class="premiere-item"
          >
            <span class="time">{{
              formatTime(premiere.premiere_start_date)
            }}</span>
            <span class="title">{{ premiere.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ScheduledPremiere {
  id: number
  name: string
  premiere_start_date: string
}

const upcomingDays = computed(() => {
  // Group premieres by day
  const days = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i)
    days.push({
      date,
      premieres: premieres.value.filter((p) =>
        isSameDay(new Date(p.premiere_start_date), date)
      ),
    })
  }

  return days
})
</script>
