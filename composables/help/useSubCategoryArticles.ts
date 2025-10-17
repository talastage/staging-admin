// composables/help/useSubCategoryArticles.ts
export const useSubCategoryArticles = () => {
  const { $axios } = useNuxtApp()
  const fetchSubCategory = async (
    categorySlug: string,
    subCategorySlug: string,
    page: number,
    perPage: number
  ) => {
    const response = await $axios.get(
      `/api/help/categories/${categorySlug}/subcategories/${subCategorySlug}`,
      { params: { page, per_page: perPage } }
    )
    return response.data
  }
  return { fetchSubCategory }
}
