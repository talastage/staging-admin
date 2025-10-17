/**
 * @file useSeo.ts
 * @description Enterprise-grade SSR-optimized SEO composable for Nuxt 3
 * 
 * Best Practices Implementation:
 * - Uses Nuxt's useHead() for guaranteed SSR support
 * - Implements Schema.org structured data (Organization, WebSite)
 * - Follows Open Graph and Twitter Card specifications
 * - Ensures no meta tag duplication
 * - Provides proper canonical URLs and absolute paths
 * - Optimized for social media sharing (WhatsApp, Facebook, LinkedIn, Twitter)
 * 
 * @example
 * ```typescript
 * useSeo({
 *   title: 'Page Title',
 *   description: 'Page description',
 *   image: 'https://example.com/image.jpg',
 *   schema: {
 *     type: 'WebSite',
 *     searchAction: true
 *   }
 * })
 * ```
 */

interface SchemaOptions {
  type?: 'WebSite' | 'Organization' | 'WebPage'
  searchAction?: boolean
  breadcrumbs?: Array<{ name: string; url: string }>
}

interface SeoOptions {
  title?: string
  description?: string
  keywords?: string | string[]
  image?: string
  imageWidth?: number
  imageHeight?: number
  imageAlt?: string
  url?: string
  type?: 'website' | 'article'
  siteName?: string
  locale?: string
  twitterCard?: 'summary' | 'summary_large_image'
  twitterSite?: string
  noIndex?: boolean
  canonical?: string
  schema?: SchemaOptions
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

const DEFAULT_SITE_NAME = 'TalaStage'
const DEFAULT_DESCRIPTION = 'Your Stage to the World of Entertainment'
const DEFAULT_IMAGE = '/talastage_logo.png'
const DEFAULT_TWITTER = '@talastage'

export function useSeo(options: SeoOptions = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const baseUrl = (config.public.frontendUrl as string) || 'https://talastage.com'
  
  // Ensure absolute URLs
  const absoluteUrl = options.url || `${baseUrl}${route.path}`
  const absoluteImage = options.image?.startsWith('http') 
    ? options.image 
    : `${baseUrl}${options.image || DEFAULT_IMAGE}`
  const absoluteCanonical = options.canonical || absoluteUrl
  
  // Convert keywords to string
  const keywordsString = Array.isArray(options.keywords)
    ? options.keywords.join(', ')
    : options.keywords || ''
  
  // Build meta tags array
  const metaTags = [
    // Basic meta tags
    { name: 'description', content: options.description || DEFAULT_DESCRIPTION },
    { name: 'robots', content: options.noIndex ? 'noindex, nofollow' : 'index, follow' },
    
    // Open Graph Protocol
    { property: 'og:title', content: options.title || DEFAULT_SITE_NAME },
    { property: 'og:description', content: options.description || DEFAULT_DESCRIPTION },
    { property: 'og:image', content: absoluteImage },
    { property: 'og:image:secure_url', content: absoluteImage },
    { property: 'og:image:width', content: String(options.imageWidth || 1200) },
    { property: 'og:image:height', content: String(options.imageHeight || 630) },
    { property: 'og:image:alt', content: options.imageAlt || options.title || DEFAULT_SITE_NAME },
    { property: 'og:url', content: absoluteUrl },
    { property: 'og:type', content: options.type || 'website' },
    { property: 'og:site_name', content: options.siteName || DEFAULT_SITE_NAME },
    { property: 'og:locale', content: options.locale || 'en_US' },
    
    // Twitter Card
    { name: 'twitter:card', content: options.twitterCard || 'summary_large_image' },
    { name: 'twitter:site', content: options.twitterSite || DEFAULT_TWITTER },
    { name: 'twitter:creator', content: options.twitterSite || DEFAULT_TWITTER },
    { name: 'twitter:title', content: options.title || DEFAULT_SITE_NAME },
    { name: 'twitter:description', content: options.description || DEFAULT_DESCRIPTION },
    { name: 'twitter:image', content: absoluteImage },
    { name: 'twitter:image:alt', content: options.imageAlt || options.title || DEFAULT_SITE_NAME },
  ]
  
  // Add keywords if provided
  if (keywordsString) {
    metaTags.push({ name: 'keywords', content: keywordsString })
  }
  
  // Add article-specific tags if type is article
  if (options.type === 'article') {
    if (options.publishedTime) {
      metaTags.push({ property: 'article:published_time', content: options.publishedTime })
    }
    if (options.modifiedTime) {
      metaTags.push({ property: 'article:modified_time', content: options.modifiedTime })
    }
    if (options.author) {
      metaTags.push({ property: 'article:author', content: options.author })
    }
  }
  
  // Build structured data (Schema.org)
  const structuredData: any[] = []
  
  // Always include Organization schema
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: DEFAULT_SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}${DEFAULT_IMAGE}`,
    sameAs: [
      'https://twitter.com/talastage',
      'https://facebook.com/talastage',
    ],
  })
  
  // Add page-specific schema
  if (options.schema) {
    if (options.schema.type === 'WebSite') {
      const websiteSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: DEFAULT_SITE_NAME,
        url: baseUrl,
        description: options.description || DEFAULT_DESCRIPTION,
      }
      
      // Add search action if requested
      if (options.schema.searchAction) {
        websiteSchema.potentialAction = {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        }
      }
      
      structuredData.push(websiteSchema)
    } else if (options.schema.type === 'WebPage') {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: options.title || DEFAULT_SITE_NAME,
        url: absoluteUrl,
        description: options.description || DEFAULT_DESCRIPTION,
        image: absoluteImage,
        inLanguage: 'en-US',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
        },
      })
    }
    
    // Add breadcrumbs if provided
    if (options.schema.breadcrumbs && options.schema.breadcrumbs.length > 0) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: options.schema.breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      })
    }
  }
  
  // Apply all SEO configurations
  useHead({
    title: options.title || DEFAULT_SITE_NAME,
    htmlAttrs: {
      lang: options.locale?.split('_')[0] || 'en',
    },
    meta: metaTags,
    link: [
      { rel: 'canonical', href: absoluteCanonical },
    ],
    script: structuredData.map(data => ({
      type: 'application/ld+json',
      children: JSON.stringify(data),
    })),
  })
  
  return {
    absoluteUrl,
    absoluteImage,
    structuredData,
  }
}
