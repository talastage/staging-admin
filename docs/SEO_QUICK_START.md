# Quick Start Guide - SEO for Watch Page

## 🚀 What Was Implemented

### 1. New SEO Composable: `useSeoForSSR`
A powerful, SSR-optimized composable that generates rich social media previews for video content.

**Location:** `composables/seo/useSeoForSSR.ts`

### 2. Enhanced Watch Page
The watch page now uses dynamic SEO based on project data from the API.

**Location:** `pages/watch/[access_uuid]/index.vue`

### 3. Testing Utilities
Helper functions to validate SEO implementation in development.

**Location:** `utils/seo/testSeoTags.ts`

---

## 🎯 Key Features

### Rich Social Media Previews
When you share a watch page URL on:
- **WhatsApp** → Shows thumbnail + title + description
- **Facebook** → Full video card with play button
- **Twitter** → Video player card
- **LinkedIn** → Professional video preview
- **Telegram** → Rich media preview
- **Discord** → Embedded video preview

### SEO Benefits
- ✅ Google Video Search indexing
- ✅ Rich snippets in search results
- ✅ Better click-through rates
- ✅ Professional appearance on social platforms
- ✅ Improved discoverability

---

## 📝 How to Use

### Basic Usage (Watch Page Already Configured)

The watch page is already set up! When you visit:
```
https://talastage.com/watch/[project-uuid]
```

The page automatically:
1. Fetches project data from API
2. Generates SEO meta tags
3. Creates rich preview metadata
4. Serves it all via SSR

### Manual Usage in Other Pages

If you want to use this in other video/project pages:

```typescript
import { useSeoForSSR } from '~/composables/seo/useSeoForSSR'

// In your page setup
useSeoForSSR({
  title: 'My Video Title',
  description: 'This is an amazing video about...',
  image: 'https://example.com/thumbnail.jpg',
  video: {
    url: 'https://example.com/video.m3u8',
    duration: 180, // seconds
    width: 1920,
    height: 1080,
    type: 'application/x-mpegURL'
  },
  creator: {
    id: 1,
    username: 'johndoe',
    display_name: 'John Doe',
    profile_photo: 'https://example.com/avatar.jpg'
  },
  type: 'video.other',
  url: 'https://talastage.com/watch/uuid',
  publishedTime: '2025-01-01T00:00:00Z',
  tags: ['entertainment', 'music', 'video']
})
```

---

## 🧪 Testing Your Implementation

### Method 1: Browser Console (Development Only)

Open browser console on any page and run:

```javascript
// Validate SEO tags
printSeoValidation()

// Get testing URLs
printDebugUrls()
```

### Method 2: Social Media Debuggers

1. **Facebook Sharing Debugger**
   - Go to: https://developers.facebook.com/tools/debug/
   - Paste your watch page URL
   - Click "Debug" or "Scrape Again"
   - Check the preview

2. **Twitter Card Validator**
   - Go to: https://cards-dev.twitter.com/validator
   - Paste your watch page URL
   - Check the card preview

3. **LinkedIn Post Inspector**
   - Go to: https://www.linkedin.com/post-inspector/
   - Paste your watch page URL
   - Verify the preview

4. **Open Graph Checker** (All platforms)
   - Go to: https://opengraphcheck.com/
   - Paste your watch page URL
   - See previews for all platforms

### Method 3: View Page Source

1. Navigate to a watch page
2. Right-click → "View Page Source"
3. Search for `<meta property="og:` to see Open Graph tags
4. Search for `application/ld+json` to see structured data

---

## ✅ What to Check

### Before Sharing:
- [ ] Page title is descriptive (50-60 characters)
- [ ] Description is clear (150-160 characters)
- [ ] Thumbnail image is high quality (1200x630px minimum)
- [ ] All URLs are absolute (start with https://)
- [ ] Video URL is publicly accessible

### After Implementation:
- [ ] Rich preview shows on WhatsApp
- [ ] Facebook shows video card
- [ ] Twitter shows player card
- [ ] LinkedIn shows professional preview
- [ ] Google finds the video in search

---

## 🔧 Common Issues & Solutions

### Issue: Preview Not Showing
**Causes:**
- Social media cache hasn't updated
- Image URL not accessible
- Wrong meta tag format

**Solutions:**
1. Use Facebook Debugger to force re-scrape
2. Verify image URL in browser (should load without login)
3. Check meta tags in page source
4. Wait 24-48 hours for cache to clear

### Issue: Wrong Image Displaying
**Causes:**
- Old cache from previous shares
- Image URL changed

**Solutions:**
1. Clear cache using Facebook Debugger
2. Ensure image URL is stable
3. Use versioned image URLs if needed

### Issue: Video Not Playing in Preview
**Causes:**
- Video URL requires authentication
- Wrong video format
- CORS headers blocking

**Solutions:**
1. Ensure video URL is public
2. Check video format is supported (HLS/MP4)
3. Verify CORS allows embedding

---

## 📊 Expected Results

### Before:
```
Generic preview:
- "Watch Video - TalaStage"
- Generic description
- No thumbnail
- Low engagement
```

### After:
```
Rich preview:
- Actual video title
- Project description
- High-quality thumbnail
- Creator information
- Video duration
- Professional appearance
- Higher click-through rate (2-3x improvement expected)
```

---

## 🎨 Preview Examples

### WhatsApp Preview:
```
╔═══════════════════════════════╗
║  [Video Thumbnail Image]      ║
║                               ║
║  TalaStage                    ║
║  Kevin Kade - NYANJA Teaser   ║
║  Watch this amazing video...  ║
║  talastage.com                ║
╚═══════════════════════════════╝
```

### Facebook Preview:
```
╔═══════════════════════════════╗
║  [Large Video Thumbnail]      ║
║  ────────────────────          ║
║  TALASTAGE.COM                ║
║  Kevin Kade - NYANJA Teaser   ║
║  Watch this amazing video by  ║
║  Kevin Kade on TalaStage.     ║
║                               ║
║  [▶️ Play Video]              ║
╚═══════════════════════════════╝
```

---

## 🚦 Go Live Checklist

Before deploying to production:

- [ ] Test on local development server
- [ ] Verify all meta tags are present (use printSeoValidation())
- [ ] Test preview on at least 3 platforms
- [ ] Check mobile preview on WhatsApp
- [ ] Verify video URL is production URL (not localhost)
- [ ] Ensure images are on CDN/production storage
- [ ] Test with multiple project UUIDs
- [ ] Check page load speed (should be < 2s)
- [ ] Verify SSR is working (view page source shows meta tags)
- [ ] Clear any test/development data

---

## 📚 Additional Resources

### Documentation:
- Full implementation guide: `docs/SEO_IMPLEMENTATION.md`
- Composable code: `composables/seo/useSeoForSSR.ts`
- Testing utilities: `utils/seo/testSeoTags.ts`

### External Links:
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Schema.org VideoObject](https://schema.org/VideoObject)
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)

---

## 💡 Pro Tips

1. **Always use absolute URLs** - Relative URLs won't work in social previews
2. **Optimize images** - Compress thumbnails without losing quality
3. **Test early** - Check previews before major releases
4. **Monitor performance** - Track click-through rates from social media
5. **Keep descriptions short** - 150-160 characters is optimal
6. **Update regularly** - Re-test after making changes to meta tags

---

## 🆘 Need Help?

1. Check browser console for errors
2. Use `printSeoValidation()` to diagnose issues
3. Review the full documentation in `docs/SEO_IMPLEMENTATION.md`
4. Test with debugging tools (Facebook Debugger, etc.)
5. Verify API is returning correct data

---

**Version:** 1.0.0  
**Last Updated:** October 16, 2025  
**Status:** ✅ Production Ready
