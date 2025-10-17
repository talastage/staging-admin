// utils/seo/testSeoTags.ts
/**
 * Utility function to test and validate SEO tags
 * Use this in development to ensure proper SEO implementation
 */

export interface SeoValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  tags: {
    title?: string
    description?: string
    ogTags: Record<string, string>
    twitterTags: Record<string, string>
    schemaOrg?: any
  }
}

/**
 * Validate SEO implementation on current page
 * Call this in browser console or in development tools
 */
export function validateSeoTags(): SeoValidationResult {
  const result: SeoValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    tags: {
      ogTags: {},
      twitterTags: {}
    }
  }

  // Check title
  const title = document.querySelector('title')?.textContent
  if (!title) {
    result.errors.push('Missing page title')
    result.isValid = false
  } else {
    result.tags.title = title
    if (title.length < 30) {
      result.warnings.push('Title is too short (recommended: 50-60 characters)')
    }
    if (title.length > 70) {
      result.warnings.push('Title is too long (recommended: 50-60 characters)')
    }
  }

  // Check meta description
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content')
  if (!description) {
    result.errors.push('Missing meta description')
    result.isValid = false
  } else {
    result.tags.description = description
    if (description.length < 120) {
      result.warnings.push('Description is too short (recommended: 150-160 characters)')
    }
    if (description.length > 160) {
      result.warnings.push('Description is too long (recommended: 150-160 characters)')
    }
  }

  // Check Open Graph tags
  const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']
  requiredOgTags.forEach(tag => {
    const element = document.querySelector(`meta[property="${tag}"]`)
    const content = element?.getAttribute('content')
    if (!content) {
      result.errors.push(`Missing required Open Graph tag: ${tag}`)
      result.isValid = false
    } else {
      result.tags.ogTags[tag] = content
    }
  })

  // Check og:image requirements
  const ogImage = result.tags.ogTags['og:image']
  if (ogImage) {
    if (!ogImage.startsWith('https://')) {
      result.errors.push('og:image must use HTTPS')
      result.isValid = false
    }
    
    // Check for image dimensions
    const ogImageWidth = document.querySelector('meta[property="og:image:width"]')?.getAttribute('content')
    const ogImageHeight = document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')
    
    if (!ogImageWidth || !ogImageHeight) {
      result.warnings.push('Missing og:image:width or og:image:height (recommended for better previews)')
    } else if (parseInt(ogImageWidth) < 1200 || parseInt(ogImageHeight) < 630) {
      result.warnings.push('Image dimensions are below recommended size (1200x630)')
    }
  }

  // Check Twitter Card tags
  const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']
  requiredTwitterTags.forEach(tag => {
    const element = document.querySelector(`meta[name="${tag}"]`)
    const content = element?.getAttribute('content')
    if (!content) {
      result.warnings.push(`Missing Twitter Card tag: ${tag}`)
    } else {
      result.tags.twitterTags[tag] = content
    }
  })

  // Check for video-specific tags
  const ogVideo = document.querySelector('meta[property="og:video"]')?.getAttribute('content')
  if (ogVideo) {
    result.tags.ogTags['og:video'] = ogVideo
    
    // Check for video metadata
    const videoWidth = document.querySelector('meta[property="og:video:width"]')?.getAttribute('content')
    const videoHeight = document.querySelector('meta[property="og:video:height"]')?.getAttribute('content')
    const videoType = document.querySelector('meta[property="og:video:type"]')?.getAttribute('content')
    
    if (!videoWidth || !videoHeight) {
      result.warnings.push('Missing video dimensions (og:video:width, og:video:height)')
    }
    if (!videoType) {
      result.warnings.push('Missing video type (og:video:type)')
    }

    // Check for Twitter player card
    const twitterCard = result.tags.twitterTags['twitter:card']
    if (twitterCard !== 'player') {
      result.suggestions.push('Consider using twitter:card="player" for video content')
    }
  }

  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')
  if (!canonical) {
    result.warnings.push('Missing canonical URL')
  } else if (!canonical.startsWith('https://')) {
    result.errors.push('Canonical URL must use HTTPS')
    result.isValid = false
  }

  // Check structured data (Schema.org)
  const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]')
  if (schemaScripts.length === 0) {
    result.warnings.push('No structured data (Schema.org) found')
  } else {
    try {
      schemaScripts.forEach((script) => {
        const schema = JSON.parse(script.textContent || '{}')
        if (!result.tags.schemaOrg) result.tags.schemaOrg = []
        result.tags.schemaOrg.push(schema)
      })
      
      // Validate VideoObject schema if present
      const videoSchema = result.tags.schemaOrg?.find((s: any) => s['@type'] === 'VideoObject')
      if (videoSchema) {
        const requiredVideoFields = ['name', 'description', 'thumbnailUrl', 'uploadDate']
        requiredVideoFields.forEach(field => {
          if (!videoSchema[field]) {
            result.warnings.push(`VideoObject schema missing field: ${field}`)
          }
        })
      }
    } catch (e) {
      result.errors.push('Invalid JSON-LD structured data')
      result.isValid = false
    }
  }

  // General suggestions
  if (result.errors.length === 0 && result.warnings.length === 0) {
    result.suggestions.push('SEO implementation looks great! Test previews using social media debugger tools.')
  }

  return result
}

/**
 * Print SEO validation results to console in a formatted way
 */
export function printSeoValidation(): void {
  const result = validateSeoTags()
  
  console.group('🔍 SEO Validation Results')
  console.log(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`)
  
  if (result.errors.length > 0) {
    console.group('❌ Errors')
    result.errors.forEach(error => console.error(error))
    console.groupEnd()
  }
  
  if (result.warnings.length > 0) {
    console.group('⚠️ Warnings')
    result.warnings.forEach(warning => console.warn(warning))
    console.groupEnd()
  }
  
  if (result.suggestions.length > 0) {
    console.group('💡 Suggestions')
    result.suggestions.forEach(suggestion => console.info(suggestion))
    console.groupEnd()
  }
  
  console.group('📋 Tags Found')
  console.log('Title:', result.tags.title)
  console.log('Description:', result.tags.description)
  console.log('Open Graph Tags:', result.tags.ogTags)
  console.log('Twitter Tags:', result.tags.twitterTags)
  if (result.tags.schemaOrg) {
    console.log('Structured Data:', result.tags.schemaOrg)
  }
  console.groupEnd()
  
  console.groupEnd()
}

/**
 * Generate preview URLs for testing on different platforms
 */
export function getSeoDebugUrls(pageUrl: string): Record<string, string> {
  const encodedUrl = encodeURIComponent(pageUrl)
  
  return {
    facebook: `https://developers.facebook.com/tools/debug/?q=${encodedUrl}`,
    twitter: `https://cards-dev.twitter.com/validator`,
    linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodedUrl}`,
    openGraph: `https://opengraphcheck.com/result.php?url=${encodedUrl}`,
    richResults: `https://search.google.com/test/rich-results?url=${encodedUrl}`,
    schema: `https://validator.schema.org/#url=${encodedUrl}`
  }
}

/**
 * Print debug URLs to console
 */
export function printDebugUrls(): void {
  const currentUrl = window.location.href
  const urls = getSeoDebugUrls(currentUrl)
  
  console.group('🔗 SEO Testing URLs')
  console.log('Facebook Debugger:', urls.facebook)
  console.log('Twitter Validator:', urls.twitter)
  console.log('LinkedIn Inspector:', urls.linkedin)
  console.log('Open Graph Checker:', urls.openGraph)
  console.log('Google Rich Results:', urls.richResults)
  console.log('Schema Validator:', urls.schema)
  console.groupEnd()
}

// Make functions available globally in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    (window as any).validateSeoTags = validateSeoTags;
    (window as any).printSeoValidation = printSeoValidation;
    (window as any).printDebugUrls = printDebugUrls;
  }
}
