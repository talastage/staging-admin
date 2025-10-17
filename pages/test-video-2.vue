<!-- Test Video Page 2: useSeoMeta approach -->
<template>
  <div class="video-test-page">
    <div class="video-container">
      <img src="/video_thumbnail.png" alt="Test Video Thumbnail" class="thumbnail">
      <div class="video-info">
        <h1>Test Video 2 - useSeoMeta Approach</h1>
        <p class="creator">By Test Creator 2</p>
        <p class="description">
          This is a test video using Nuxt's useSeoMeta composable for cleaner syntax.
          Testing social media preview optimization with structured approach.
        </p>
        <div class="tags">
          <span class="tag">technology</span>
          <span class="tag">demo</span>
          <span class="tag">streaming</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TEST VIDEO PAGE 2: useSeoMeta Approach
 * 
 * Strategy:
 * - Uses Nuxt's useSeoMeta composable
 * - Cleaner, more concise syntax
 * - Automatic handling of some meta tags
 * - Separate useHead for scripts
 */

const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl

const videoData = {
  title: 'Incredible Test Video - Method 2',
  description: 'Experience this incredible test video using useSeoMeta composable. Optimized for maximum social media engagement across all platforms including Facebook, Twitter, LinkedIn, and WhatsApp.',
  thumbnail: `${baseUrl}/video_thumbnail.png`,
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  duration: 653,
  creator: 'Test Creator 2',
  publishedDate: '2025-01-20T14:30:00Z',
}

const pageUrl = `${baseUrl}/test-video-2`

// Use useSeoMeta for meta tags
useSeoMeta({
  title: videoData.title,
  description: videoData.description,
  
  ogType: 'video.other',
  ogTitle: videoData.title,
  ogDescription: videoData.description,
  ogUrl: pageUrl,
  ogImage: videoData.thumbnail,
  ogImageSecureUrl: videoData.thumbnail,
  ogImageType: 'image/png',
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogVideo: videoData.videoUrl,
  ogVideoSecureUrl: videoData.videoUrl,
  ogVideoType: 'video/mp4',
  ogVideoWidth: '1920',
  ogVideoHeight: '1080',
  
  twitterCard: 'player',
  twitterTitle: videoData.title,
  twitterDescription: videoData.description,
  twitterImage: videoData.thumbnail,
  twitterPlayer: pageUrl,
  twitterPlayerWidth: '1920',
  twitterPlayerHeight: '1080',
})

// Separate useHead for links and scripts
useHead({
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
