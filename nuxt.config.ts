import { createResolver } from '@nuxt/kit'
const { resolve } = createResolver(import.meta.url)
const BACKEND = process.env.NUXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

export default defineNuxtConfig({
  // Ensure 404 errors are properly handled
  errorHandler: '~/error',
  
  /**
   * Global App Configuration
   * 
   * SEO Strategy (Best Practice for Nuxt 3 SSR):
   * - nuxt.config.ts: ONLY essential global meta (charset, viewport, format-detection, favicon)
   * - app.vue: ONLY titleTemplate
   * - Pages: Define ALL their own SEO meta tags directly with useHead()
   * - NO shared meta tags between config and pages to avoid conflicts
   */
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'en',
      },
      bodyAttrs: {
        style: 'background-color: rgb(243, 244, 247); margin: 0; padding: 0;',
      },
      meta: [
        // ONLY essential meta tags that don't conflict with page-level SEO
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/talastage_favicon.png' },
        { rel: 'shortcut icon', href: '/talastage_favicon.png' },
        { rel: 'apple-touch-icon', href: '/talastage_favicon.png' },
      ],
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_FRONTEND_URL || 'https://main.d1bb1wzp9sa6ce.amplifyapp.com',
    name: 'TalaStage',
    description: 'Your Stage to the World of Entertainment.',
    defaultLocale: 'en',
  },

  ssr: true,
  devtools: { enabled: false },

  routeRules: {
    '/': { ssr: true, prerender: false },
    '/watch/**': { ssr: true, prerender: false },
    '/test-ssr': { ssr: true, prerender: false },
    // Test video pages - all SSR enabled for testing
    '/test-videos': { ssr: true, prerender: false },
    '/test-video-1': { ssr: true, prerender: false },
    '/test-video-2': { ssr: true, prerender: false },
    '/test-video-3': { ssr: true, prerender: false },
    '/test-video-4': { ssr: true, prerender: false },
    '/test-video-5': { ssr: true, prerender: false },
    '/api/**': { proxy: `${BACKEND}/**` },
    '/guest/**': { proxy: `${BACKEND}/**` },
  },

  nitro: {
    preset: 'aws-amplify',
    serveStatic: true,
    prerender: {
      crawlLinks: false,
      routes: [],
    },
    compressPublicAssets: true,
    minify: true,
  },

  typescript: {
    shim: false,
    tsConfig: {
      compilerOptions: {
        paths: {
          '@/*': ['./*'],
          '@themeConfig': ['../themeConfig.ts'],
          '@layouts/*': ['../@layouts/*'],
          '@layouts': ['../@layouts'],
          '@core/*': ['../@core/*'],
          '@core': ['../@core'],
          '@images/*': ['../assets/images/*'],
          '@styles/*': ['../assets/styles/*'],
          '@validators': ['../@core/utils/validators'],
          '@db/*': ['../server/fake-db/*'],
          '@api-utils/*': ['../server/utils/*'],
        },
      },
    },
  },

  build: {
    transpile: ['vuetify', 'video.js'],
  },

  css: ['@mdi/font/css/materialdesignicons.css', '@/assets/scss/style.scss'],

  runtimeConfig: {
    public: {
      frontendUrl:
        process.env.NUXT_PUBLIC_FRONTEND_URL || 'https://main.d1bb1wzp9sa6ce.amplifyapp.com',
      backendUrl:
        process.env.NUXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000',
      wsEndpoint: process.env.WEBSOCKET_API_ENDPOINT,
      pusherAppId: process.env.NUXT_PUBLIC_PUSHER_APP_ID,
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_APP_KEY,
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_APP_CLUSTER,
      pusherForceTLS: process.env.NUXT_PUBLIC_PUSHER_FORCE_TLS === 'true',
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '@/views',
      pathPrefix: false,
    },
    {
      global: true,
      dirs: ['~/components/global'],
    },
  ],

  imports: {
    dirs: ['./@core/utils'],
  },

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },

  modules: [
    [
      'vuetify-nuxt-module',
      {
        styles: { configFile: 'assets/scss/_variables.scss' },
        importComposables: true,
      },
    ],
    'nuxt-swiper',
    '@vueuse/nuxt',
    '@sidebase/nuxt-pdf',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@stefanobartoletti/nuxt-social-share',
    '@nuxtjs/sitemap',
    '@nuxt/image',
  ],

  // Add Vuetify configuration
  vuetify: {
    moduleOptions: {
      includeTransformAssetsUrls: true,
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            colors: {
              primary: '#1867C0',
              secondary: '#5CBBF6',
            },
          },
        },
      },
      defaults: {
        VBtn: {
          variant: 'flat',
        },
      },
      icons: {
        defaultSet: 'mdi',
      },
    },
  },

  // Cast to any to bypass strict type checking for custom module configurations
  sitemap: {
    hostname: 'https://talastage.com',
    gzip: true,
    exclude: [
      '/admin/**',
      '/account/**',
      '/password/**',
      '/profile/**',
      '/studio/**',
      '/wallet/**',
      '/protected/**',
      '/payments/**',
      '/orders/**',
      '/checkout',
      '/tips/**',
      '/tip/**',
      '/notifications',
      '/fanning',
      '/fans',
      '/watching',
      '/project/**',
      '/watch/**',
      '/investments/**',
      '/search_results',
      '/page_search_results',
      '/test/**',
      '/404',
      '/user-not-found',
    ],
    routes: async () => {
      // Add your dynamic routes here if needed
      return [
        '/',
        '/help',
        '/premieres',
        '/premiering',
        '/talents',
        '/talents/categories',
        '/talents/collections',
        '/investors',
        '/policies',
        '/contacts',
        '/trending',
        '/upcoming',
        '/register',
        '/register/talent',
        '/login',
      ]
    },
  },

  swiper: {
    prefix: 'Swiper',
    styleLang: 'css',
    modules: ['navigation', 'pagination', 'autoplay'],
  },
  sourcemap: { server: false, client: false } as any,
  devServerHandlers: [] as any,
  vite: {
    define: {
      'process.env.DEBUG': false,
      global: 'globalThis',
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/_modern-imports.scss" as *;',
        },
      },
    },
    optimizeDeps: {
      include: ['video.js', '@videojs/http-streaming', 'pusher-js', 'hls.js'],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
      },
    },
    resolve: {
      alias: {
        'video.js/dist/video-js.css': 'video.js/dist/video-js.css',
        'video.js': 'video.js/dist/video.js',
      },
    },
    ssr: {
      noExternal: ['vuetify'],
    },
  } as any,
  compatibilityDate: '2024-12-04',
})
