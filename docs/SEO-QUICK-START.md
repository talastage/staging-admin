# SEO Quick Start Guide

> 🚀 Get started with SEO in your Nuxt 3 pages in 5 minutes

## TL;DR

1. Import the appropriate composable
2. Call it with your page data
3. Done! ✨

## For Standard Pages

```vue
<template>
  <div>
    <h1>My Page</h1>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from '@/composables/seo/useSeo'

useSeo({
  title: 'My Page Title',
  description: 'A compelling description of my page',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  image: '/og-image.jpg',
})
</script>
```

## For Video Pages

```vue
<template>
  <div>
    <VideoPlayer :video="video" />
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
  } : null,
}))

useSeoForSSR(seoOptions)
</script>
```

## Common Options

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `title` | string | Page title (50-60 chars) | `'Watch Amazing Video'` |
| `description` | string | Meta description (150-160 chars) | `'Watch this amazing video...'` |
| `keywords` | string[] | SEO keywords | `['video', 'streaming']` |
| `image` | string | OG image (1200x630px) | `'/og-image.jpg'` |
| `type` | string | Content type | `'website'` or `'article'` |
| `noIndex` | boolean | Prevent indexing | `true` for drafts |

## Video-Specific Options

| Option | Type | Description |
|--------|------|-------------|
| `video.url` | string | Video URL (absolute) |
| `video.duration` | number | Duration in seconds |
| `video.width` | number | Video width (default: 1920) |
| `video.height` | number | Video height (default: 1080) |
| `creator` | object | Creator info for attribution |

## Rules to Remember

### ✅ DO

- Use `computed()` for reactive SEO
- Use absolute URLs for images
- Keep titles under 60 characters
- Keep descriptions under 160 characters
- Test with social media debuggers

### ❌ DON'T

- Add meta tags in `app.vue` or `nuxt.config.ts`
- Use relative URLs for images
- Duplicate SEO logic across pages
- Forget to set `noIndex: true` for drafts
- Use `useHead()` directly (use composables instead)

## Testing Your SEO

1. **View Page Source** (Ctrl+U)
   - Check if meta tags are present
   - Verify og:title, og:description, og:image

2. **Facebook Debugger**
   - https://developers.facebook.com/tools/debug/
   - Paste your URL and check preview

3. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Paste your URL and check preview

## Need More Help?

📖 Read the full documentation: [`docs/SEO-ARCHITECTURE.md`](./SEO-ARCHITECTURE.md)

## Examples from the App

### Home Page
```typescript
// pages/index.vue
useSeo({
  title: 'Discover Entertainment & Talents',
  description: 'Explore premieres, trending talents...',
  keywords: ['entertainment', 'streaming', 'talents'],
  image: '/talastage_logo.png',
  type: 'website',
})
```

### Watch Page
```typescript
// pages/watch/[access_uuid]/index.vue
const seoOptions = computed(() => ({
  title: project.value?.name || 'Watch Video',
  description: project.value?.description,
  image: project.value?.thumbnail_url,
  video: {
    url: project.value?.video_url,
    duration: project.value?.duration,
  },
  creator: project.value?.creator,
  type: 'video.other',
}))

useSeoForSSR(seoOptions)
```

---

**Quick Reference**: [Full Documentation](./SEO-ARCHITECTURE.md) | **Report Issues**: Contact dev team
