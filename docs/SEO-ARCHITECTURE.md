# SEO Architecture Documentation

## Overview

This document describes the SEO implementation for the TalaStage Nuxt 3 application. Our SEO architecture follows modern best practices, supports both SSR and client-side rendering, and is optimized for all major social media platforms.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Usage Guide](#usage-guide)
4. [Best Practices](#best-practices)
5. [Social Media Support](#social-media-support)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### SEO Hierarchy

Our SEO implementation follows a clean hierarchy to prevent duplication and ensure consistency:

```
┌─────────────────────────────────────────┐
│         nuxt.config.ts                  │
│   (Global defaults for all pages)      │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│            app.vue                      │
│   (Title template only)                 │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Page-Level Components                │
│   (useSeo / useSeoForSSR composables)  │
└─────────────────────────────────────────┘
```

### Key Principles

1. **No Duplication**: Meta tags are defined once per level
2. **Composable-First**: All page SEO managed through composables
3. **SSR-Safe**: Works seamlessly with server-side rendering
4. **Reactive**: SEO updates automatically with data changes
5. **Type-Safe**: Full TypeScript support

---

## Core Components

### 1. `nuxt.config.ts`

**Purpose**: Defines global defaults that apply to all pages

**What it contains**:
- Base meta tags (viewport, format-detection)
- Default Open Graph tags
- Default Twitter Card tags
- Favicon configuration
- Site-wide configuration

**What NOT to put here**:
- Page-specific titles or descriptions
- Dynamic meta tags
- Page-specific structured data

```typescript
// Example from nuxt.config.ts
app: {
  head: {
    meta: [
      { name: 'format-detection', content: 'telephone=no' },
      { property: 'og:site_name', content: 'TalaStage' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  },
}
```

### 2. `app.vue`

**Purpose**: Handles the title template for consistent branding

**What it contains**:
- Title template function only
- No meta tags
- No Open Graph tags

```vue
<script setup lang="ts">
useHead({
  titleTemplate: (pageTitle) => {
    if (!pageTitle || pageTitle === 'TalaStage') {
      return 'TalaStage'
    }
    return `${pageTitle} | TalaStage`
  },
})
</script>
```

### 3. `composables/seo/useSeo.ts`

**Purpose**: Main SEO composable for standard pages (home, about, contact, etc.)

**Features**:
- Comprehensive meta tag generation
- Open Graph support
- Twitter Card support
- Schema.org structured data
- Automatic image optimization
- Reactive updates

**When to use**:
- Standard pages (home, about, contact)
- Article/blog pages
- Profile pages
- Any non-video pages

**Example**:

```typescript
useSeo({
  title: 'Discover Entertainment & Talents',
  description: 'Explore premieres, trending talents...',
  keywords: ['entertainment', 'streaming', 'talents'],
  image: '/og-image.jpg',
  type: 'website',
  structuredDataFactory: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TalaStage',
    url: 'https://talastage.com',
  }),
})
```

### 4. `composables/seo/useSeoForSSR.ts`

**Purpose**: Enhanced SEO composable specifically for video pages

**Features**:
- All features of `useSeo`
- Open Graph video tags
- Twitter Player Card
- VideoObject structured data
- Rich social media previews
- Optimized for WhatsApp, Facebook, LinkedIn, Twitter

**When to use**:
- Video watch pages
- Video galleries
- Any page with video content

**Example**:

```typescript
const seoOptions = computed(() => ({
  title: project.value?.name || 'Watch Video',
  description: project.value?.description,
  image: project.value?.thumbnail_url,
  video: {
    url: project.value?.video_url,
    duration: project.value?.duration,
    width: 1920,
    height: 1080,
  },
  creator: project.value?.creator,
  type: 'video.other',
}))

useSeoForSSR(seoOptions)
```

---

## Usage Guide

### Standard Page Example

```vue
<template>
  <div>
    <h1>About Us</h1>
    <p>Welcome to TalaStage...</p>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from '@/composables/seo/useSeo'

useSeo({
  title: 'About Us',
  description: 'Learn about TalaStage and our mission...',
  keywords: ['about', 'talastage', 'mission'],
  image: '/about-og-image.jpg',
  type: 'website',
})
</script>
```

### Video Page Example

```vue
<template>
  <div>
    <VideoPlayer v-if="video" :video="video" />
  </div>
</template>

<script setup lang="ts">
import { useSeoForSSR } from '@/composables/seo/useSeoForSSR'

const { data: video } = await useAsyncData('video', () => fetchVideo())

const seoOptions = computed(() => ({
  title: video.value?.title || 'Watch Video',
  description: video.value?.description,
  image: video.value?.thumbnail,
  video: video.value ? {
    url: video.value.url,
    duration: video.value.duration,
    width: 1920,
    height: 1080,
  } : null,
  creator: video.value?.creator,
  type: 'video.other',
}))

useSeoForSSR(seoOptions)
</script>
```

### Dynamic/Reactive SEO

For pages with loading states or dynamic content:

```typescript
// ✅ Good: Use computed() for reactive SEO
const seoOptions = computed(() => {
  if (!project.value) {
    return {
      title: 'Loading...',
      noIndex: true, // Don't index loading state
    }
  }
  
  return {
    title: project.value.name,
    description: project.value.description,
    image: project.value.thumbnail,
    noIndex: false, // Index when loaded
  }
})

useSeo(seoOptions)

// ❌ Bad: Static SEO won't update
useSeo({
  title: project.value?.name || 'Loading...', // Won't update!
})
```

---

## Best Practices

### 1. Title Guidelines

- **Length**: 50-60 characters optimal
- **Format**: "Page Title | TalaStage" (handled automatically)
- **Unique**: Every page should have a unique title
- **Descriptive**: Include primary keywords

```typescript
// ✅ Good
title: 'Watch "Amazing Performance" by John Doe'

// ❌ Bad
title: 'Video' // Too generic
title: 'Watch This Amazing Performance by John Doe on TalaStage Platform' // Too long
```

### 2. Description Guidelines

- **Length**: 150-160 characters optimal
- **Compelling**: Include a call-to-action
- **Keywords**: Include relevant keywords naturally
- **Unique**: Every page should have a unique description

```typescript
// ✅ Good
description: 'Watch "Amazing Performance" by John Doe on TalaStage. Exclusive premiere with behind-the-scenes footage. Watch now!'

// ❌ Bad
description: 'Video' // Too short
description: project.description // Might be too long, truncate it
```

### 3. Image Guidelines

- **Size**: 1200x630px optimal for social media
- **Format**: JPG or PNG (avoid SVG for OG images)
- **Absolute URLs**: Always use absolute URLs
- **Alt text**: Provide meaningful alt text

```typescript
// ✅ Good
image: 'https://talastage.com/images/video-thumbnail.jpg',
imageWidth: 1200,
imageHeight: 630,

// ❌ Bad
image: '/images/thumb.jpg', // Relative URL
image: project.thumbnail, // Might be wrong size
```

### 4. Keywords Guidelines

- **Array format**: Use arrays for clarity
- **Relevant**: 5-10 relevant keywords
- **No stuffing**: Avoid keyword stuffing
- **Natural**: Use natural language

```typescript
// ✅ Good
keywords: [
  'video streaming',
  'live performance',
  'entertainment',
  'john doe',
  'talastage',
],

// ❌ Bad
keywords: 'video,streaming,watch,entertainment,platform,...' // Comma string
keywords: ['video', 'video', 'video', 'watch', 'watch'] // Duplication
```

### 5. Structured Data Guidelines

- **Relevant**: Use appropriate schema types
- **Complete**: Fill all required fields
- **Valid**: Test with Google Rich Results Test
- **Updated**: Keep data current

```typescript
// ✅ Good
structuredDataFactory: () => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: video.title,
  description: video.description,
  thumbnailUrl: video.thumbnail,
  uploadDate: video.publishedAt,
  duration: formatDurationISO(video.duration),
})

// ❌ Bad
structuredDataFactory: () => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: video.title, // Missing other required fields
})
```

### 6. NoIndex Guidelines

Use `noIndex: true` for:
- Loading states
- Error pages
- Private/protected pages
- Duplicate content
- Draft/unpublished content

```typescript
// ✅ Good
noIndex: computed(() => 
  !project.value || project.value.status !== 'published'
)

// ❌ Bad
noIndex: false // Always false, even for drafts
```

---

## Social Media Support

### Supported Platforms

Our SEO implementation provides rich previews for:

| Platform | Support | Card Type | Key Features |
|----------|---------|-----------|--------------|
| **Facebook** | ✅ Full | Open Graph | Image, title, description, video |
| **Twitter** | ✅ Full | Player Card / Summary | Image, title, description, video player |
| **LinkedIn** | ✅ Full | Open Graph | Image, title, description |
| **WhatsApp** | ✅ Full | Open Graph | Image, title, description, video |
| **Telegram** | ✅ Full | Open Graph | Image, title, description |
| **Discord** | ✅ Full | Open Graph | Image, title, description |
| **Slack** | ✅ Full | Open Graph | Image, title, description |

### Testing Social Media Previews

#### Facebook/LinkedIn
1. Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your URL
3. Click "Scrape Again" to refresh cache

#### Twitter
1. Go to [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter your URL
3. Preview the card

#### WhatsApp
- Send the URL in a test chat
- Preview will appear automatically

### Video-Specific Features

For video pages using `useSeoForSSR`:

**Open Graph Video Tags**:
```html
<meta property="og:video" content="https://..." />
<meta property="og:video:secure_url" content="https://..." />
<meta property="og:video:type" content="application/x-mpegURL" />
<meta property="og:video:width" content="1920" />
<meta property="og:video:height" content="1080" />
```

**Twitter Player Card**:
```html
<meta name="twitter:card" content="player" />
<meta name="twitter:player" content="https://..." />
<meta name="twitter:player:width" content="1920" />
<meta name="twitter:player:height" content="1080" />
```

---

## Troubleshooting

### Common Issues

#### 1. Meta Tags Not Updating

**Problem**: SEO doesn't update when data loads

**Solution**: Use `computed()` for reactive SEO

```typescript
// ✅ Fix
const seoOptions = computed(() => ({
  title: data.value?.title || 'Loading...',
}))

useSeo(seoOptions)
```

#### 2. Duplicate Meta Tags

**Problem**: Seeing duplicate og:title, og:description, etc.

**Solution**: Remove meta tags from `app.vue` or `nuxt.config.ts`

```typescript
// ❌ Don't do this in app.vue
useHead({
  meta: [
    { property: 'og:title', content: 'TalaStage' }, // Remove!
  ]
})

// ✅ Let pages handle it via composables
```

#### 3. Social Media Cache

**Problem**: Old preview showing on social media

**Solution**: Clear social media cache

- Facebook: Use Sharing Debugger
- Twitter: Use Card Validator
- WhatsApp: Wait 24 hours or use a different URL parameter

#### 4. SSR Not Working

**Problem**: SEO tags not present on page source

**Solution**: Ensure `ssr: true` in nuxt.config.ts and use `lazy: false` in `useAsyncData`

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // ✅ Ensure this is true
})

// In your page
const { data } = await useAsyncData('key', fetchData, {
  server: true, // ✅ Run on server
  lazy: false,  // ✅ Wait for data
})
```

#### 5. Images Not Showing

**Problem**: OG images not displaying in social media

**Solution**: 
- Use absolute URLs
- Ensure image is publicly accessible
- Use correct size (1200x630px recommended)
- Use JPG or PNG format

```typescript
// ✅ Correct
image: 'https://talastage.com/images/og-image.jpg'

// ❌ Wrong
image: '/images/og-image.jpg' // Relative URL
image: 'https://talastage.com/images/og-image.svg' // SVG not supported
```

---

## Validation Tools

### SEO Testing Tools

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Use for: Structured data validation

2. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Use for: Open Graph validation

3. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Use for: Twitter Card validation

4. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Use for: LinkedIn preview validation

5. **PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Use for: Performance and SEO audit

---

## Migration Guide

### For Existing Pages

If you have pages with direct `useHead()` calls:

```vue
<!-- OLD CODE -->
<script setup lang="ts">
useHead({
  title: 'My Page',
  meta: [
    { name: 'description', content: '...' },
    { property: 'og:title', content: '...' },
    // ... many meta tags
  ]
})
</script>

<!-- NEW CODE -->
<script setup lang="ts">
import { useSeo } from '@/composables/seo/useSeo'

useSeo({
  title: 'My Page',
  description: '...',
  image: '/og-image.jpg',
  type: 'website',
})
</script>
```

### Benefits of Migration

- ✅ Less boilerplate code
- ✅ Automatic Open Graph tags
- ✅ Automatic Twitter Card tags
- ✅ Built-in structured data
- ✅ Type safety
- ✅ Reactive updates
- ✅ No duplicate tags

---

## Performance Considerations

### SSR Performance

- SEO composables are lightweight
- Structured data is generated once per render
- Images are lazy-loaded (except OG images)
- Meta tags are deduplicated automatically

### Client-Side Performance

- Reactive computations are memoized
- Updates only trigger when dependencies change
- No unnecessary re-renders

---

## Future Enhancements

Planned improvements:

1. **Automatic Image Optimization**
   - Auto-resize OG images to 1200x630
   - Auto-generate thumbnails

2. **Multilingual SEO**
   - Support for `hreflang` tags
   - Language-specific meta tags

3. **Enhanced Analytics**
   - Track social media referrals
   - Monitor SEO performance

4. **Advanced Video SEO**
   - Video sitemaps
   - Chapter markers in structured data

---

## Support

For questions or issues:

1. Check this documentation first
2. Review the source code in `composables/seo/`
3. Test with validation tools
4. Contact the development team

---

## Changelog

### Version 1.0.0 (October 2025)

- ✅ Cleaned up duplicate meta tags
- ✅ Created `useSeo` composable
- ✅ Created `useSeoForSSR` composable
- ✅ Updated home page implementation
- ✅ Updated watch page implementation
- ✅ Added comprehensive documentation
- ✅ Added social media support
- ✅ Added structured data support

---

## References

- [Nuxt 3 SEO Guide](https://nuxt.com/docs/getting-started/seo-meta)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org VideoObject](https://schema.org/VideoObject)
- [Google Search Central](https://developers.google.com/search/docs)

---

**Last Updated**: October 17, 2025
**Maintained By**: TalaStage Development Team
