// composables/useApi.ts

import { UseFetchOptions } from '#app'
import { FetchError } from 'ofetch'
import defu from 'defu'

export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  const xsrfToken = useCookie('XSRF-TOKEN') // <-- This is the cookie Sanctum sets

  const defaultOptions: UseFetchOptions<any> = {
    baseURL: config.public.backendUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    onRequest({ options }) {
      // Bearer token if present
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        }
      }

      // X-XSRF-TOKEN if present (important for Sanctum)
      if (xsrfToken.value) {
        options.headers = {
          ...options.headers,
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken.value),
        }
      }
    },
    onRequestError({ error }) {
      console.error('Request error:', error)
    },
    onResponse({ response }) {
      if (response.status === 401) {
        navigateTo('/login')
      }
    },
    onResponseError({ error }) {
      console.error('Response error:', error)
      if (error.statusCode === 404) {
        showError({ statusCode: 404, message: 'Resource not found' })
      } else if (error.statusCode >= 500) {
        showError({ statusCode: 500, message: 'Server error' })
      }
    },
  }

  async function fetchCsrfToken() {
    await useFetch('/sanctum/csrf-cookie', {
      baseURL: config.public.backendUrl,
      // Must also include credentials so the cookie is actually set
      credentials: 'include',
    })
  }

  async function fetchApi<T>(
    url: string,
    options: UseFetchOptions<T> = {}
  ): Promise<T> {
    try {
      console.log(`Fetching URL: ${url} with options:`, options)
      const mergedOptions = defu(options, defaultOptions)

      if (mergedOptions.method === 'GET') {
        mergedOptions.cache = mergedOptions.cache || 'no-cache'
      }

      const { data, error } = await useFetch<T>(url, mergedOptions)
      if (error.value) {
        console.error('Fetch error:', error.value)
        throw error.value
      }
      if (!data.value) {
        console.error('No data received from the API')
        throw new Error('No data received from the API')
      }

      return data.value as T
    } catch (err) {
      console.error('API call error:', err)
      throw err
    }
  }

  return {
    get: <T>(url: string, options?: UseFetchOptions<T>) =>
      fetchApi<T>(url, { ...options, method: 'GET' }),
    post: async <T>(url: string, body: any, options?: UseFetchOptions<T>) => {
      await fetchCsrfToken()
      return fetchApi<T>(url, { ...options, method: 'POST', body })
    },
    put: async <T>(url: string, body: any, options?: UseFetchOptions<T>) => {
      await fetchCsrfToken()
      return fetchApi<T>(url, { ...options, method: 'PUT', body })
    },
    patch: async <T>(url: string, body: any, options?: UseFetchOptions<T>) => {
      await fetchCsrfToken()
      return fetchApi<T>(url, { ...options, method: 'PATCH', body })
    },
    delete: async <T>(url: string, options?: UseFetchOptions<T>) => {
      await fetchCsrfToken()
      return fetchApi<T>(url, { ...options, method: 'DELETE' })
    },
  }
}
