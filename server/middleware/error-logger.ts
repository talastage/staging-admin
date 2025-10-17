export default defineEventHandler((event) => {
  event.node.res.on('finish', () => {
    const statusCode = event.node.res.statusCode;
    if (statusCode >= 400) {
      console.error(`[SSR Error] ${event.node.req.method} ${event.node.req.url} - Status: ${statusCode}`);
    }
  });
});
