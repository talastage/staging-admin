// composables/premiering/usePremiereStatus.ts
export function usePremiereStatus(premiere: Ref<Project>) {
  const status = computed(() => {
    const now = new Date()
    const startDate = new Date(premiere.value.premiere_start_date)
    const endDate = new Date(premiere.value.premiere_end_date)

    if (now < startDate) {
      return {
        type: 'upcoming',
        label: 'Coming Soon',
        color: 'warning',
      }
    } else if (now >= startDate && now <= endDate) {
      return {
        type: 'live',
        label: 'LIVE NOW',
        color: 'error',
      }
    } else {
      return {
        type: 'ended',
        label: 'Premiere Ended',
        color: 'grey',
      }
    }
  })

  return { status }
}
