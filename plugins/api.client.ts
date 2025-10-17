// Client-only axios wrapper for backward compatibility
import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const customAxios = axios.create({
    baseURL: config.public.backendUrl,
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  })

  customAxios.interceptors.request.use((config) => {
    const token = useCookie('XSRF-TOKEN').value
    if (token) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
    }
    return config
  })

  customAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 419) {
        await customAxios.get('/sanctum/csrf-cookie')
        return customAxios(error.config)
      }
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      axios: customAxios,
    },
  }
})
