<!-- Test Video Page 3: useServerSeoMeta approach -->
<template>
  <div class="video-test-page">
    <div class="video-container">
      <img src="/video_thumbnail.png" alt="Test Video Thumbnail" class="thumbnail">
      <div class="video-info">
        <h1>Test Video 3 - useServerSeoMeta Approach</h1>
        <p class="creator">By Test Creator 3</p>
        <p class="description">
          This is a test video using useServerSeoMeta for guaranteed server-side rendering.
          Ensures all meta tags are present in initial HTML for web crawlers.
        </p>
        <div class="tags">
          <span class="tag">performance</span>
          <span class="tag">ssr</span>
          <span class="tag">optimization</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TEST VIDEO PAGE 3: useServerSeoMeta Approach
 * 
 * Strategy:
 * - Uses useServerSeoMeta for server-only meta tags
 * - Guaranteed SSR rendering
 * - No client-side meta tag updates
 * - Best for static content
 */

const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl

const videoData = {
  title: 'Epic Test Video - Method 3',
  description: 'Discover this epic test video powered by useServerSeoMeta for guaranteed SSR. Optimized specifically for social media crawlers with server-side meta tag generation.',
  thumbnail: `${baseUrl}/video_thumbnail.png`,
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  duration: 15,
  creator: 'Test Creator 3',
  publishedDate: '2025-02-01T09:15:00Z',
}

const pageUrl = `${baseUrl}/test-video-3`

// useServerSeoMeta - only renders on server
useServerSeoMeta({
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
})

// useServerHead for server-only scripts and links
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
