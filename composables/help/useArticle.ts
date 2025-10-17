// composable/help/useArticle.ts

export const useArticle = () => {
  const { $axios } = useNuxtApp()
  const config = useRuntimeConfig()

  const fetchArticle = async (categorySlug: string, articleSlug: string) => {
    if (!categorySlug || !articleSlug) {
      throw new Error('Category slug and article slug are required')
    }

    try {
      const [articleRes, relatedRes] = await Promise.all([
        $axios.get(`/api/help/categories/${categorySlug}/${articleSlug}`),
        $axios.get(`/api/help/articles/${articleSlug}/related`),
      ])

      return {
        article: articleRes.data.data,
        relatedArticles: relatedRes.data.data || [],
      }
    } catch (error: any) {
      console.error('Error fetching article:', error.message || error)
      throw error
    }
  }

  return {
    fetchArticle,
  }
}
