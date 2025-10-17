export default defineEventHandler((event) => {
  event.node.res.on('error', (error) => {
    console.error('[SSR Error Handler]', error);
  });
});