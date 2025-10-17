// composables/useSsrApi.ts
import { useAsyncData, useRuntimeConfig, useCookie, navigateTo, showError } from '#imports';
import { UseFetchOptions } from '#app';
import { defu } from 'defu';

// This function will be used inside useAsyncData
async function ssrFetcher<T>(url: string, options: UseFetchOptions<T>) {
  const config = useRuntimeConfig();
  const token = useCookie('auth_token');
  const xsrfToken = useCookie('XSRF-TOKEN');

  const defaultOptions: UseFetchOptions<any> = {
    baseURL: config.public.backendUrl,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = defu(options, defaultOptions);

  // On the server, we need to manually pass the cookies if they exist.
  // On the client, the browser handles this due to `credentials: 'include'`.
  if (process.server) {
    const headers: Record<string, string> = {};
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`;
    }
    if (xsrfToken.value) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken.value);
    }
    mergedOptions.headers = { ...mergedOptions.headers, ...headers };
  }

  try {
    const response = await $fetch<T>(url, mergedOptions);
    return response;
  } catch (error: any) {
    console.error('SSR Fetch error:', error);

    if (process.server) {
      // On server, we might want to set a specific response code
      // This is more advanced and depends on how you want to handle errors
    }

    if (error.statusCode === 401 && process.client) {
      navigateTo('/login');
    } else if (error.statusCode === 404) {
      showError({ statusCode: 404, message: 'Resource not found' });
    } else if (error.statusCode >= 500) {
      showError({ statusCode: 500, message: 'Server error' });
    }
    
    throw error;
  }
}

export function useSsrApi<T>(
  key: string,
  url: string,
  options: UseFetchOptions<T> = {}
) {
  return useAsyncData<T>(key, () => ssrFetcher<T>(url, options));
}
