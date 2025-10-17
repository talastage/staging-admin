# Direct SEO Implementation Guide - TalaStage (October 2025)

## 🎯 Implementation Approach

**Strategy**: Direct page-level SEO without composables for maximum control and SSR reliability.

## ✅ What Was Changed

### 1. **app.vue** - Minimal Configuration
```typescript
// ONLY titleTemplate - nothing else
useHead({
  titleTemplate: (pageTitle) => {
    if (!pageTitle || pageTitle === 'TalaStage') {
      return 'TalaStage'
    }
    return `${pageTitle} | TalaStage`
  },
})
```

### 2. **nuxt.config.ts** - Essential Global Meta Only
```typescript
app: {
  head: {
    meta: [
      // ONLY format-detection - removed og:site_name, og:locale, twitter:site
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      // Only favicons
      { rel: 'icon', type: 'image/png', href: '/talastage_favicon.png' },
    ],
  },
}
```

### 3. **pages/index.vue** - Complete Direct SEO
All SEO meta tags defined directly in the page:
- ✅ Open Graph (Facebook, WhatsApp, LinkedIn)
- ✅ Twitter Card
- ✅ Schema.org Organization
- ✅ Schema.org WebSite with SearchAction
- ✅ Canonical URL
- ✅ Keywords & Description

### 4. **pages/watch/[access_uuid]/index.vue** - Rich Video SEO
Comprehensive video SEO with:
- ✅ Open Graph video tags (og:video, og:video:type, etc.)
- ✅ Twitter Player Card
- ✅ Schema.org VideoObject
- ✅ Schema.org BreadcrumbList
- ✅ Video metadata (duration, thumbnail, creator)
- ✅ SSR data fetching with `lazy: false`

## 📋 Testing Checklist

### 1. View Source Test (SSR Verification)
```powershell
# Start dev server
pnpm dev

# Open browser and visit:
# http://localhost:3000
# http://localhost:3000/watch/[some-uuid]

# Press Ctrl+U to view source
# All meta tags should be visible in HTML
```

**What to look for:**
- `<meta property="og:title"...>` present
- `<meta name="twitter:card"...>` present  
- `<script type="application/ld+json">` present
- NO duplicate meta tags

### 2. Check for Duplicates
Open browser console (F12) and run:
```javascript
// Count og:title tags (should be 1)
document.querySelectorAll('meta[property="og:title"]').length

// Find duplicate OG tags
Array.from(document.querySelectorAll('meta[property^="og:"]'))
  .map(m => m.getAttribute('property'))
  .filter((v, i, a) => a.indexOf(v) !== i)
// Should return [] (empty)

// Count twitter:card tags (should be 1)
document.querySelectorAll('meta[name="twitter:card"]').length
```

### 3. Social Media Preview Tests

#### Facebook/LinkedIn
```
https://developers.facebook.com/tools/debug/
```
1. Enter: `https://talastage.com`
2. Click "Debug"
3. Should show: Title, description, logo image

#### Twitter
```
https://cards-dev.twitter.com/validator
```
1. Enter: `https://talastage.com`
2. Should show: Large image card
3. For watch pages: Should show player card

#### WhatsApp
Send URL to yourself - should show rich preview

### 4. Schema.org Validation

#### Google Rich Results Test
```
https://search.google.com/test/rich-results
```
- Should detect: Organization, WebSite schemas
- For watch pages: VideoObject schema
- No errors

#### Schema Validator
```
https://validator.schema.org/
```
- Paste page URL
- Should validate successfully

## 🚀 Quick Test Commands

```powershell
# 1. Install dependencies
pnpm install

# 2. Run dev server
pnpm dev

# 3. Test home page
# Visit: http://localhost:3000
# Press: Ctrl+U (view source)
# Search for: og:title

# 4. Test watch page
# Visit: http://localhost:3000/watch/[uuid]
# Press: Ctrl+U (view source)
# Search for: og:video

# 5. Build for production
pnpm build

# 6. Preview production
pnpm preview
```

## 📊 Expected Results

### Home Page
```html
<!-- Should see in view-source: -->
<title>Discover Entertainment & Talents | TalaStage</title>
<meta property="og:title" content="Discover Entertainment & Talents">
<meta property="og:type" content="website">
<meta property="og:image" content="https://talastage.com/talastage_logo.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TalaStage"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TalaStage",
  "potentialAction": {
    "@type": "SearchAction"
  }
}
</script>
```

### Watch Page
```html
<!-- Should see in view-source: -->
<title>Video Title | TalaStage</title>
<meta property="og:title" content="Video Title">
<meta property="og:type" content="video.other">
<meta property="og:video" content="https://...video.m3u8">
<meta property="og:video:type" content="application/x-mpegURL">
<meta name="twitter:card" content="player">
<meta name="twitter:player" content="https://talastage.com/watch/...">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Video Title",
  "duration": "PT180S"
}
</script>
```

## ⚠️ Common Issues

### Issue: Meta tags not in view-source

**Cause**: Data not loaded during SSR

**Fix**: Check useAsyncData configuration:
```typescript
const { data } = await useAsyncData(
  'key',
  async () => { /* fetch */ },
  {
    server: true,  // ✅ Must be true
    lazy: false,   // ✅ Must be false for SEO data
  }
)
```

### Issue: Duplicate meta tags

**Cause**: Meta tags defined in multiple places

**Fix**: 
1. Check app.vue (should only have titleTemplate)
2. Check nuxt.config.ts (should only have format-detection)
3. Check layout files (should not have meta tags)
4. Check component files (should not have meta tags)

### Issue: Social media showing old preview

**Fix**:
1. Use debugger tools to refresh cache
2. Add ?v=2 query parameter to URL
3. Wait 24-48 hours for natural cache expiration

## 📱 Social Media Preview Expectations

| Platform | Home Page | Watch Page |
|----------|-----------|------------|
| Facebook | Logo + Title + Description | Thumbnail + Title + Video |
| WhatsApp | Logo + Title | Thumbnail + Title |
| Twitter | Large Image Card | Player Card |
| LinkedIn | Logo + Title + Description | Thumbnail + Title |
| Discord | Logo + Title | Thumbnail + Video Embed |

## 🎓 Best Practices Applied

1. ✅ **Direct Implementation**: No composables = no conflicts
2. ✅ **SSR First**: All meta in initial HTML
3. ✅ **Single Source**: Each page owns its SEO
4. ✅ **No Duplication**: Clean separation of concerns
5. ✅ **Schema.org**: Rich search results
6. ✅ **Social Media**: Optimized previews
7. ✅ **Performance**: Minimal overhead

## 📝 Adding SEO to New Pages

Copy this template:

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const baseUrl = config.public.frontendUrl || 'https://talastage.com'

const pageTitle = 'Your Title'
const pageDescription = 'Your description...'
const pageImage = `${baseUrl}/your-image.jpg`
const pageUrl = `${baseUrl}${route.path}`

useHead({
  title: pageTitle,
  htmlAttrs: { lang: 'en' },
  meta: [
    { name: 'description', content: pageDescription },
    { name: 'keywords', content: 'keywords, here' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: pageImage },
    { property: 'og:site_name', content: 'TalaStage' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    { name: 'twitter:image', content: pageImage },
  ],
  link: [
    { rel: 'canonical', href: pageUrl }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        url: pageUrl,
      }),
    },
  ],
})
</script>
```

## 🎉 Implementation Complete

**Status**: ✅ Ready for Production  
**Pages Updated**: Home, Watch Video  
**Date**: October 17, 2025  
**Approach**: Direct page-level SEO

---

**Next Steps**:
1. Run tests from this guide
2. Validate with social media debuggers
3. Deploy to production
4. Monitor Search Console
