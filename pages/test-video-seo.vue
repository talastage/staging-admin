<template>
  <div class="test-video-seo-page">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <v-card class="pa-6">
            <v-card-title class="text-h4 mb-4">
              🎬 Video SEO Test Page
            </v-card-title>
            
            <v-card-subtitle class="mb-6">
              Testing rich video previews for social media platforms
            </v-card-subtitle>

            <v-divider class="mb-6"></v-divider>

            <div class="test-content">
              <!-- Mock Video Player -->
              <div class="video-placeholder mb-6">
                <v-card color="black" height="400" class="d-flex align-center justify-center">
                  <div class="text-center">
                    <v-icon size="80" color="white">mdi-play-circle-outline</v-icon>
                    <p class="text-h6 white--text mt-4">Mock Video Player</p>
                    <p class="text-caption white--text">Testing Video SEO Implementation</p>
                  </div>
                </v-card>
              </div>

              <h2 class="text-h5 mb-2">{{ mockVideoData.title }}</h2>
              <p class="text-subtitle-1 mb-4">By {{ mockVideoData.creator.display_name }} (@{{ mockVideoData.creator.username }})</p>
              
              <p class="mb-4">{{ mockVideoData.description }}</p>

              <v-divider class="my-6"></v-divider>

              <h3 class="text-h6 mb-4">What This Page Tests:</h3>
              <v-list>
                <v-list-item>
                  <v-list-item-title>✅ Open Graph video tags (og:video, og:video:secure_url)</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✅ Twitter Player Card for in-app playback</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✅ Schema.org VideoObject structured data</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✅ Video thumbnail for social media previews</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✅ Video duration and dimensions</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>✅ Creator attribution</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-alert type="success" class="mt-6 mb-6">
                <strong>Testing Video Previews:</strong><br>
                1. View page source - Look for og:video and twitter:player tags<br>
                2. Use Facebook Debugger - Should show video thumbnail and play button<br>
                3. Use Twitter Card Validator - Should show "player" card type<br>
                4. Share on WhatsApp - Should display video thumbnail<br>
                5. Check for VideoObject in structured data (JSON-LD script)
              </v-alert>

              <div class="video-meta-display mt-6">
                <h3 class="text-h6 mb-3">Video Metadata:</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list dense>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Duration</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDuration(mockVideoData.duration) }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Resolution</v-list-item-title>
                          <v-list-item-subtitle>1920x1080 (Full HD)</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Type</v-list-item-title>
                          <v-list-item-subtitle>{{ mockVideoData.type }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-list dense>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Status</v-list-item-title>
                          <v-list-item-subtitle>{{ mockVideoData.status }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Published</v-list-item-title>
                          <v-list-item-subtitle>{{ mockVideoData.publishedTime }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>Format</v-list-item-title>
                          <v-list-item-subtitle>HLS (application/x-mpegURL)</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </div>

              <div class="expected-tags mt-6">
                <h3 class="text-h6 mb-3">Expected Video Tags in Source:</h3>
                <v-card outlined class="pa-4">
                  <pre class="text-caption">{{ expectedVideoTags }}</pre>
                </v-card>
              </div>

              <div class="testing-tools mt-6">
                <h3 class="text-h6 mb-3">Testing Tools:</h3>
                <v-btn
                  color="primary"
                  href="https://developers.facebook.com/tools/debug/"
                  target="_blank"
                  class="mr-2 mb-2"
                >
                  <v-icon left>mdi-facebook</v-icon>
                  Facebook Debugger
                </v-btn>
                <v-btn
                  color="info"
                  href="https://cards-dev.twitter.com/validator"
                  target="_blank"
                  class="mr-2 mb-2"
                >
                  <v-icon left>mdi-twitter</v-icon>
                  Twitter Validator
                </v-btn>
                <v-btn
                  color="success"
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  class="mr-2 mb-2"
                >
                  <v-icon left>mdi-google</v-icon>
                  Rich Results Test
                </v-btn>
              </div>

              <v-divider class="my-6"></v-divider>

              <div class="current-url">
                <h3 class="text-h6 mb-3">Share This URL:</h3>
                <v-text-field
                  :value="currentUrl"
                  readonly
                  outlined
                  dense
                  append-icon="mdi-content-copy"
                  @click:append="copyUrl"
                ></v-text-field>
                <v-snackbar v-model="copied" :timeout="2000" color="success">
                  URL copied to clipboard!
                </v-snackbar>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useSeoForSSR } from '@/composables/seo/useSeoForSSR'
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'default',
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
  },
})

const config = useRuntimeConfig()
const frontendUrl = config.public.frontendUrl || 'https://talastage.com'
const currentUrl = computed(() => `${frontendUrl}/test-video-seo`)
const copied = ref(false)

// Mock video data for testing
const mockVideoData = {
  title: 'Amazing Performance - SEO Test Video',
  description: 'This is a test video for validating rich video SEO implementation. It demonstrates Open Graph video tags, Twitter Player Cards, and Schema.org VideoObject markup for optimal social media sharing.',
  creator: {
    id: 1,
    username: 'testcreator',
    display_name: 'Test Creator',
    profile_photo: `${frontendUrl}/talastage_logo.png`,
  },
  thumbnail_url: `${frontendUrl}/talastage_logo.png`,
  video_url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
  duration: 600, // 10 minutes
  type: 'Performance',
  status: 'published',
  publishedTime: new Date().toISOString(),
  access_uuid: 'test-video-uuid-12345',
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')} (${seconds}s)`
}

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    copied.value = true
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

const expectedVideoTags = `<!-- Open Graph Video Tags -->
<meta property="og:video" content="${mockVideoData.video_url}" />
<meta property="og:video:secure_url" content="${mockVideoData.video_url}" />
<meta property="og:video:type" content="application/x-mpegURL" />
<meta property="og:video:width" content="1920" />
<meta property="og:video:height" content="1080" />

<!-- Twitter Player Card -->
<meta name="twitter:card" content="player" />
<meta name="twitter:player" content="${currentUrl.value}" />
<meta name="twitter:player:width" content="1920" />
<meta name="twitter:player:height" content="1080" />
<meta name="twitter:player:stream" content="${mockVideoData.video_url}" />

<!-- VideoObject Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "${mockVideoData.title}",
  "thumbnailUrl": "${mockVideoData.thumbnail_url}",
  "duration": "PT10M0S"
}
<\/script>`

// Apply video SEO using useSeoForSSR (simplified version)
useSeoForSSR({
  title: mockVideoData.title,
  description: mockVideoData.description,
  image: mockVideoData.thumbnail_url,
  video: {
    url: mockVideoData.video_url,
    duration: mockVideoData.duration,
    width: 1920,
    height: 1080,
    type: 'application/x-mpegURL',
  },
  url: currentUrl.value,
  creator: mockVideoData.creator,
  publishedTime: mockVideoData.publishedTime,
  tags: ['test', 'video', 'seo', 'performance', mockVideoData.type],
})
</script>

<style scoped>
.test-video-seo-page {
  min-height: 100vh;
  padding: 40px 0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.test-content {
  line-height: 1.8;
}

.video-placeholder {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
}

:deep(.v-card) {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 600;
}

.video-meta-display {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}
</style>
