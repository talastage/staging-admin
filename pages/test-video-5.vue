<!-- Test Video Page 5: Minimal meta tags approach -->
<template>
  <div class="video-test-page">
    <div class="video-container">
      <img src="/video_thumbnail.png" alt="Test Video Thumbnail" class="thumbnail">
      <div class="video-info">
        <h1>Test Video 5 - Minimal Meta Approach</h1>
        <p class="creator">By Test Creator 5</p>
        <p class="description">
          This is a test video using only essential meta tags required by Facebook and Twitter.
          Minimal approach to test if less is more for social media crawlers.
        </p>
        <div class="tags">
          <span class="tag">minimal</span>
          <span class="tag">essential</span>
          <span class="tag">required</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TEST VIDEO PAGE 5: Minimal Meta Tags Approach
 * 
 * Strategy:
 * - Only essential meta tags (title, description, image, url)
 * - No og:video tags
 * - No Twitter player card
 * - Minimal Schema.org
 * - Tests if simpler is better
 * - Using useSeoMeta for better SSR compatibility
 */

const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl

const pageUrl = `${baseUrl}/test-video-5`
const imageUrl = `${baseUrl}/video_thumbnail.png`

// Minimal approach - only required tags using useSeoMeta (better for SSR)
useSeoMeta({
  title: 'Minimalist Test Video - Method 5',
  description: 'Simple and clean test video with minimal meta tags. Testing if essential meta tags only provide better social media compatibility and faster rendering.',
  
  // Open Graph
  ogTitle: 'Minimalist Test Video - Method 5',
  ogDescription: 'Simple and clean test video with minimal meta tags. Testing if essential meta tags only provide better social media compatibility and faster rendering.',
  ogImage: imageUrl,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogUrl: pageUrl,
  ogType: 'video.other',
  
  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: 'Minimalist Test Video - Method 5',
  twitterDescription: 'Simple and clean test video with minimal meta tags. Testing if essential meta tags only provide better social media compatibility and faster rendering.',
  twitterImage: imageUrl,
})

useHead({
  link: [
    { rel: 'canonical', href: pageUrl },
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
