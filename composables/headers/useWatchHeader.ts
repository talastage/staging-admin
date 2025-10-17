import { useHead } from "#app";
import { computed } from "vue";

export function useHeader(currentProject: any) {
  const title = computed(() =>
    currentProject?.value?.name
      ? `${currentProject.value.name} - Watch Now`
      : "Watch Project"
  );
  const description = computed(
    () =>
      currentProject?.value?.description ||
      "Explore and watch exciting projects on our platform."
  );
  const imageUrl = computed(
    () => currentProject?.value?.thumbnail_url || "/default-thumbnail.png"
  );
  const videoUrl = computed(() => currentProject?.value?.video_url || null);
  const pageUrl = computed(() => window.location.href);

  useHead({
    title: title.value,
    meta: [
      // Basic Meta
      { name: "description", content: description.value },

      // Open Graph
      { property: "og:title", content: title.value },
      { property: "og:description", content: description.value },
      { property: "og:image", content: imageUrl.value },
      { property: "og:url", content: pageUrl.value },
      {
        property: "og:type",
        content: videoUrl.value ? "video.other" : "article",
      },
      ...(videoUrl.value
        ? [
            { property: "og:video", content: videoUrl.value },
            { property: "og:video:secure_url", content: videoUrl.value },
            { property: "og:video:type", content: "video/mp4" },
          ]
        : []),

      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title.value },
      { name: "twitter:description", content: description.value },
      { name: "twitter:image", content: imageUrl.value },
      { name: "twitter:url", content: pageUrl.value },
    ],
  });
}
