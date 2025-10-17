// composable/help/useCategoryArticles.ts

export const useCategoryArticles = () => {
  const { $axios } = useNuxtApp()

  const fetchCategory = async (
    categorySlug: string,
    page: number,
    perPage: number,
    search?: string
  ) => {
    try {
      const params: any = { page, per_page: perPage }
      if (search) {
        params.search = search
      }
      
      const response = await $axios.get(
        `/api/help/categories/${categorySlug}`,
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching category articles:', error)
      throw error
    }
  }

  return {
    fetchCategory,
  }
}
