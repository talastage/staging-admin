# Social Media Preview Fix for Watch Pages

## Problem Description

When watch pages (`/watch/[access_uuid]`) were shared on social media platforms (WhatsApp, Facebook, Twitter, LinkedIn), they were displaying:
- **Generic title**: "Dummy Video Title" 
- **Same thumbnail for all videos**: Not showing the actual video's thumbnail
- **Generic description**: Static dummy text instead of video-specific content

## Root Cause

The issue was in the **`server/plugins/meta-injector.ts`** file, which runs during Server-Side Rendering (SSR). This plugin was:

1. Using **hardcoded dummy data** instead of fetching real project information
2. Injecting the same Open Graph meta tags for **all videos**, regardless of which video was being shared
3. The dummy data was a placeholder left from development that was never replaced with production logic

```typescript
// ❌ BEFORE (Wrong - Dummy Data)
const project: any = {
  name: 'Dummy Video Title',
  description: 'This is a dummy description for testing purposes.',
  thumbnail_url: `${config.public.frontendUrl}/video_thumbnail.png`,
};
```

## Solution Implemented

Updated `server/plugins/meta-injector.ts` to:

1. **Fetch real project data** from the API during SSR:
   ```typescript
   // ✅ AFTER (Correct - Real Data)
   const apiBaseUrl = config.public.backendUrl || 'https://talastage.com';
   const response = await fetch(`${apiBaseUrl}/api/projects/${uuid}/watch?timezone=UTC`);
   const project: any = await response.json();
   ```

2. **Enhanced Open Graph meta tags** for better social media compatibility:
   - Added `og:image:url` (critical for WhatsApp/Facebook)
   - Added `og:image:secure_url` (HTTPS version for secure contexts)
   - Added `og:image:alt` for accessibility
   - Added `og:image:type` to specify image format
   - Added `thumbnail` meta tag for additional platform support
   - Improved dimensions: 1200x630 (optimal for social media)

3. **Dynamic content** now includes:
   - Actual video title from database
   - Video-specific description (first 160 characters)
   - Creator's name in description
   - Real video thumbnail URL
   - Unique page URL for each video

## Technical Details

### Why This Fix Works

1. **SSR Plugin Timing**: The `meta-injector.ts` plugin runs during the `render:html` hook, which happens **before** the HTML is sent to social media crawlers (Facebook Bot, Twitter Bot, WhatsApp crawler, etc.)

2. **Server-Side Data Fetching**: Social media platforms don't execute JavaScript - they only read the static HTML. By fetching data server-side, we ensure the correct meta tags are in the initial HTML response.

3. **Hook Priority**: The `meta-injector.ts` plugin's meta tags get injected into `html.head` array, ensuring they appear in the final rendered HTML.

### Files Modified

```
server/plugins/meta-injector.ts
```

### How It Works Now

1. User shares a watch page URL: `https://talastage.com/watch/abc123`
2. Social media bot requests the page
3. Nuxt SSR process starts:
   - `meta-injector.ts` plugin detects `/watch/` route
   - Extracts UUID: `abc123`
   - Fetches project data: `GET /api/projects/abc123/watch`
   - Receives real data: title, description, thumbnail_url, creator info
   - Injects dynamic meta tags into HTML head
4. Social media bot receives HTML with correct meta tags
5. Platform displays proper preview with:
   - Real video title
   - Actual thumbnail image
   - Creator's name and description

## Testing

### How to Test the Fix

1. **Share on WhatsApp**:
   - Copy a watch page URL
   - Paste in WhatsApp chat
   - Should show correct video title and thumbnail

2. **Facebook Debugger**:
   - Visit: https://developers.facebook.com/tools/debug/
   - Enter watch page URL
   - Click "Scrape Again"
   - Verify correct og:image, og:title, og:description

3. **Twitter Card Validator**:
   - Visit: https://cards-dev.twitter.com/validator
   - Enter watch page URL
   - Verify card preview shows correct data

4. **LinkedIn Post Inspector**:
   - Visit: https://www.linkedin.com/post-inspector/
   - Enter watch page URL
   - Verify preview shows correct information

### Expected Results

- ✅ Each video shows its unique title
- ✅ Each video shows its actual thumbnail
- ✅ Description includes creator's name
- ✅ Images are properly sized (1200x630)
- ✅ Works on WhatsApp, Facebook, Twitter, LinkedIn

## Deployment

**Deployed**: January 16, 2025
**Commit**: `89b0ff4` - "fix: fetch real project data for social media meta tags in watch page"
**Environment**: Production (AWS Amplify)
**URL**: https://main.d1bb1wzp9sa6ce.amplifyapp.com

## Related Files

- `server/plugins/meta-injector.ts` - Server plugin that injects meta tags
- `pages/watch/[access_uuid]/index.vue` - Watch page component with `useSeoForSSR`
- `composables/seo/useSeoForSSR.ts` - SEO composable (still active for client-side)

## Notes

- The `useSeoForSSR` composable in the watch page component is **still active** and provides additional SEO benefits for client-side navigation
- Both systems work together: `meta-injector.ts` for initial SSR, `useSeoForSSR` for client-side enhancements
- Social media platforms cache previews, so it may take time for old previews to update. Use platform-specific debug tools to force re-scraping

## Future Improvements

Consider:
1. Adding error handling for API failures (currently falls back to not injecting tags)
2. Implementing caching to reduce API calls during SSR
3. Adding structured data (schema.org) for richer search results
4. A/B testing different thumbnail sizes for optimal engagement
