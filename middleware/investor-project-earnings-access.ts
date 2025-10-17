export default defineNuxtRouteMiddleware(async (to) => {
  const { $axios } = useNuxtApp()
  const { user } = useAuthStore()
  
  if (!user) {
    return navigateTo('/404')
  }

  const accessUuid = to.params.access_uuid as string
  const investorId = to.params.investorId as string

  if (!accessUuid || !investorId) {
    return navigateTo('/404')
  }

  try {
    const response = await $axios.get(`/api/projects/${accessUuid}/earnings/investors/${investorId}/balance`)
    const balanceData = response.data.data

    const isUserInvestor = balanceData.investor_type.is_user
    const isPageInvestor = balanceData.investor_type.is_page

    if (isUserInvestor) {
      // For user investors, check if current user is the project_investor
      if (balanceData.project_investor.id !== user.id) {
        return navigateTo('/404')
      }
    } else if (isPageInvestor) {
      // For page investors, check if current user is the page_creator
      if (!balanceData.page_creator || balanceData.page_creator.id !== user.id) {
        return navigateTo('/404')
      }
    } else {
      return navigateTo('/404')
    }
  } catch (error: any) {
    return navigateTo('/404')
  }
})