// composables/useProjectSeo.ts
import { useHead } from '#app'
import type { WatchProject } from '~/types/watch'

export const useProjectSeo = (project: Ref<WatchProject | null>, accessUuid: string) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.frontendUrl || 'https://talastage.com'
  const siteName = 'TalaStage'
  const defaultImage = `${baseUrl}/talastage_logo.png`

  const seoMeta = computed(() => {
    const currentProject = project.value

    const pageTitle = currentProject?.name || 'Watch Video on TalaStage'
    const creatorName = currentProject?.creator?.display_name || currentProject?.creator?.username || 'TalaStage Creator'
    const creatorUsername = currentProject?.creator?.username || ''
    const creatorUrl = creatorUsername ? `${baseUrl}/${creatorUsername}` : baseUrl

    const pageDescription = currentProject?.description
      ? `${currentProject.description.slice(0, 155)}...`
      : `Watch "${pageTitle}" by ${creatorName} on TalaStage. Your Stage to the World of Entertainment.`

    const pageImage = currentProject?.thumbnail_url
      ? (currentProject.thumbnail_url.startsWith('http')
          ? currentProject.thumbnail_url
          : `${baseUrl}${currentProject.thumbnail_url}`)
      : defaultImage

    const videoUrl = currentProject?.video_url || ''
    const hasValidVideo = videoUrl && videoUrl.startsWith('http')
    const videoDuration = currentProject?.duration || 0
    const videoType = videoUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'

    const pageUrl = `${baseUrl}/watch/${currentProject?.access_uuid || accessUuid}`

    const videoTags = currentProject
      ? [
          currentProject.type || 'video',
          creatorName,
          'entertainment',
          'streaming',
          siteName,
        ].filter(Boolean)
      : ['video', 'entertainment', siteName]
    const keywords = videoTags.join(', ')

    const publishedTime = currentProject?.premiering?.utc || new Date().toISOString()

    return {
      title: pageTitle,
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'description', content: pageDescription },
        { name: 'keywords', content: keywords },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: creatorName },
        
        { property: 'og:type', content: 'video.other' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:title', content: pageTitle },
        { property: 'og:description', content: pageDescription },
        { property: 'og:url', content: pageUrl },
        
        { property: 'og:image', content: pageImage },
        { property: 'og:image:secure_url', content: pageImage },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: pageTitle },
        
        ...(hasValidVideo ? [
          { property: 'og:video', content: videoUrl },
          { property: 'og:video:secure_url', content: videoUrl },
          { property: 'og:video:type', content: videoType },
          { property: 'og:video:width', content: '1920' },
          { property: 'og:video:height', content: '1080' },
          { property: 'video:duration', content: videoDuration.toString() },
          { property: 'video:release_date', content: publishedTime },
        ] : []),
        
        { name: 'twitter:card', content: hasValidVideo ? 'player' : 'summary_large_image' },
        { name: 'twitter:site', content: '@talastage' },
        { name: 'twitter:creator', content: '@talastage' },
        { name: 'twitter:title', content: pageTitle },
        { name: 'twitter:description', content: pageDescription },
        { name: 'twitter:image', content: pageImage },
        { name: 'twitter:image:alt', content: pageTitle },
        
        ...(hasValidVideo ? [
          { name: 'twitter:player', content: pageUrl },
          { name: 'twitter:player:width', content: '1920' },
          { name: 'twitter:player:height', content: '1080' },
          { name: 'twitter:player:stream', content: videoUrl },
          { name: 'twitter:player:stream:content_type', content: videoType },
        ] : []),
        
        { property: 'og:locale', content: 'en_US' },
      ],
      link: [
        { rel: 'canonical', href: pageUrl },
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            url: baseUrl,
            logo: defaultImage,
            sameAs: [
              'https://twitter.com/talastage',
              'https://facebook.com/talastage',
            ],
          }),
        },
        ...(hasValidVideo ? [{
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: pageTitle,
            description: pageDescription,
            thumbnailUrl: pageImage,
            uploadDate: publishedTime,
            duration: videoDuration ? `PT${videoDuration}S` : undefined,
            contentUrl: videoUrl,
            embedUrl: pageUrl,
            author: {
              '@type': 'Person',
              name: creatorName,
              url: creatorUrl,
            },
            publisher: {
              '@type': 'Organization',
              name: siteName,
              logo: {
                '@type': 'ImageObject',
                url: defaultImage,
              },
            },
            keywords: keywords,
          }),
        }] : [
          {
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: pageTitle,
              description: pageDescription,
              image: pageImage,
              url: pageUrl,
              author: {
                '@type': 'Person',
                name: creatorName,
                url: creatorUrl,
              },
            }),
          }
        ]),
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Watch',
                item: `${baseUrl}/watch`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: pageTitle,
                item: pageUrl,
              },
            ],
          }),
        },
      ],
    }
  })

  useHead(seoMeta)
}