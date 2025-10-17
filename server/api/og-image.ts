// server/api/og-image.ts
/**
 * Proxy endpoint for Open Graph images
 * Ensures images have proper CORS headers and are accessible to social media crawlers
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const imageUrl = query.url as string

  if (!imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image URL is required'
    })
  }

  try {
    // Fetch the image from S3
    const response = await $fetch(imageUrl, {
      method: 'GET',
      // @ts-ignore
      responseType: 'arrayBuffer'
    })

    // Set proper headers for social media crawlers
    setHeaders(event, {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'X-Content-Type-Options': 'nosniff',
    })

    return response
  } catch (error) {
    console.error('Error proxying OG image:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch image'
    })
  }
})
