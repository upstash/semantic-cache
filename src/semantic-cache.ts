import type { Index } from "@upstash/vector"

type SemanticCacheConfig = {
  /**
   * A value between 0 and 1. If you set is to 1.0 then it acts like a hash map which means only exact lexical matches will be returned.
   * If you set it to 0.0 then it acts like a full text search query which means a value with the best proximity score (closest value) will be returned.
   * @default 0.9
   */
  minProximity: number
  /**
   * Upstash serverless vector client
   */
  index: Index
}

export class SemanticCache {
  private minProximity: number
  private index: Index

  constructor(config: SemanticCacheConfig) {
    this.minProximity = config.minProximity
    this.index = config.index
  }

  async get(key: string): Promise<string | undefined>
  async get(keys: string[]): Promise<(string | undefined)[]>

  async get(keyOrKeys: string | string[]): Promise<string | undefined | (string | undefined)[]> {
    if (typeof keyOrKeys === "string") {
      const result = await this.queryKey(keyOrKeys)
      return result
    }

    if (Array.isArray(keyOrKeys)) {
      // Multiple keys fetch
      const results = await Promise.all(keyOrKeys.map((key) => this.queryKey(key)))
      return results
    }
  }

  private async queryKey(key: string): Promise<string | undefined> {
    const result = await this.index.query({
      data: key,
      topK: 1,
      includeVectors: false,
      includeMetadata: true,
    })
    if (result.length > 0 && result[0].score > this.minProximity) {
      return result[0]?.metadata?.value as string
    }
    return
  }

  async set(key: string, value: string): Promise<void>
  async set(keys: string[], values: string[]): Promise<void>

  async set(keyOrKeys: string | string[], valueOrValues?: string | string[]): Promise<void> {
    if (typeof keyOrKeys === "string" && typeof valueOrValues === "string") {
      await this.index.upsert({
        id: keyOrKeys,
        data: keyOrKeys,
        metadata: { value: valueOrValues },
      })
    }

    if (Array.isArray(keyOrKeys) && Array.isArray(valueOrValues)) {
      const upserts = keyOrKeys.map((key, index) => ({
        id: key,
        data: key,
        metadata: { value: valueOrValues[index] },
      }))
      for (const upsert of upserts) {
        await this.index.upsert(upsert)
      }
    }
  }

  async delete(key: string): Promise<number> {
    const result = await this.index.delete(key)
    return result.deleted
  }

  async bulkDelete(keys: string[]): Promise<number> {
    const result = await this.index.delete(keys)
    return result.deleted
  }

  async flush(): Promise<void> {
    await this.index.reset()
  }
}
