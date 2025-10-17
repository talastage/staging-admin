// composable/help/useCategories.ts

export const useCategories = () => {
  const { $axios } = useNuxtApp()

  const fetchCategories = async () => {
    try {
      const { data } = await $axios.get('/api/help/categories')
      return data.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  return {
    fetchCategories,
  }
}
