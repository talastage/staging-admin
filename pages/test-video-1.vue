<!-- Test Video Page 1: Direct useHead with all meta tags inline -->
<template>
  <div class="video-test-page">
    <div class="video-container">
      <img src="/video_thumbnail.png" alt="Test Video Thumbnail" class="thumbnail">
      <div class="video-info">
        <h1>Test Video 1 - Direct useHead Approach</h1>
        <p class="creator">By Test Creator 1</p>
        <p class="description">
          This is a test video using direct useHead with all meta tags defined inline.
          Testing Open Graph video preview for social media sharing on Facebook, WhatsApp, Twitter, and LinkedIn.
        </p>
        <div class="tags">
          <span class="tag">entertainment</span>
          <span class="tag">test</span>
          <span class="tag">video</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TEST VIDEO PAGE 1: Direct useHead Approach
 * 
 * Strategy:
 * - All meta tags defined inline with useHead()
 * - Complete OG tags including og:video
 * - Twitter Player Card
 * - Schema.org VideoObject
 * - Dummy MP4 video URL for testing
 */

const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl

// Test data
const videoData = {
  title: 'Amazing Test Video - Method 1',
  description: 'Watch this amazing test video showcasing direct useHead approach for SEO and social media sharing. Perfect for testing Facebook, WhatsApp, Twitter, and LinkedIn previews.',
  thumbnail: `${baseUrl}/video_thumbnail.png`,
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Public test video
  duration: 596,
  creator: {
    name: 'Test Creator 1',
    url: `${baseUrl}/test-creator-1`,
  },
  publishedDate: '2025-01-15T10:00:00Z',
  tags: ['entertainment', 'test', 'video', 'streaming'],
}

const pageUrl = `${baseUrl}/test-video-1`

// Direct useHead approach
useHead({
  title: videoData.title,
  meta: [
    { name: 'description', content: videoData.description },
    { name: 'keywords', content: videoData.tags.join(', ') },
    
    // Open Graph
    { property: 'og:type', content: 'video.other' },
    { property: 'og:title', content: videoData.title },
    { property: 'og:description', content: videoData.description },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: videoData.thumbnail },
    { property: 'og:image:secure_url', content: videoData.thumbnail },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:video', content: videoData.videoUrl },
    { property: 'og:video:secure_url', content: videoData.videoUrl },
    { property: 'og:video:type', content: 'video/mp4' },
    { property: 'og:video:width', content: '1920' },
    { property: 'og:video:height', content: '1080' },
    { property: 'video:duration', content: String(videoData.duration) },
    { property: 'video:release_date', content: videoData.publishedDate },
    
    // Twitter
    { name: 'twitter:card', content: 'player' },
    { name: 'twitter:title', content: videoData.title },
    { name: 'twitter:description', content: videoData.description },
    { name: 'twitter:image', content: videoData.thumbnail },
    { name: 'twitter:player', content: pageUrl },
    { name: 'twitter:player:width', content: '1920' },
    { name: 'twitter:player:height', content: '1080' },
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
        contentUrl: videoData.videoUrl,
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
