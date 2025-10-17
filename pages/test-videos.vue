<!-- Test Video Hub - Links to all test pages -->
<template>
  <div class="test-hub">
    <div class="container">
      <h1>SEO & Social Media Sharing Test Hub</h1>
      <p class="subtitle">
        Test different SEO approaches for video pages. Each page uses a different strategy.
        Share each page on Facebook, Twitter, LinkedIn, and WhatsApp to compare results.
      </p>

      <div class="test-grid">
        <div v-for="test in testPages" :key="test.id" class="test-card">
          <div class="test-number">Test {{ test.id }}</div>
          <h2>{{ test.title }}</h2>
          <p class="approach">{{ test.approach }}</p>
          <p class="description">{{ test.description }}</p>
          
          <div class="test-details">
            <h3>Key Features:</h3>
            <ul>
              <li v-for="feature in test.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>

          <div class="actions">
            <NuxtLink :to="test.url" class="btn-primary">
              View Test Page
            </NuxtLink>
            <button @click="copyUrl(test.url)" class="btn-secondary">
              Copy URL
            </button>
          </div>

          <div class="test-url">
            <code>{{ fullUrl(test.url) }}</code>
          </div>
        </div>
      </div>

      <div class="testing-guide">
        <h2>📋 Testing Guide</h2>
        <ol>
          <li>Visit each test page above</li>
          <li>Copy the page URL</li>
          <li>Test on these platforms:
            <ul>
              <li><strong>Facebook:</strong> <a href="https://developers.facebook.com/tools/debug/" target="_blank">Facebook Debugger</a></li>
              <li><strong>Twitter:</strong> <a href="https://cards-dev.twitter.com/validator" target="_blank">Twitter Card Validator</a></li>
              <li><strong>LinkedIn:</strong> Share in a post and preview</li>
              <li><strong>WhatsApp:</strong> Send URL to yourself</li>
            </ul>
          </li>
          <li>Compare the previews - which one works best?</li>
          <li>Check SSR by viewing page source (Ctrl+U)</li>
        </ol>
      </div>

      <div class="comparison-table">
        <h2>📊 Quick Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Approach</th>
              <th>OG Video</th>
              <th>Twitter Card</th>
              <th>Schema</th>
              <th>Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Test 1</td>
              <td>Direct useHead</td>
              <td>✅ Yes</td>
              <td>Player</td>
              <td>VideoObject</td>
              <td>Complete control</td>
            </tr>
            <tr>
              <td>Test 2</td>
              <td>useSeoMeta</td>
              <td>✅ Yes</td>
              <td>Player</td>
              <td>VideoObject</td>
              <td>Clean syntax</td>
            </tr>
            <tr>
              <td>Test 3</td>
              <td>useServerSeoMeta</td>
              <td>✅ Yes</td>
              <td>Summary</td>
              <td>VideoObject</td>
              <td>SSR guaranteed</td>
            </tr>
            <tr>
              <td>Test 4</td>
              <td>Thumbnail Only</td>
              <td>❌ No</td>
              <td>Large Image</td>
              <td>VideoObject</td>
              <td>Compatibility</td>
            </tr>
            <tr>
              <td>Test 5</td>
              <td>Minimal Meta</td>
              <td>❌ No</td>
              <td>Large Image</td>
              <td>None</td>
              <td>Simplicity</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const baseUrl = config.public.frontendUrl

const testPages = [
  {
    id: 1,
    title: 'Direct useHead Approach',
    approach: 'All meta tags inline with useHead()',
    description: 'Traditional approach with complete control over all meta tags.',
    features: [
      'Complete OG video tags',
      'Twitter Player Card',
      'Full Schema.org VideoObject',
      'Direct MP4 video URL',
    ],
    url: '/test-video-1',
  },
  {
    id: 2,
    title: 'useSeoMeta Approach',
    approach: 'Nuxt\'s useSeoMeta composable',
    description: 'Cleaner syntax using Nuxt 3 built-in composable.',
    features: [
      'Cleaner, more concise code',
      'Automatic meta tag handling',
      'OG video tags included',
      'Separate script handling',
    ],
    url: '/test-video-2',
  },
  {
    id: 3,
    title: 'useServerSeoMeta Approach',
    approach: 'Server-only meta tags',
    description: 'Guaranteed SSR with no client-side updates.',
    features: [
      'Server-side only rendering',
      'No hydration overhead',
      'Perfect for static content',
      'Guaranteed crawlable',
    ],
    url: '/test-video-3',
  },
  {
    id: 4,
    title: 'Thumbnail-Only Approach',
    approach: 'No OG video tags',
    description: 'Focus on thumbnail preview without video embedding.',
    features: [
      'No og:video tags (avoids issues)',
      'Maximum compatibility',
      'Works on all platforms',
      'Thumbnail + link approach',
    ],
    url: '/test-video-4',
  },
  {
    id: 5,
    title: 'Minimal Meta Approach',
    approach: 'Only essential tags',
    description: 'Bare minimum required for social media sharing.',
    features: [
      'Only required meta tags',
      'Fastest rendering',
      'No Schema.org',
      'Simplest implementation',
    ],
    url: '/test-video-5',
  },
]

const fullUrl = (path: string) => `${baseUrl}${path}`

const copyUrl = async (path: string) => {
  const url = fullUrl(path)
  try {
    await navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  } catch (err) {
    prompt('Copy this URL:', url)
  }
}

// SEO for the hub page itself
useHead({
  title: 'SEO Test Hub - Video Sharing Tests',
  meta: [
    { name: 'description', content: 'Test hub for comparing different SEO and social media sharing approaches for video pages.' },
    { name: 'robots', content: 'noindex, nofollow' }, // Don't index test pages
  ],
})
</script>

<style scoped>
.test-hub {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  font-size: 36px;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.test-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.test-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.test-number {
  display: inline-block;
  background: #1976d2;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.test-card h2 {
  font-size: 20px;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.approach {
  color: #666;
  font-style: italic;
  margin: 0 0 12px 0;
}

.description {
  color: #333;
  line-height: 1.6;
  margin-bottom: 16px;
}

.test-details h3 {
  font-size: 16px;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.test-details ul {
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.test-details li {
  color: #555;
  margin-bottom: 4px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background: #1976d2;
  color: white;
  text-decoration: none;
  display: block;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.test-url {
  background: #f8f8f8;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.test-url code {
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

.testing-guide {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.testing-guide h2 {
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.testing-guide ol {
  line-height: 1.8;
  color: #333;
}

.testing-guide li {
  margin-bottom: 12px;
}

.testing-guide ul {
  margin-top: 8px;
}

.testing-guide a {
  color: #1976d2;
  text-decoration: none;
}

.testing-guide a:hover {
  text-decoration: underline;
}

.comparison-table {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.comparison-table h2 {
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background: #f8f8f8;
  font-weight: 600;
  color: #1a1a1a;
}

td {
  color: #333;
}

@media (max-width: 768px) {
  .test-grid {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
  }
  
  h1 {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 16px;
  }
}
</style>
