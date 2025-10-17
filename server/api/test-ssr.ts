export default defineEventHandler((event) => {
  return {
    message: 'SSR is working',
    timestamp: new Date().toISOString(),
    url: event.node.req.url,
  };
});
