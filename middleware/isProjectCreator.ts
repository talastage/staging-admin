// middleware/isProjectCreator.ts

import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const projectStore = useProjectStore()
  const authStore = useAuthStore()

  const cacheKey = `project_creator_${to.params.access_uuid}`

  try {
    // Ensure the user is authenticated
    if (!authStore.user?.value) {
      try {
        await authStore.fetchUser()
      } catch (error) {
        console.error('Authentication error:', error)
        return navigateTo('/login')
      }
    }

    // Check cache first
    const cachedResult = useState(cacheKey)
    if (cachedResult.value !== undefined) {
      if (!cachedResult.value) {
        return navigateTo('/404')
      }
      return
    }

    // Check if a project is already loaded and matches the current access_uuid
    let project = projectStore.currentProject
    if (!project || project.access_uuid !== to.params.access_uuid) {
      // Only fetch if needed
      project = await projectStore.fetchProject(to.params.access_uuid as string)
    }

    if (!project) {
      throw new Error('Project not found')
    }

    // Check if user is the creator
  const isCreator = project.creator?.id === authStore.user?.value?.id

    // Cache the result
    useState(cacheKey, () => isCreator)

    if (!isCreator) {
      return navigateTo('/404')
    }
  } catch (error) {
    console.error('Project creator check error:', {
      error,
      access_uuid: to.params.access_uuid,
      user: authStore.user?.value?.id,
    })

    // Handle different error types
    if (error instanceof Response && error.status === 401) {
      return navigateTo('/login')
    }

    return navigateTo('/404')
  }
})
