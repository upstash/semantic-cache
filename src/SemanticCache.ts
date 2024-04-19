import {Index} from "@upstash/vector";


class SemanticCache {
    private minProximity: number;
    private index: Index;


    constructor(vectorUrl: string, vectorToken: string, minProximity: number) {
        this.minProximity = minProximity;
        this.index = vectorUrl && vectorToken ? new Index({
            url: vectorUrl,
            token: vectorToken,
        }): new Index();
    }

    async get(key: string): Promise<string | null> {
        const res = await this.index.query({
            data: key,
            topK: 1,
            includeVectors: false,
            includeMetadata: true,
        });
        if(res.length > 0 && res[0].score > this.minProximity) {
            return res[0]?.metadata?.value as string;
        }
        return null;
    }

    async set(key: string, value: string): Promise<void> {
        await this.index.upsert({
            id: key,
            data: key,
            metadata: { value: value },
        });
    }

    async delete(key: string): Promise<number> {
        return (await this.index.delete(key)).deleted
    }


}

export { SemanticCache };
