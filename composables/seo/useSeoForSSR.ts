/**
 * @file useSeoForSSR.ts
 * @description Enterprise-grade SSR-optimized SEO composable for video pages
 * 
 * Best Practices Implementation:
 * - Full SSR support with Nuxt's useHead()
 * - Comprehensive Open Graph video tags for social media sharing
 * - Twitter Player Card for in-app video playback
 * - Schema.org VideoObject structured data for search engines
 * - Optimized for WhatsApp, Facebook, LinkedIn, Twitter, Discord
 * - Supports both HLS and MP4 video formats
 * 
 * Social Media Support:
 * - Facebook/WhatsApp: Uses og:video tags with thumbnail fallback
 * - Twitter: Implements player card with iframe support
 * - LinkedIn: Uses og:image for thumbnail preview
 * - Discord: Uses og:video with thumbnail
 * 
 * @example
 * ```typescript
 * useSeoForSSR({
 *   title: 'Amazing Video Title',
 *   description: 'Watch this amazing content...',
 *   image: 'https://example.com/thumbnail.jpg',
 *   video: {
 *     url: 'https://example.com/video.m3u8',
 *     duration: 180,
 *     width: 1920,
 *     height: 1080
 *   },
 *   creator: {
 *     username: 'creator',
 *     display_name: 'Creator Name',
 *     profile_photo: 'https://example.com/avatar.jpg'
 *   }
 * })
 * ```
 */

interface VideoData {
  url: string
  duration?: number | null
  width?: number
  height?: number
  type?: string
  thumbnail?: string
}

interface CreatorData {
  username: string
  display_name: string
  profile_photo?: string
}

interface VideoSeoOptions {
  title?: string
  description?: string
  image?: string
  video?: VideoData
  creator?: CreatorData
  url?: string
  publishedTime?: string
  tags?: string[]
  category?: string
  noIndex?: boolean
  embedUrl?: string
}

const DEFAULT_SITE_NAME = 'TalaStage'
const DEFAULT_DESCRIPTION = 'Watch amazing content on TalaStage'
const DEFAULT_IMAGE = '/talastage_logo.png'
const DEFAULT_TWITTER = '@talastage'

export function useSeoForSSR(options: VideoSeoOptions = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const baseUrl = (config.public.frontendUrl as string) || 'https://talastage.com'
  
  // Ensure absolute URLs
  const absoluteUrl = options.url || `${baseUrl}${route.path}`
  const absoluteImage = options.image?.startsWith('http')
    ? options.image
    : `${baseUrl}${options.image || DEFAULT_IMAGE}`
  
  // Build creator info
  const creatorName = options.creator?.display_name || options.creator?.username || 'TalaStage Creator'
  const creatorUrl = options.creator?.username ? `${baseUrl}/${options.creator.username}` : baseUrl
  
  // Build keywords
  const keywords = [
    options.title,
    creatorName,
    'TalaStage',
    'video',
    'entertainment',
    'streaming',
    options.category,
    ...(options.tags || [])
  ].filter(Boolean).join(', ')
  
  // Build comprehensive meta tags for social media
  const metaTags = [
    // Basic meta tags
    { name: 'description', content: options.description || DEFAULT_DESCRIPTION },
    { name: 'keywords', content: keywords },
    { name: 'robots', content: options.noIndex ? 'noindex, nofollow' : 'index, follow' },
    { name: 'author', content: creatorName },
    
    // Open Graph Protocol - Video
    { property: 'og:title', content: options.title || DEFAULT_SITE_NAME },
    { property: 'og:description', content: options.description || DEFAULT_DESCRIPTION },
    { property: 'og:image', content: absoluteImage },
    { property: 'og:image:secure_url', content: absoluteImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: options.title || DEFAULT_SITE_NAME },
    { property: 'og:url', content: absoluteUrl },
    { property: 'og:type', content: 'video.other' },
    { property: 'og:site_name', content: DEFAULT_SITE_NAME },
    { property: 'og:locale', content: 'en_US' },
    
    // Twitter Card
    { name: 'twitter:card', content: options.video?.url ? 'player' : 'summary_large_image' },
    { name: 'twitter:site', content: DEFAULT_TWITTER },
    { name: 'twitter:creator', content: DEFAULT_TWITTER },
    { name: 'twitter:title', content: options.title || DEFAULT_SITE_NAME },
    { name: 'twitter:description', content: options.description || DEFAULT_DESCRIPTION },
    { name: 'twitter:image', content: absoluteImage },
    { name: 'twitter:image:alt', content: options.title || DEFAULT_SITE_NAME },
  ]
  
  // Add video-specific Open Graph tags
  if (options.video?.url) {
    // Determine video type
    const videoType = options.video.url.includes('.m3u8') 
      ? 'application/x-mpegURL' 
      : options.video.type || 'video/mp4'
    
    metaTags.push(
      { property: 'og:video', content: options.video.url },
      { property: 'og:video:secure_url', content: options.video.url },
      { property: 'og:video:type', content: videoType },
      { property: 'og:video:width', content: String(options.video.width || 1920) },
      { property: 'og:video:height', content: String(options.video.height || 1080) },
    )
    
    // Add duration if available
    if (options.video.duration) {
      metaTags.push({ property: 'video:duration', content: String(options.video.duration) })
    }
    
    // Add published time
    if (options.publishedTime) {
      metaTags.push({ property: 'video:release_date', content: options.publishedTime })
    }
    
    // Add video tags
    if (options.tags && options.tags.length > 0) {
      options.tags.forEach(tag => {
        metaTags.push({ property: 'video:tag', content: tag })
      })
    }
    
    // Twitter Player Card - allows in-app playback
    const playerUrl = options.embedUrl || absoluteUrl
    metaTags.push(
      { name: 'twitter:player', content: playerUrl },
      { name: 'twitter:player:width', content: String(options.video.width || 1920) },
      { name: 'twitter:player:height', content: String(options.video.height || 1080) },
      { name: 'twitter:player:stream', content: options.video.url },
      { name: 'twitter:player:stream:content_type', content: videoType },
    )
  }
  
  // Build Schema.org VideoObject structured data
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
  
  // Add VideoObject schema for rich search results
  if (options.video?.url) {
    const videoSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: options.title || DEFAULT_SITE_NAME,
      description: options.description || DEFAULT_DESCRIPTION,
      thumbnailUrl: absoluteImage,
      uploadDate: options.publishedTime || new Date().toISOString(),
      contentUrl: options.video.url,
      embedUrl: options.embedUrl || absoluteUrl,
      duration: options.video.duration ? `PT${options.video.duration}S` : undefined,
    }
    
    // Add creator/author information
    if (options.creator) {
      videoSchema.author = {
        '@type': 'Person',
        name: creatorName,
        url: creatorUrl,
      }
      
      // Add publisher
      videoSchema.publisher = {
        '@type': 'Organization',
        name: DEFAULT_SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}${DEFAULT_IMAGE}`,
        },
      }
    }
    
    // Add category/genre if available
    if (options.category) {
      videoSchema.genre = options.category
    }
    
    // Add keywords if available
    if (options.tags && options.tags.length > 0) {
      videoSchema.keywords = options.tags.join(', ')
    }
    
    structuredData.push(videoSchema)
  }
  
  // Add BreadcrumbList for better navigation
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Watch', url: `${baseUrl}/watch` },
  ]
  
  if (options.title) {
    breadcrumbs.push({ name: options.title, url: absoluteUrl })
  }
  
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  })
  
  // Apply all SEO configurations
  useHead({
    title: options.title || DEFAULT_SITE_NAME,
    htmlAttrs: {
      lang: 'en',
    },
    meta: metaTags,
    link: [
      { rel: 'canonical', href: absoluteUrl },
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
