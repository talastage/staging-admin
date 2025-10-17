<template>
  <div>
    <HomePage />
  </div>
</template>

<script setup lang="ts">
/**
 * Home Page - Main Landing Page for TalaStage
 * 
 * SEO Strategy (Best Practice for Nuxt 3 SSR):
 * - All SEO meta tags defined directly in this page using useHead()
 * - Complete control over meta tags, Open Graph, Twitter Card
 * - Schema.org WebSite structured data with search action
 * - Optimized for social media sharing (Facebook, WhatsApp, Twitter, LinkedIn)
 * - No composables - direct implementation for maximum SSR reliability
 */

import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
  },
})

const runtimeConfig = useRuntimeConfig()
const frontendUrl = (runtimeConfig.public.frontendUrl as string) || 'https://talastage.com'

// Page SEO Configuration
const pageTitle = 'Discover Entertainment & Talents'
const pageDescription = 'Explore premieres, trending talents, and immersive entertainment experiences curated for you on TalaStage. Connect with creators and discover amazing content.'
const pageImage = `${frontendUrl}/talastage_logo.png`
const pageUrl = frontendUrl
const siteName = 'TalaStage'

// Define ALL SEO meta tags directly for SSR
useHead({
  title: pageTitle,
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    // Basic meta tags
    { name: 'description', content: pageDescription },
    { name: 'keywords', content: 'talastage, entertainment platform, watch premieres, discover talents, streaming experiences, content creators, live performances, video streaming' },
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: siteName },
    
    // Open Graph Protocol - Essential for Facebook, WhatsApp, LinkedIn
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: pageImage },
    { property: 'og:image:secure_url', content: pageImage },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1024' },
    { property: 'og:image:height', content: '1024' },
    { property: 'og:image:alt', content: `${siteName} - Your Stage to the World of Entertainment` },
    { property: 'og:locale', content: 'en_US' },
    
    // Twitter Card - Essential for Twitter sharing
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@talastage' },
    { name: 'twitter:creator', content: '@talastage' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    { name: 'twitter:image', content: pageImage },
    { name: 'twitter:image:alt', content: `${siteName} - Your Stage to the World of Entertainment` },
  ],
  link: [
    // Canonical URL
    { rel: 'canonical', href: pageUrl },
  ],
  script: [
    // Schema.org Organization
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: frontendUrl,
        logo: pageImage,
        description: 'Your Stage to the World of Entertainment',
        sameAs: [
          'https://twitter.com/talastage',
          'https://facebook.com/talastage',
        ],
      }),
    },
    // Schema.org WebSite with Search Action
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: frontendUrl,
        description: pageDescription,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${frontendUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }),
    },
  ],
})
</script>

<style scoped>
/* Add your styles here */
</style>
