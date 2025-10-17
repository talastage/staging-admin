import { computed } from 'vue'

export interface PremiereType {
  music_video: string
  music_audio: string
  movie: string
  [key: string]: string
}

export function usePremiereCalculator() {
  const typeLabels: PremiereType = {
    music_video: 'Music Video Premiere',
    music_audio: 'Music Audio Release',
    movie: 'Movie Premiere',
  }

  const getTypeLabel = (type: string): string => {
    return typeLabels[type] || type
  }

  const calculateEndDate = (startDate: Date, days: number): Date => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + days)
    return endDate
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return {
    getTypeLabel,
    calculateEndDate,
    formatDate,
    typeLabels,
  }
}
