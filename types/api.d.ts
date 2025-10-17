// types/api.d.ts
declare module "#app" {
  interface NuxtApp {
    $api: {
      get: <T>(url: string, options?: UseFetchOptions<T>) => Promise<T>;
      post: <T>(
        url: string,
        body: any,
        options?: UseFetchOptions<T>
      ) => Promise<T>;
      put: <T>(
        url: string,
        body: any,
        options?: UseFetchOptions<T>
      ) => Promise<T>;
      patch: <T>(
        url: string,
        body: any,
        options?: UseFetchOptions<T>
      ) => Promise<T>;
      delete: <T>(url: string, options?: UseFetchOptions<T>) => Promise<T>;
    };
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $api: {
      get: <T>(url: string, options?: UseFetchOptions<T>) => Promise<T>;
      post: <T>(
        url: string,
        body: any,
        options?: UseFetchOptions<T>
      ) => Promise<T>;
      put: <T>(
        url: string,
        body: any,
        options?: UseFetchOptions<T>
      ) => Promise<T>;
      patch: <T>(
        url: string,
        body: any,
        options?: UseFetchOptions<T>
      ) => Promise<T>;
      delete: <T>(url: string, options?: UseFetchOptions<T>) => Promise<T>;
    };
  }
}

export {};
