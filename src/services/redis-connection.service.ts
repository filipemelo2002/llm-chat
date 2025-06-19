import { logger } from "@utils/logger.utils";
import Redis from "ioredis";

class RedisSingleton {
  private static instance: Redis;

  static getClient() {
    if (!RedisSingleton.instance) {
      logger.info("Creating instance of redis...")
      RedisSingleton.instance = new Redis({
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT) ?? 6379,
        maxRetriesPerRequest: null
      });
    }
    return RedisSingleton.instance
  }
}

export default RedisSingleton
