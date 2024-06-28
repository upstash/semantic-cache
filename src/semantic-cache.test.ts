/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { afterEach, describe, expect, test } from "bun:test";
import { SemanticCache } from "./semantic-cache";
import { sleep } from "bun";
import { Index } from "@upstash/vector";

const PROXIMITY_THRESHOLD = 0.9;
const DELAY_MS = 1000;
const cache = new SemanticCache({
  index: new Index(),
  minProximity: PROXIMITY_THRESHOLD,
});

describe("semantic-cache", () => {
  afterEach(() => cache.flush());

  test("should return cached value successfully", async () => {
    const cachedValue = "paris";
    await cache.set("capital of france", cachedValue);
    await sleep(DELAY_MS);
    const result = await cache.get("france's capital");

    expect(result).toBe(cachedValue);
  });

  test("should return cached values in bulk successfully", async () => {
    const cacheValues = [
      {
        question: "capital of france",
        answer: "paris",
      },
      {
        question: "best drink on a hot day",
        answer: "water",
      },
    ];

    for await (const pair of cacheValues) {
      await cache.set(pair.question, pair.answer);
    }
    await sleep(DELAY_MS);

    const result = await cache.get(cacheValues.map((p) => p.question));
    expect(result).toEqual(cacheValues.map((p) => p.answer));
  });

  test("should return cached value successfully", async () => {
    const cachedValue1 = "water";
    const cachedValue2 = "H2O";

    await cache.set("best drink on a hot day", cachedValue1);
    await cache.set("chemical formula for water", cachedValue2);
    await sleep(DELAY_MS);

    const firstResult = await cache.get("what to drink when it's hot");
    const secondResult = await cache.get("what is water's chemical formula");

    expect(firstResult).toBe(cachedValue1);
    expect(secondResult).toBe(cachedValue2);
  });

  test("should return undefined when doesn't exist", async () => {
    const firstResult = await cache.get("what to drink when it's hot");

    expect(firstResult).toBeUndefined();
  });

  test("should delete cached value from cache", async () => {
    const cachedValue1 = "water";
    const key = "best drink on a hot day";

    await cache.set(key, cachedValue1);
    await sleep(DELAY_MS);

    let firstResult = await cache.get("what to drink when it's hot");
    expect(firstResult).toBe(cachedValue1);

    await cache.delete(key);
    firstResult = await cache.get("what to drink when it's hot");

    expect(firstResult).toBeUndefined();
  });

  test("should work with namespaces", async () => {
    const cache1 = new SemanticCache({
      index: new Index(),
      minProximity: PROXIMITY_THRESHOLD,
      namespace: "cache1",
    });

    const cache2 = new SemanticCache({
      index: new Index(),
      minProximity: PROXIMITY_THRESHOLD,
      namespace: "cache2",
    });

    const cachedValue1 = "water";
    const cachedValue2 = "H2O";

    await cache1.set("best drink on a hot day", cachedValue1);
    await cache2.set("chemical formula for water", cachedValue2);
    await sleep(DELAY_MS);

    const result1 = await cache1.get("what to drink when it's hot");
    const result2 = await cache2.get("what is water's chemical formula");

    expect(result1).toBe(cachedValue1);
    expect(result2).toBe(cachedValue2);

    // Cleanup
    await cache1.flush();
    await cache2.flush();
  });
});
