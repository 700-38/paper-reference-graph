import Redis from "ioredis"

class RedisConnection {
  connection: Redis;

  constructor(params: { host: string; port: number }) {
    this.connection = new Redis(params.port, params.host, {
      lazyConnect: true,
    });
  }

  async connect() {
    try {
      await this.connection.connect();
    } catch (error) {
      console.error(error);
      console.error(`Not connected to Redis Server`);
    }
  }

  async cacheHit(key: string) {
    try {
      return await this.connection.get(key);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async recordCache(key: string, value: string) {
    try {
      return await this.connection.set(key, value);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}