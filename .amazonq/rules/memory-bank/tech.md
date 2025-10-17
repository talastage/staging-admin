# Technology Stack

## Core Framework
- **Nuxt 3** (v3.14.1592) - Vue.js meta-framework with SSR/SSG capabilities
- **Vue 3** (v3.5.13) - Progressive JavaScript framework with Composition API
- **TypeScript** (v5.6.2) - Static type checking

## UI Framework & Styling
- **Vuetify 3** (v3.4.6) - Material Design component framework
- **SASS** (v1.69.5) - CSS preprocessor
- **Material Design Icons** (@mdi/font v6.5.95, @mdi/js v7.4.47)
- **Remixicon** (v2.5.0) - Icon library
- **Vue Tabler Icons** (v2.9.0) - Additional icon set

## State Management
- **Pinia** (v2.1.3) - Vue store with composition API
- **@pinia/nuxt** (v0.5.1) - Nuxt integration
- **pinia-plugin-persistedstate** (v3.2.1) - State persistence
- **@pinia-plugin-persistedstate/nuxt** (v1.2.0) - Nuxt persistence plugin

## Video & Media
- **Video.js** (v7.21.6) - HTML5 video player
- **HLS.js** (v1.5.17) - HTTP Live Streaming
- **@videojs/http-streaming** (v3.10.0) - Adaptive streaming
- **videojs-contrib-quality-levels** (v4.1.0) - Quality selection
- **videojs-hls-quality-selector** (v2.0.0) - Quality UI
- **videojs-http-source-selector** (v1.1.6) - Source selection

## Form Handling & Validation
- **vee-validate** (v4.6.7) - Form validation
- **yup** (v0.32.11) - Schema validation
- **maska** (v1.5.0) - Input masking

## UI Components & Utilities
- **@vuepic/vue-datepicker** (v11.0.1) - Date picker
- **vue3-easy-data-table** (v1.4.19) - Data tables
- **vue3-perfect-scrollbar** (v1.6.0) - Custom scrollbars
- **vue-draggable-next** (v2.2.1) - Drag and drop
- **vuedraggable** (v2.24.3) - Draggable components
- **vue3-infinite-loading** (v1.0.0) - Infinite scroll
- **vue-infinite-scroll** (v2.0.2) - Scroll loading
- **Swiper** (nuxt-swiper v2.0.0) - Touch slider/carousel

## Rich Text & Media Editing
- **TipTap** (@tiptap/vue-3 v2.0.0-beta.220) - Rich text editor
- **CropperJS** (v1.6.2) - Image cropping
- **vue-cropperjs** (v5.0.0) - Vue wrapper for CropperJS
- **FilePond** (v4.30.6) - File upload
- **vue-filepond** (v7.0.4) - Vue FilePond integration

## HTTP & API
- **Axios** (v1.4.0) - HTTP client
- **axios-mock-adapter** (v1.21.2) - API mocking
- **defu** (v6.1.3) - Object merging utility

## Real-time Communication
- **Pusher.js** (v8.4.0-rc2) - WebSocket client
- **Laravel Echo** (v1.17.1) - Broadcasting client

## Internationalization
- **vue-i18n** (v9.2.2) - Internationalization framework

## Utilities & Helpers
- **@vueuse/core** (v10.9.0) - Vue composition utilities
- **@vueuse/nuxt** (v10.7.2) - Nuxt integration
- **lodash** (v4.17.21) - Utility library
- **lodash.throttle** (v4.1.1) - Throttle function
- **dayjs** (v1.11.13) - Date manipulation
- **uuid** (v11.1.0) - UUID generation
- **chance** (v1.1.8) - Random data generation

## PDF & Document Generation
- **jsPDF** (v2.5.2) - PDF generation
- **jspdf-autotable** (v3.8.3) - PDF tables
- **@sidebase/nuxt-pdf** (v0.1.2) - Nuxt PDF integration

## Social & Sharing
- **@stefanobartoletti/nuxt-social-share** (v0.5.0) - Social sharing
- **vue3-recaptcha-v2** (v1.0.1) - reCAPTCHA integration

## Notifications & Feedback
- **vue-toastification** (v2.0.0-rc.5) - Toast notifications
- **AOS** (v2.3.4) - Animate on scroll

## SEO & Meta
- **@nuxtjs/sitemap** (v7.0.0) - Sitemap generation
- **@nuxtjs/robots** (v5.0.0) - Robots.txt
- **nuxt-og-image** (v4.0.0) - Open Graph images

## Image Optimization
- **@nuxt/image** (v1.8.1) - Image optimization and lazy loading

## Security
- **nuxt-security** (v2.0.0) - Security headers and best practices

## Build Tools
- **@nuxt/vite-builder** (v3.5.3) - Vite-based build
- **@nuxt/kit** (v3.14.1592) - Nuxt utilities
- **sass-loader** (v13.3.3) - SASS compilation
- **vue-style-loader** (v4.1.3) - Style injection

## Development Tools
- **@nuxt/devtools** (v1.0.6) - Development tools
- **@nuxt/typescript-build** (v3.0.2) - TypeScript support
- **@types/node** (v22.5.5) - Node.js types
- **@types/lodash** (v4.14.202) - Lodash types
- **@types/uuid** (v10.0.0) - UUID types
- **@types/aos** (v3.0.4) - AOS types
- **@types/video.js** (v7.3.58) - Video.js types

## Development Commands

### Local Development
```bash
npm run dev          # Start development server (port 3000)
```

### Production Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Static Generation
```bash
npm run generate     # Generate static site
```

### Post-install
```bash
npm run postinstall  # Prepare Nuxt (runs automatically)
```

## Environment Configuration

### Required Environment Variables
- `NUXT_PUBLIC_FRONTEND_URL` - Frontend URL (default: http://localhost:3000)
- `NUXT_PUBLIC_BACKEND_URL` - Backend API URL (default: http://127.0.0.1:8000)
- `WEBSOCKET_API_ENDPOINT` - WebSocket endpoint
- `NUXT_PUBLIC_PUSHER_APP_ID` - Pusher application ID
- `NUXT_PUBLIC_PUSHER_APP_KEY` - Pusher key
- `NUXT_PUBLIC_PUSHER_APP_CLUSTER` - Pusher cluster
- `NUXT_PUBLIC_PUSHER_FORCE_TLS` - Force TLS (true/false)

## SSR Configuration
- **Hybrid rendering**: SSR enabled for SEO-critical pages (`/watch/**`), SPA for authenticated areas
- **Prerendering**: Static generation for landing pages, help, policies
- **Route rules**: Granular control over SSR/SPA per route
- **Nitro preset**: node-server for production deployment

## Build Optimizations
- **Tree shaking**: Automatic dead code elimination
- **Code splitting**: Route-based and component-based splitting
- **Image optimization**: Automatic format conversion and lazy loading
- **CSS optimization**: SCSS preprocessing and minification
- **TypeScript**: Compile-time type checking
