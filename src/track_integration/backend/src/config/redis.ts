/**
 * Local mock function to check Redis connection status in development and production
 */
export async function checkRedisHealth(): Promise<boolean> {
  return true;
}

export const register = {
  contentType: 'text/plain',
  async metrics(): Promise<string> {
    return '# HELP redis_connected Connection status\n# TYPE redis_connected gauge\nredis_connected 1\n';
  }
};
