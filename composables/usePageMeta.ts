// composables/usePageMeta.ts
interface PageMetaOptions {
  title: string | ComputedRef<string>
  description: string | ComputedRef<string>
  // Open Graph
  ogTitle?: string | ComputedRef<string>
  ogDescription?: string | ComputedRef<string>
  ogImage?: string | ComputedRef<string>
  ogUrl?: string
  ogType?: string
  // Twitter
  twitterTitle?: string | ComputedRef<string>
  twitterDescription?: string | ComputedRef<string>
  twitterImage?: string | ComputedRef<string>
  twitterCard?: string
  // Additional
  keywords?: string
  author?: string
  noIndex?: boolean
  additionalMeta?: Record<string, any>
}

export function usePageMeta(options: PageMetaOptions) {
  const config = useRuntimeConfig()

  useHead({
    title: options.title,
    meta: [
      { name: 'description', content: options.description },

      // Open Graph / Facebook
      { property: 'og:title', content: options.ogTitle || options.title },
      {
        property: 'og:description',
        content: options.ogDescription || options.description,
      },
      { property: 'og:image', content: options.ogImage },
      { property: 'og:url', content: options.ogUrl },
      { property: 'og:type', content: options.ogType || 'website' },

      // Twitter
      {
        name: 'twitter:card',
        content: options.twitterCard || 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: options.twitterTitle || options.ogTitle || options.title,
      },
      {
        name: 'twitter:description',
        content:
          options.twitterDescription ||
          options.ogDescription ||
          options.description,
      },
      {
        name: 'twitter:image',
        content: options.twitterImage || options.ogImage,
      },

      // Additional meta tags
      ...(options.keywords
        ? [{ name: 'keywords', content: options.keywords }]
        : []),
      ...(options.author ? [{ name: 'author', content: options.author }] : []),
      ...(options.noIndex
        ? [{ name: 'robots', content: 'noindex, nofollow' }]
        : []),

      // Additional custom meta tags
      ...Object.entries(options.additionalMeta || {}).map(
        ([name, content]) => ({
          name,
          content,
        })
      ),
    ].filter((meta) => meta.content != null), // Remove meta tags with null/undefined content
  })
}
