// middleware/noindex.ts
export default defineNuxtRouteMiddleware(() => {
  useHead({
    meta: [
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  });
});
