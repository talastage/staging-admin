// plugins/api.ts
import { defineNuxtPlugin, useRuntimeConfig, useCookie } from '#app'
import { ofetch } from 'ofetch'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  // Create a pre-configured ofetch instance
  const apiFetch = ofetch.create({
    baseURL: config.public.backendUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },

    onRequest({ options }) {
      // Set the authorization header if a token exists
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        }
      }
    },

    async onResponseError({ request, response, options }) {
      // Handle CSRF token mismatch (status 419)
      if (response.status === 419) {
        console.log('CSRF token mismatch, refreshing...')
        try {
          // Refresh the CSRF token
          await ofetch('/sanctum/csrf-cookie', { baseURL: config.public.backendUrl, credentials: 'include' })
          // Retry the original request
          return apiFetch(request, options)
        } catch (e) {
          console.error('Failed to refresh CSRF token or retry request:', e)
        }
      }

      // Do not handle navigation here. Let the error propagate to the caller.
      if (response.status === 401) {
        console.log('Unauthorized access (401). The caller should handle this.')
      }
    },
  })

  // Create a convenience wrapper for the apiFetch instance
  const api = {
    get: <T>(url: string, options = {}) => apiFetch<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, body: any, options = {}) => apiFetch<T>(url, { ...options, method: 'POST', body }),
    put: <T>(url: string, body: any, options = {}) => apiFetch<T>(url, { ...options, method: 'PUT', body }),
    patch: <T>(url: string, body: any, options = {}) => apiFetch<T>(url, { ...options, method: 'PATCH', body }),
    delete: <T>(url: string, options = {}) => apiFetch<T>(url, { ...options, method: 'DELETE' }),
  }

  // Provide the api object to the Nuxt app
  return {
    provide: {
      api,
    },
  }
})
