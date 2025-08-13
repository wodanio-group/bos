
export default defineEventHandler(async (event) => {
  return {
    value: event.node.req.headers['x-forwarded-for'] 
      || getRequestIP(event) 
      || event.node.req.socket.remoteAddress 
      || null
  };
});
