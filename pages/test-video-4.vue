<!-- Test Video Page 4: Thumbnail-only approach (no video tags) -->
<template>
  <div class="video-test-page">
    <div class="video-container">
      <img src="/video_thumbnail.png" alt="Test Video Thumbnail" class="thumbnail">
      <div class="video-info">
        <h1>Test Video 4 - Thumbnail Only Approach</h1>
        <p class="creator">By Test Creator 4</p>
        <p class="description">
          This is a test video focusing on thumbnail preview only, without og:video tags.
          This approach works best for platforms that don't support direct video embedding.
        </p>
        <div class="tags">
          <span class="tag">simple</span>
          <span class="tag">thumbnail</span>
          <span class="tag">compatible</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TEST VIDEO PAGE 4: Thumbnail-Only Approach
 * 
 * Strategy:
 * - NO og:video tags (avoids HLS issues)
 * - Focus on og:image for thumbnail preview
 * - og:type = 'video.other' tells platforms it's video content
 * - Links to page instead of direct video
 * - Works reliably across all platforms
 */

const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl

const videoData = {
  title: 'Stunning Test Video - Method 4 (Thumbnail Focus)',
  description: 'Watch this stunning test video with thumbnail-focused SEO approach. Optimized for maximum compatibility across all social media platforms. Click to watch the full video on our platform.',
  thumbnail: `${baseUrl}/video_thumbnail.png`,
  creator: 'Test Creator 4',
  publishedDate: '2025-02-05T16:45:00Z',
  duration: 180,
}

const pageUrl = `${baseUrl}/test-video-4`

// Focus on image/thumbnail approach - NO video tags
useHead({
  title: videoData.title,
  meta: [
    { name: 'description', content: videoData.description },
    { name: 'keywords', content: 'video, thumbnail, preview, social media, compatible' },
    
    // Open Graph - Type video.other but NO og:video tags
    { property: 'og:type', content: 'video.other' },
    { property: 'og:title', content: videoData.title },
    { property: 'og:description', content: videoData.description },
    { property: 'og:url', content: pageUrl },
    { property: 'og:site_name', content: 'TalaStage' },
    
    // Focus on high-quality image
    { property: 'og:image', content: videoData.thumbnail },
    { property: 'og:image:secure_url', content: videoData.thumbnail },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: videoData.title },
    
    // Twitter - summary_large_image (not player)
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: videoData.title },
    { name: 'twitter:description', content: videoData.description },
    { name: 'twitter:image', content: videoData.thumbnail },
    { name: 'twitter:image:alt', content: videoData.title },
  ],
  link: [
    { rel: 'canonical', href: pageUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: videoData.title,
        description: videoData.description,
        thumbnailUrl: videoData.thumbnail,
        uploadDate: videoData.publishedDate,
        duration: `PT${videoData.duration}S`,
        // No contentUrl - indicates video requires visiting page
        embedUrl: pageUrl,
      }),
    },
  ],
})
</script>

<style scoped>
.video-test-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.video-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.thumbnail {
  width: 100%;
  height: auto;
  display: block;
}

.video-info {
  padding: 24px;
}

.video-info h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1a1a1a;
}

.creator {
  color: #666;
  margin: 0 0 16px 0;
}

.description {
  line-height: 1.6;
  color: #333;
  margin-bottom: 16px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
}
</style>
