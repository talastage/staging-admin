// utils/ssr-fetch.ts
import { defu } from 'defu';

export async function ssrFetch<T>(url: string, options: any = {}, config: any, token: string | undefined, xsrfToken: string | undefined) {
  const baseURL = process.server ? config.public.backendUrl : '';
  const fullUrl = `${baseURL}${url}`;

  const defaultOptions: any = {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (process.server && token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  if (process.server && xsrfToken) {
    defaultOptions.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }

  const mergedOptions = defu(options, defaultOptions);

  try {
    console.log(`[SSR Fetch] ${process.server ? 'Server' : 'Client'} - Fetching: ${fullUrl}`);
    const response = await $fetch<T>(fullUrl, mergedOptions);
    return response;
  } catch (error: any) {
    console.error(`[SSR Fetch Error] URL: ${fullUrl}`);
    console.error(`[SSR Fetch Error] Status: ${error.statusCode || error.status || 'unknown'}`);
    console.error(`[SSR Fetch Error] Message: ${error.message || error.statusMessage || 'unknown'}`);
    throw error;
  }
}