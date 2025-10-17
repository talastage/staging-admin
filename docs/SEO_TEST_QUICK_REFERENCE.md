# SEO Test Quick Reference Guide

## 🚀 Quick Start

**Test Hub URL:** `/test-videos`
- View all 5 test approaches in one page
- Copy URLs for each test
- Compare approaches side-by-side

## 📋 Test Pages Overview

### Test 1: Direct useHead Approach
- **URL:** `/test-video-1`
- **Strategy:** Traditional `useHead()` with all meta tags inline
- **Video:** BigBuckBunny.mp4 (596 seconds)
- **Meta Tags:** Complete OG video tags, Twitter Player Card, Schema.org VideoObject
- **Best For:** Complete control over all meta tags

### Test 2: useSeoMeta Approach
- **URL:** `/test-video-2`
- **Strategy:** Nuxt 3's `useSeoMeta()` composable
- **Video:** ElephantsDream.mp4 (653 seconds)
- **Meta Tags:** Cleaner syntax, auto-handled meta tags, OG video included
- **Best For:** Clean, maintainable code

### Test 3: useServerSeoMeta Approach
- **URL:** `/test-video-3`
- **Strategy:** Server-only rendering with `useServerSeoMeta()`
- **Video:** ForBiggerBlazes.mp4 (15 seconds)
- **Meta Tags:** SSR guaranteed, no client updates, Twitter summary
- **Best For:** Static content, guaranteed crawlability

### Test 4: Thumbnail-Only Approach
- **URL:** `/test-video-4`
- **Strategy:** No `og:video` tags, focus on thumbnail
- **Video:** BigBuckBunny.mp4 (for reference)
- **Meta Tags:** Only image tags, `video.other` type, `summary_large_image` card
- **Best For:** Maximum platform compatibility

### Test 5: Minimal Meta Approach
- **URL:** `/test-video-5`
- **Strategy:** Only essential meta tags
- **Video:** BigBuckBunny.mp4 (for reference)
- **Meta Tags:** Title, description, image, url, type only
- **Best For:** Simplicity, fast rendering

## 🧪 Testing Checklist

### For Each Test Page:

#### 1. Facebook Testing
1. Open [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Paste test page URL
3. Click "Debug"
4. Check for:
   - ✅ No errors or warnings
   - ✅ Correct title and description
   - ✅ Thumbnail displays properly
   - ✅ Video player appears (if og:video tags present)
   - ✅ All OG tags show in "Meta Tags" section

#### 2. Twitter Testing
1. Open [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Paste test page URL
3. Click "Preview Card"
4. Check for:
   - ✅ Card type correct (player vs summary_large_image)
   - ✅ Image displays
   - ✅ Title and description correct
   - ✅ Player iframe appears (for player cards)

#### 3. SSR Verification
1. Open test page in browser
2. Press `Ctrl+U` (View Source)
3. Search for `og:title` in source
4. Check for:
   - ✅ All meta tags present in HTML source
   - ✅ No "Loading..." or blank meta tags
   - ✅ Video URL is complete and valid
   - ✅ Schema.org JSON-LD present (for tests 1-3)

#### 4. LinkedIn Testing
1. Create a new post in LinkedIn
2. Paste test page URL
3. Wait for preview to load
4. Check for:
   - ✅ Thumbnail appears
   - ✅ Title and description correct
   - ✅ Link is clickable

#### 5. WhatsApp Testing
1. Send URL to yourself or a test contact
2. Check for:
   - ✅ Rich preview appears
   - ✅ Thumbnail displays
   - ✅ Title shows correctly

## 📊 Results Tracking Template

Copy this template for each test:

```markdown
## Test [1-5]: [Approach Name]

### Facebook
- Errors/Warnings: [ ]
- Thumbnail: [ ] Yes [ ] No
- Video Player: [ ] Yes [ ] No [ ] N/A
- Rating: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

### Twitter
- Card Type: _____________
- Preview Quality: [ ] Excellent [ ] Good [ ] Fair [ ] Poor
- Player Works: [ ] Yes [ ] No [ ] N/A

### LinkedIn
- Preview: [ ] Yes [ ] No
- Quality: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

### WhatsApp
- Rich Preview: [ ] Yes [ ] No
- Quality: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

### SSR Verification
- Meta Tags in Source: [ ] Yes [ ] No
- Schema.org Present: [ ] Yes [ ] No [ ] N/A

### Notes:
_______________________________________
```

## 🎯 Expected Outcomes

### Test 1 (Direct useHead)
- **Expected:** Full video player on Facebook, complete meta tags in all validators
- **Watch For:** Proper Schema.org rendering, all OG video tags present

### Test 2 (useSeoMeta)
- **Expected:** Similar to Test 1 but cleaner implementation
- **Watch For:** Auto-generated meta tags, no duplicates

### Test 3 (useServerSeoMeta)
- **Expected:** Perfect SSR, summary card (not player) on Twitter
- **Watch For:** Meta tags only in source, not updated client-side

### Test 4 (Thumbnail-Only)
- **Expected:** Best compatibility, large image preview, no video player
- **Watch For:** No warnings about missing video tags

### Test 5 (Minimal Meta)
- **Expected:** Basic preview with thumbnail, fastest rendering
- **Watch For:** Whether minimal tags are sufficient for good previews

## 🔧 Troubleshooting

### Facebook Not Showing Video
- Check if URL is HTTPS and publicly accessible
- Verify video URL is direct MP4 (not HLS)
- Facebook may not support all video formats

### Twitter Card Not Loading
- Clear Twitter cache: Add `?v=1` to URL and increment
- Check card type matches content (player vs summary)

### No Meta Tags in Source
- Check if SSR is enabled for route in `nuxt.config.ts`
- Verify `<ClientOnly>` not wrapping page content
- Look for loading screens blocking SSR

### Thumbnail Not Showing
- Verify `/public/video_thumbnail.png` exists
- Check image is 1200x630px (recommended)
- Ensure image URL is absolute with domain

## 🏆 Selecting the Winner

After testing all 5 approaches, choose based on:

1. **Compatibility:** Works on all platforms (Facebook, Twitter, LinkedIn, WhatsApp)
2. **Quality:** Best preview appearance with no errors
3. **Performance:** Fast rendering, no unnecessary tags
4. **Maintainability:** Clean code, easy to update
5. **SEO:** Good search engine indexing

### Decision Matrix

| Criteria | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 |
|----------|--------|--------|--------|--------|--------|
| Facebook | [ ]    | [ ]    | [ ]    | [ ]    | [ ]    |
| Twitter  | [ ]    | [ ]    | [ ]    | [ ]    | [ ]    |
| LinkedIn | [ ]    | [ ]    | [ ]    | [ ]    | [ ]    |
| WhatsApp | [ ]    | [ ]    | [ ]    | [ ]    | [ ]    |
| SSR      | [ ]    | [ ]    | [ ]    | [ ]    | [ ]    |
| Clean    | [ ]    | [ ]    | [ ]    | [ ]    | [ ]    |
| **Total**| [ ]    | [ ]    | [ ]    | [ ]    | [ ]    |

Rate each: ⭐⭐⭐ (3) = Excellent, ⭐⭐ (2) = Good, ⭐ (1) = Fair, ❌ (0) = Poor

## 📝 Next Steps After Testing

1. **Document Winner:** Note which approach worked best
2. **Apply to Production:** Update `pages/watch/[access_uuid]/index.vue` with winning approach
3. **Update Home Page:** Apply same pattern to `pages/index.vue` if needed
4. **Clean Up:** Remove test pages or keep for future reference
5. **Monitor:** Check real production URLs with validators
6. **Iterate:** Adjust based on real-world performance

## 🔗 Useful Links

- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Inspector:** Post in LinkedIn to preview
- **Schema.org Validator:** https://validator.schema.org/
- **Google Rich Results:** https://search.google.com/test/rich-results

## 💡 Pro Tips

1. **Clear Caches:** Social platforms cache previews. Use debugger tools to refresh.
2. **Test on Mobile:** Some previews differ between desktop and mobile.
3. **Check Loading Time:** Slow pages may not get properly crawled.
4. **Verify HTTPS:** Many platforms require secure URLs.
5. **Test Multiple Times:** First crawl might fail, try again.

---

**Last Updated:** January 2025  
**Commit:** 5302052
